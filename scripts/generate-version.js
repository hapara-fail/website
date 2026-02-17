const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sanitizeCommitHash(value) {
  const str = String(value || '');
  return /^[0-9a-f]{7,40}$/i.test(str) ? str : 'unknown';
}

try {
  let commitHash = 'unknown';
  let commitMessage = 'unknown';

  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  } catch (e) {
    if (process.env.CF_PAGES_COMMIT_SHA) {
      commitHash = process.env.CF_PAGES_COMMIT_SHA.substring(0, 7);
      commitMessage = process.env.CF_PAGES_COMMIT_MESSAGE || 'Deployed via Cloudflare Pages';
    } else if (process.env.GITHUB_SHA) {
      commitHash = process.env.GITHUB_SHA.substring(0, 7);
      commitMessage = 'Deployed via GitHub Actions';
    } else if (process.env.CLOUDFLARE_BUILD_COMMIT) {
      commitHash = process.env.CLOUDFLARE_BUILD_COMMIT.substring(0, 7);
      commitMessage = 'Deployed via Cloudflare Workers';
    } else {
      console.warn('Failed to get git info:', e.message);
    }
  }

  commitHash = sanitizeCommitHash(commitHash);

  const outputPath = path.join(__dirname, '../src/site/js/version-data.js');

  // Only output the data — nav.js handles rendering
  const jsContent = `// Auto-generated – do not edit (${new Date().toISOString()})
window.__HAPARA_VERSION = ${JSON.stringify({ commit: commitHash, message: commitMessage })};
`;

  fs.writeFileSync(outputPath, jsContent);
  console.log(`Generated version-data.js: ${commitHash}`);
} catch (e) {
  console.error('Error generating version data:', e);
  process.exit(1);
}
