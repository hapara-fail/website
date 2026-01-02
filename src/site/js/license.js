// License page functionality

// Copy Function
function copyLicense() {
  const licenseText = document.getElementById('licenseText').innerText;

  navigator.clipboard
    .writeText(licenseText)
    .then(() => {
      const btn = document.getElementById('copyBtn');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
      btn.style.color = '#22c55e';
      btn.style.borderColor = '#22c55e';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 2000);
    })
    .catch((error) => {
      console.error('Failed to copy license text to clipboard:', error);
      const btn = document.getElementById('copyBtn');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = 'Copy failed';
        btn.style.color = '#ef4444';
        btn.style.borderColor = '#ef4444';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }
    });
}

// Fake Download Function
function saveLicenseAsFile() {
  const element = document.createElement('a');
  const licenseText = document.getElementById('licenseText').innerText;
  const file = new Blob([licenseText], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'LICENSE.txt';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyLicense);
  }

  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', saveLicenseAsFile);
  }
});
