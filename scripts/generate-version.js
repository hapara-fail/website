const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function sanitizeCommitHash(value) {
  const str = String(value || '');
  // Accept typical short/long git hashes: 7 to 40 hexadecimal characters
  const isValid = /^[0-9a-f]{7,40}$/i.test(str);
  return isValid ? str : 'unknown';
}

try {
  let commitHash = 'unknown';
  let commitMessage = 'unknown';

  // Try to get commit hash from various sources
  try {
    // 1. Try local git command
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  } catch (e) {
    // 2. Try common CI environment variables
    if (process.env.CF_PAGES_COMMIT_SHA) {
      commitHash = process.env.CF_PAGES_COMMIT_SHA.substring(0, 7);
      commitMessage = process.env.CF_PAGES_COMMIT_MESSAGE || 'Deployed via Cloudflare Pages';
    } else if (process.env.GITHUB_SHA) {
      commitHash = process.env.GITHUB_SHA.substring(0, 7);
      commitMessage = 'Deployed via GitHub Actions';
    } else if (process.env.CLOUDFLARE_BUILD_COMMIT) {
      // Cloudflare Workers builds might provide this
      commitHash = process.env.CLOUDFLARE_BUILD_COMMIT.substring(0, 7);
      commitMessage = 'Deployed via Cloudflare Workers';
    } else {
      console.warn(
        'Failed to get git info and no fallback environment variables found:',
        e.message
      );
    }
  }

  // Sanitize the commit hash to prevent injection or invalid values
  commitHash = sanitizeCommitHash(commitHash);

  const outputPath = path.join(__dirname, '../src/site/js/version.js');

  const jsContent = `/**
 * Auto-generated version info and footer injection.
 * Generated at: ${new Date().toISOString()}
 */
(function() {
    const DATA = {
        commit: ${JSON.stringify(commitHash)},
        message: ${JSON.stringify(commitMessage)}
    };
    
    // Expose for debugging
    window.haparaVersion = DATA;

    function init() {
        const footerText = document.querySelector('.nav-footer-text');
        if (!footerText) return;

        // Clear existing content (e.g. "Made with 💖")
        footerText.textContent = '';
        
        const container = document.createElement('div');
        container.className = 'version-footer';

        // Source Control Icon
        const svg = document.createElement('div');
        svg.className = 'version-footer-svg';
        svg.innerHTML = \`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"><path d="M21.007 8.222A3.738 3.738 0 0 0 15.045 5.2a3.737 3.737 0 0 0 1.156 6.583 2.988 2.988 0 0 1-2.668 1.67h-2.99a4.456 4.456 0 0 0-2.989 1.165V7.4a3.737 3.737 0 1 0-1.494 0v9.117a3.776 3.776 0 1 0 1.816.099 2.99 2.99 0 0 1 2.668-1.667h2.99a4.484 4.484 0 0 0 4.223-3.039 3.736 3.736 0 0 0 3.25-3.687zM4.565 3.738a2.242 2.242 0 1 1 4.484 0 2.242 2.242 0 0 1-4.484 0zm4.484 16.441a2.242 2.242 0 1 1-4.484 0 2.242 2.242 0 0 1 4.484 0zm8.221-9.715a2.242 2.242 0 1 1 0-4.485 2.242 2.242 0 0 1 0 4.485z"></path></svg>\`;

        // Commit Link
        const link = document.createElement('a');
        link.href = \`https://github.com/hapara-fail/website/commit/\${DATA.commit}\`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = DATA.commit;
        link.className = 'version-footer-link';

        // Separator
        const sep = document.createElement('span');
        sep.textContent = '•';
        sep.className = 'version-footer-sep';

        // Message
        const msg = document.createElement('span');
        msg.textContent = DATA.message;
        msg.className = 'version-footer-msg';
        msg.title = DATA.message; // Tooltip for full message

        container.appendChild(svg);
        container.appendChild(link);
        container.appendChild(sep);
        container.appendChild(msg);

        footerText.appendChild(container);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();`;

  fs.writeFileSync(outputPath, jsContent);
  console.log(`Generated version.js: ${commitHash}`);
} catch (e) {
  console.error('Error generating version data:', e);
  process.exit(1);
}
