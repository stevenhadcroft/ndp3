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
    const ymlPath = path.join(__dirname, '../out/latest-mac.yml');

    try {
        // Get the release by tag
        const { data: release } = await octokit.repos.getReleaseByTag({
            owner,
            repo,
            tag: `v${packageVersion}`
        });

        // Upload the YML file
        const ymlContent = fs.readFileSync(ymlPath);
        await octokit.repos.uploadReleaseAsset({
            owner,
            repo,
            release_id: release.id,
            name: 'latest-mac.yml',
            data: ymlContent,
            headers: {
                'content-type': 'application/x-yaml',
                'content-length': ymlContent.length
            }
        });

        console.log('✅ Successfully uploaded latest-mac.yml');
    } catch (error) {
        console.error('❌ Error uploading YML:', error);
        process.exit(1);
    }
}

uploadYml();