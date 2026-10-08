// electron-updater's Windows autoUpdater (NsisUpdater) only knows how to download/launch
// NSIS-built installers (.exe with /S silent flags) - it has no support for MSI. Since we
// ship a WiX MSI on Windows, updates are checked/downloaded/installed here instead, using
// the plain GitHub Releases API and the same latest.yml that generate-yml.js/upload-yml.js
// already publish. macOS keeps using electron-updater's MacUpdater untouched (see main.js).

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const USER_AGENT = 'NDP3-Speech-Builder-Updater';
const MAX_REDIRECTS = 5;

function httpGetJson(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/vnd.github+json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume();
        httpGetJson(res.headers.location, redirectsLeft - 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Request to ${url} failed with status ${res.statusCode}`));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
}

function httpDownloadFile(url, destPath, onProgress, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume();
        httpDownloadFile(res.headers.location, destPath, onProgress, redirectsLeft - 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Download from ${url} failed with status ${res.statusCode}`));
        return;
      }

      const total = parseInt(res.headers['content-length'], 10) || 0;
      let transferred = 0;
      const startTime = Date.now();
      const fileStream = fs.createWriteStream(destPath);

      res.on('data', (chunk) => {
        transferred += chunk.length;
        if (onProgress) {
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          onProgress({
            transferred,
            total,
            percent: total ? (transferred / total) * 100 : 0,
            bytesPerSecond: elapsedSeconds > 0 ? transferred / elapsedSeconds : 0,
          });
        }
      });

      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(() => resolve()));
      fileStream.on('error', reject);
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

function sha512OfFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('base64')));
    stream.on('error', reject);
  });
}

function isNewerVersion(remoteVersion, currentVersion) {
  const toParts = (v) => String(v).split('.').map((n) => parseInt(n, 10) || 0);
  const remote = toParts(remoteVersion);
  const current = toParts(currentVersion);
  for (let i = 0; i < Math.max(remote.length, current.length); i++) {
    const r = remote[i] || 0;
    const c = current[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Waits for this process to exit, then runs the MSI silently (per-user install mode needs
// no elevation) and relaunches the app - mirroring what an NSIS/Squirrel updater does internally.
function installMsiAndRelaunch({ msiPath, log, app }) {
  const exePath = process.execPath;
  const logPath = path.join(app.getPath('temp'), 'ndp3-msi-update.log');

  const psCommand = [
    `Wait-Process -Id ${process.pid} -ErrorAction SilentlyContinue`,
    `Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', ${psQuote(msiPath)}, '/quiet', '/norestart', '/l*v', ${psQuote(logPath)} -Wait`,
    `Start-Process -FilePath ${psQuote(exePath)}`,
  ].join('; ');

  log.info('Launching silent MSI update:', psCommand);

  spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', psCommand], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref();

  app.quit();
}

function initWindowsMsiUpdater({ app, dialog, log, sendToRenderer, owner, repo }) {
  let downloadInProgress = false;

  async function downloadAndInstall(msiAsset, ymlInfo) {
    const destPath = path.join(app.getPath('temp'), `NDP3-Speech-Builder-Update-${ymlInfo.version}.msi`);

    try {
      await httpDownloadFile(msiAsset.browser_download_url, destPath, (progress) => {
        sendToRenderer('download-progress', { ...progress, version: ymlInfo.version });
      });

      const actualSha512 = await sha512OfFile(destPath);
      if (ymlInfo.sha512 && actualSha512 !== ymlInfo.sha512) {
        throw new Error('Downloaded update failed checksum verification');
      }

      downloadInProgress = false;

      const { response } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Install Now'],
        title: 'Update Ready',
        message: `Version ${ymlInfo.version} is ready to install`,
        detail: 'The application will restart to apply the update.',
      });

      if (response === 0) {
        installMsiAndRelaunch({ msiPath: destPath, log, app });
      }
    } catch (err) {
      downloadInProgress = false;
      log.error('MSI update download/install failed:', err);
      sendToRenderer('update-error', { message: err.message || 'Unknown error' });
      dialog.showMessageBox({
        type: 'error',
        buttons: ['OK'],
        title: 'Update Failed',
        message: 'An error occurred during the update',
        detail: err.message || 'Unknown error',
      });
      fs.unlink(destPath, () => {});
    }
  }

  return async function checkForUpdates() {
    if (downloadInProgress) return;

    try {
      const release = await httpGetJson(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
      const remoteVersion = String(release.tag_name || '').replace(/^v/, '');
      const currentVersion = app.getVersion();

      if (!remoteVersion || !isNewerVersion(remoteVersion, currentVersion)) {
        return;
      }

      const ymlAsset = (release.assets || []).find((a) => a.name === 'latest.yml');
      if (!ymlAsset) {
        log.warn('MSI update check: no latest.yml asset found on release', release.tag_name);
        return;
      }

      const ymlInfo = await httpGetJson(ymlAsset.browser_download_url);
      const msiAsset = (release.assets || []).find((a) => a.name === ymlInfo.path);
      if (!msiAsset) {
        log.warn('MSI update check: no matching MSI asset found for', ymlInfo.path);
        return;
      }

      log.info('Update available:', ymlInfo);

      const { response } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Download', 'Later'],
        title: 'Application Update',
        message: `Version ${ymlInfo.version} is available`,
        detail: 'Would you like to download the update?',
      });

      if (response !== 0) return;

      downloadInProgress = true;
      await downloadAndInstall(msiAsset, ymlInfo);
    } catch (err) {
      log.error('MSI update check failed:', err);
    }
  };
}

module.exports = { initWindowsMsiUpdater, isNewerVersion };
