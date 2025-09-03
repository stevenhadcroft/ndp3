
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function uploadYml() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const packageVersion = require('../package.json').version;
    const files = [
        { name: 'latest-mac.yml', path: path.join(__dirname, '../out/latest-mac.yml') },
        { name: 'latest.yml', path: path.join(__dirname, '../out/latest.yml') }
    ];

    try {
        // Get the release by tag
        const { data: release } = await octokit.repos.getReleaseByTag({
            owner,
            repo,
            tag: `v${packageVersion}`
        });

        for (const file of files) {
            if (fs.existsSync(file.path)) {
                const content = fs.readFileSync(file.path);
                await octokit.repos.uploadReleaseAsset({
                    owner,
                    repo,
                    release_id: release.id,
                    name: file.name,
                    data: content,
                    headers: {
                        'content-type': 'application/x-yaml',
                        'content-length': content.length
                    }
                });
                console.log(`✅ Successfully uploaded ${file.name}`);
            } else {
                console.warn(`⚠️ File not found: ${file.path}`);
            }
        }
    } catch (error) {
        console.error('❌ Error uploading YML:', error);
        process.exit(1);
    }
}

uploadYml();