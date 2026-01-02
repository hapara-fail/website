const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  let commitHash = 'unknown';
  let commitMessage = 'unknown';

  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
  } catch (e) {
    console.warn('Failed to get git info:', e.message);
  }

  const outputPath = path.join(__dirname, '../src/site/js/version.js');

  const jsContent = `/**
 * Auto-generated version info and footer injection.
 * Generated at: ${new Date().toISOString()}
 */
(function() {
    const DATA = {
        commit: "${commitHash}",
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
        container.style.marginTop = '0.5rem';
        container.style.fontSize = '0.75rem';
        container.style.opacity = '0.8';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '0.5rem';
        container.style.textAlign = 'center';
        container.style.flexWrap = 'wrap';
        container.style.fontFamily = 'monospace'; // Monospace for technical look

        // Source Control Icon
        const svg = document.createElement('div');
        svg.style.display = 'flex';
        svg.style.alignItems = 'center';
        svg.innerHTML = \`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"><path d="M21.007 8.222A3.738 3.738 0 0 0 15.045 5.2a3.737 3.737 0 0 0 1.156 6.583 2.988 2.988 0 0 1-2.668 1.67h-2.99a4.456 4.456 0 0 0-2.989 1.165V7.4a3.737 3.737 0 1 0-1.494 0v9.117a3.776 3.776 0 1 0 1.816.099 2.99 2.99 0 0 1 2.668-1.667h2.99a4.484 4.484 0 0 0 4.223-3.039 3.736 3.736 0 0 0 3.25-3.687zM4.565 3.738a2.242 2.242 0 1 1 4.484 0 2.242 2.242 0 0 1-4.484 0zm4.484 16.441a2.242 2.242 0 1 1-4.484 0 2.242 2.242 0 0 1 4.484 0zm8.221-9.715a2.242 2.242 0 1 1 0-4.485 2.242 2.242 0 0 1 0 4.485z"></path></svg>\`;

        // Commit Link
        const link = document.createElement('a');
        link.href = \`https://github.com/hapara-fail/website/commit/\${DATA.commit}\`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = DATA.commit;
        link.style.color = 'inherit';
        link.style.textDecoration = 'none';
        link.style.borderBottom = '1px solid transparent';
        link.style.transition = 'all 0.2s ease';
        
        // Hover effect logic
        link.addEventListener('mouseenter', () => {
            link.style.color = '#fff';
            link.style.borderBottomColor = '#fff';
            link.style.textShadow = '0 0 8px rgba(255,255,255,0.5)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.color = 'inherit';
            link.style.borderBottomColor = 'transparent';
            link.style.textShadow = 'none';
        });

        // Separator
        const sep = document.createElement('span');
        sep.textContent = '•';
        sep.style.opacity = '0.5';

        // Message
        const msg = document.createElement('span');
        msg.textContent = DATA.message;
        msg.style.fontStyle = 'italic';
        msg.style.opacity = '0.8';
        msg.style.maxWidth = '200px';
        msg.style.overflow = 'hidden';
        msg.style.textOverflow = 'ellipsis';
        msg.style.whiteSpace = 'nowrap';
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
