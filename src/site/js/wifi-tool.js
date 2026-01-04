document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('wizard-back-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const progressContainer = document.querySelector('.wizard-progress');
  const nav = document.querySelector('.wizard-nav');
  let currentWizard = null;
  let currentStepIndex = -1;
  let isAnimating = false;
  const wizardPaths = {
    sipe: ['sipe-1', 'sipe-2', 'sipe-3', 'sipe-4'],
    nppe: ['nppe-1', 'nppe-2', 'nppe-3'],
  };

  const updateWizardState = () => {
    if (isAnimating) return;

    const previousActiveStep = document.querySelector('.wizard-step.active');

    let nextActiveStep;
    if (!currentWizard) {
      nextActiveStep = document.querySelector('.wizard-step[data-step="select"]');
    } else {
      const path = wizardPaths[currentWizard];
      const activeStepId = path[currentStepIndex];
      nextActiveStep = document.querySelector(`.wizard-step[data-step="${activeStepId}"]`);
    }

    if (previousActiveStep === nextActiveStep) return;

    isAnimating = true;

    const animationDuration = 350;

    const finishTransition = () => {
      if (previousActiveStep) {
        previousActiveStep.classList.remove('active', 'is-exiting');
      }
      if (nextActiveStep) {
        nextActiveStep.classList.add('active');
      }
      isAnimating = false;
    };

    if (previousActiveStep) {
      previousActiveStep.classList.add('is-exiting');
      setTimeout(finishTransition, animationDuration);
    } else {
      finishTransition();
    }

    if (!currentWizard) {
      nav.style.display = 'none';
      progressContainer.innerHTML = '';
    } else {
      nav.style.display = 'flex';
      const path = wizardPaths[currentWizard];
      progressContainer.innerHTML = path
        .map((_, index) => `<div class="progress-step" data-step-index="${index}"></div>`)
        .join('');
      const progressSteps = progressContainer.querySelectorAll('.progress-step');
      progressSteps.forEach((step, index) => {
        if (index < currentStepIndex) step.classList.add('completed');
        else if (index === currentStepIndex) step.classList.add('active');
      });

      if (currentStepIndex === path.length - 1) {
        nextBtn.textContent = currentWizard === 'sipe' ? 'Extract' : 'Analyze';
      } else {
        nextBtn.textContent = 'Next';
      }
    }
  };

  document.getElementById('select-sipe').addEventListener('click', () => {
    if (isAnimating) return;
    currentWizard = 'sipe';
    currentStepIndex = 0;
    updateWizardState();
  });
  document.getElementById('select-nppe').addEventListener('click', () => {
    if (isAnimating) return;
    currentWizard = 'nppe';
    currentStepIndex = 0;
    updateWizardState();
  });

  nextBtn.addEventListener('click', () => {
    if (isAnimating) return;
    const path = wizardPaths[currentWizard];
    if (currentStepIndex < path.length - 1) {
      currentStepIndex++;
      updateWizardState();
    } else {
      if (currentWizard === 'sipe') extractSipe();
      if (currentWizard === 'nppe') {
        const file = nppeFileInput.files[0];
        if (!file) {
          showNotification('File Missing', 'Please upload a log file first.', 'error');
          return;
        }
        analyzeNppeLog(file);
      }
    }
  });

  backBtn.addEventListener('click', () => {
    if (isAnimating) return;
    if (currentStepIndex > 0) {
      currentStepIndex--;
    } else {
      currentWizard = null;
    }
    updateWizardState();
  });

  const notificationContainer = document.getElementById('notification-container');
  const icons = {
    error: `<svg class="notification-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`,
    success: `<svg class="notification-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
  };
  function showNotification(title, message, type = 'error', persistent = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `${icons[type]}<div class="notification-content"><div class="notification-title">${title}</div><div class="notification-message">${message}</div></div><button class="notification-close">&times;</button>`;
    notificationContainer.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    const hideAndRemove = () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    };

    notification.querySelector('.notification-close').addEventListener('click', hideAndRemove);

    if (!persistent) {
      setTimeout(hideAndRemove, 5000);
    }
  }

  const sipeSsidInput = document.getElementById('sipe-ssid-input');
  const sipeSearchTermOutput = document.getElementById('sipe-search-term-output');
  const sipeJsonInput = document.getElementById('sipe_input');

  function hexEncode(text) {
    return text
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
  function hexDecode(hex) {
    if (!hex || typeof hex !== 'string' || !/^[0-9A-Fa-f]*$/i.test(hex) || hex.length % 2 !== 0)
      return hex;
    try {
      return hex
        .match(/.{1,2}/g)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join('');
    } catch (e) {
      return hex;
    }
  }

  sipeSsidInput.addEventListener('input', () => {
    const ssid = sipeSsidInput.value.trim();
    sipeSearchTermOutput.innerHTML = '';
    if (ssid) {
      const searchTerm = `${hexEncode(ssid)}<||>psk`;
      const codeEl = document.createElement('code');
      codeEl.innerHTML = searchTerm;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.setAttribute('aria-label', 'Copy search term');
      copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="copied-message">Copied!</span>
            `;

      copyBtn.addEventListener('click', () => {
        navigator.clipboard
          .writeText(searchTerm)
          .then(() => {
            const prefersReducedMotion = window.matchMedia(
              '(prefers-reduced-motion: reduce)'
            ).matches;
            if (prefersReducedMotion) return;

            copyBtn.classList.remove('pulsing');
            void copyBtn.offsetWidth;
            copyBtn.classList.add('pulsing');

            const copiedMessage = copyBtn.querySelector('.copied-message');
            if (copiedMessage) {
              copiedMessage.classList.add('show');
              setTimeout(() => {
                copiedMessage.classList.remove('show');
              }, 1500);
            }
          })
          .catch((err) => {
            console.error('Failed to copy search term: ', err);
            showNotification('Copy Failed', 'Could not copy text to clipboard.', 'error');
          });
      });

      sipeSearchTermOutput.append(codeEl, copyBtn);
    }
  });

  function isProbablyBase64(str) {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.length === 0 || trimmed.length % 4 !== 0) return false;
    // Only allow valid Base64 characters and up to two '=' paddings at the end
    return /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed);
  }

  function extractSipe() {
    const jsonData = sipeJsonInput.value.trim();
    if (!jsonData)
      return showNotification('Input Missing', 'Please paste the JSON data first.', 'error');

    try {
      const json = JSON.parse(jsonData);
      if (json?.SPECIFICS?.wifi_configuration?.passphrase) {
        const encodedPassphrase = json.SPECIFICS.wifi_configuration.passphrase;

        if (!isProbablyBase64(encodedPassphrase)) {
          throw new Error('WiFi passphrase is not valid Base64.');
        }

        const passphrase = atob(encodedPassphrase.trim());
        let ssid = 'SSID Not Found';
        if (json.NON_UNIQUE_NAME) {
          ssid = hexDecode(json.NON_UNIQUE_NAME.split('<')[0]);
        } else if (json.SPECIFICS.wifi_configuration.hex_ssid) {
          ssid = hexDecode(json.SPECIFICS.wifi_configuration.hex_ssid);
        }

        const credsMessage = `SSID: <code>${ssid}</code><br>Password: <code>${passphrase}</code>`;
        showNotification('Credentials Found', credsMessage, 'success', true);
      } else {
        throw new Error('Pasted JSON does not contain the required WiFi data.');
      }
    } catch (e) {
      showNotification('Extraction Error', e.message || 'Failed to process JSON.', 'error');
    }
  }

  const nppeFileInput = document.getElementById('nppe_file_input');
  const nppeOutputTable = document.getElementById('nppe_output_table');
  const fileNameDisplay = document.getElementById('file-name-display');

  nppeFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      fileNameDisplay.textContent = '';
      return;
    }
    fileNameDisplay.textContent = `Selected: ${file.name}`;
    nextBtn.click();
  });

  function analyzeNppeLog(file) {
    nppeOutputTable.innerHTML =
      '<thead><tr><th>SSID</th><th>Details</th><th>Security</th></tr></thead><tbody></tbody>';
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      try {
        const lines = e.target.result.split('\n');
        const keywords = [
          'ya0NvbmZpZ3VyYXRpb2',
          'vcmtDb25maWd1cmF0aW',
          'rQ29uZmlndXJhdGlvbn',
          'Db25maWd1cmF0aW9ucw',
        ];
        let networksFound = 0;
        let lineErrors = 0;

        for (const line of lines) {
          try {
            if (!keywords.some((keyword) => line.includes(keyword))) continue;
            const lineJson = JSON.parse(line);
            if (lineJson?.params?.bytes) {
              const decodedBytes = atob(lineJson.params.bytes);
              const networkConfigsMatch = decodedBytes.match(
                /"NetworkConfigurations"\s*:\s*(\[(?:[^[\]]|(?:\[[^[\]]*\]))*\])/
              );
              if (networkConfigsMatch?.[1]) {
                const networkConfigs = JSON.parse(networkConfigsMatch[1]);
                const tableBody = nppeOutputTable.querySelector('tbody');
                for (const config of networkConfigs) {
                  if (config?.WiFi?.SSID) {
                    networksFound++;
                    const row = tableBody.insertRow();
                    row.insertCell(0).textContent = config.WiFi.SSID;
                    let details = 'N/A';
                    if (config.WiFi.Passphrase) {
                      details = `${config.WiFi.Passphrase}`;
                    } else if (config.WiFi.EAP) {
                      details = `Type: ${config.WiFi.EAP.Outer || 'N/A'}, Identity: ${config.WiFi.EAP.Identity || 'N/A'}`;
                    }
                    row.insertCell(1).textContent = details;
                    row.insertCell(2).textContent = config.WiFi.Security || 'Unknown';
                  }
                }
              }
            }
          } catch (lineError) {
            lineErrors++;
            // Optionally log for debugging without interrupting processing:
            // console.warn('Failed to process log line:', lineError);
          }
        }
        if (networksFound === 0)
          throw new Error(
            "No network configurations found in log. Ensure 'Include raw bytes' was on and policies were reloaded."
          );
        showNotification(
          'Analysis Complete',
          `Found ${networksFound} network configuration(s).`,
          'success'
        );
      } catch (err) {
        showNotification('Analysis Error', err.message || 'Failed to analyze log file.', 'error');
      }
    };
    reader.onerror = () =>
      showNotification('File Error', 'Could not read the uploaded file.', 'error');
  }
  nav.style.display = 'none';
});
