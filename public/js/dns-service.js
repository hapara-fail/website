document.addEventListener('astro:page-load', () => {
  // --- TABS & OS DETECTION SCRIPT ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabsNav = document.querySelector('.tabs-nav');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabUnderline = document.querySelector('.tab-underline');
  const tabsWrapper = document.querySelector('.tabs-content-wrapper');
  const osDetectionMessage = document.getElementById('os-detection-message');
  // Small delay to allow the browser to apply CSS transition classes
  // before we remove the slide direction helper classes.
  const TAB_TRANSITION_CLEANUP_DELAY_MS = 10;

  const DNS_MONITOR_ALLOWED_CONTENT_TYPES = ['application/json', 'text/plain'];

  const moveUnderline = (targetTab) => {
    if (!targetTab || !tabUnderline) return;
    const navRect = tabsNav.getBoundingClientRect();
    const targetRect = targetTab.getBoundingClientRect();
    const newWidth = targetRect.width;
    // Account for scroll position when calculating left position
    const newLeft = targetRect.left - navRect.left + tabsNav.scrollLeft;
    tabUnderline.style.width = `${newWidth}px`;
    tabUnderline.style.transform = `translateX(${newLeft}px)`;
  };

  const updateContainerHeight = (contentElement) => {
    if (!tabsWrapper || !contentElement) return;
    // Use a small timeout to allow for DOM updates/animations if needed,
    // though immediate is usually better for responsiveness.
    // We get the height of the content plus padding/border if any.
    // Since .tab-content is absolute, we need to explicitly set wrapper height.
    const height = contentElement.scrollHeight;
    tabsWrapper.style.height = `${height}px`;
  };

  const setActiveTab = (targetId, isInitial = false) => {
    const currentActiveButton = document.querySelector('.tab-button.active');
    const newActiveButton = document.querySelector(`.tab-button[data-target="${targetId}"]`);

    // Always update height even if same tab to be safe (e.g. on resize)
    const newActiveContent = document.getElementById(targetId);

    if (newActiveButton && !isInitial) {
      // Scroll into view logic - only when user manually switches tabs
      newActiveButton.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }

    if (currentActiveButton === newActiveButton) {
      if (newActiveContent) updateContainerHeight(newActiveContent);
      return;
    }

    const currentActiveContent = document.querySelector('.tab-content.active');

    tabButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
      const panel = document.getElementById(btn.dataset.target);
      if (panel) {
        panel.hidden = true;
        panel.classList.remove('active', 'is-exiting', 'slide-from-right', 'slide-from-left');
      }
    });
    if (newActiveButton) {
      newActiveButton.classList.add('active');
      newActiveButton.setAttribute('aria-selected', 'true');
      newActiveButton.setAttribute('tabindex', '0');
    }
    moveUnderline(newActiveButton);

    if (newActiveContent) newActiveContent.hidden = false;

    if (currentActiveContent && !isInitial && !prefersReducedMotion) {
      let currentIndex = -1;
      let newIndex = -1;

      tabButtons.forEach((btn, idx) => {
        if (btn === currentActiveButton) currentIndex = idx;
        if (btn === newActiveButton) newIndex = idx;
      });
      const directionClass = newIndex > currentIndex ? 'slide-from-right' : 'slide-from-left';

      currentActiveContent.classList.add('is-exiting');
      newActiveContent.classList.add(directionClass);

      setTimeout(() => {
        currentActiveContent.classList.remove('active', 'is-exiting');
        newActiveContent.classList.add('active');
        // Use a small delay so the browser can apply the slide transition
        setTimeout(
          () => newActiveContent.classList.remove('slide-from-right', 'slide-from-left'),
          TAB_TRANSITION_CLEANUP_DELAY_MS
        );
      }, 50);
    } else if (newActiveContent) {
      newActiveContent.classList.add('active');
    }

    if (newActiveContent) {
      // Update height immediately
      updateContainerHeight(newActiveContent);
    }
  };

  tabButtons.forEach((tab) => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.target));
  });

  // Keyboard navigation for tabs (Arrow Left/Right, Home/End)
  if (tabsNav) {
    tabsNav.addEventListener('keydown', (e) => {
      const tabs = Array.from(tabButtons);
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let newIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }

      tabs[newIndex].focus();
      setActiveTab(tabs[newIndex].dataset.target);
    });
  }

  function detectOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    if (userAgent.includes('cros')) return 'chromeos';
    if (/mac|macintel|macppc|mac68k/.test(platform)) return 'macos';
    if (/win32|win64|windows|wince/.test(platform)) return 'windows';
    if (
      /iphone|ipad|ipod/.test(platform) ||
      (userAgent.includes('mac') && 'ontouchend' in document)
    )
      return 'ios';
    if (/android/.test(userAgent)) return 'android';
    if (/linux/.test(platform)) return 'linux';
    return null;
  }

  function initializeTabs() {
    const detectedOS = detectOS();
    let targetTabId = 'chromeos';
    let message = "We couldn't automatically detect your OS. Please select it from the list.";

    if (detectedOS) {
      targetTabId = detectedOS;
      const osMap = {
        chromeos: 'ChromeOS',
        windows: 'Windows',
        macos: 'macOS',
        ios: 'iOS / iPadOS',
        android: 'Android',
        linux: 'Linux',
      };
      message = `We've detected you're on <strong>${osMap[detectedOS]}</strong> and have selected the relevant instructions for you.`;
    }

    setActiveTab(targetTabId, true);
    if (osDetectionMessage) osDetectionMessage.innerHTML = message;
  }

  initializeTabs();

  // --- MOBILE ARROWS + FADES SYSTEM ---
  // tabsWrapper is already declared above
  const leftArrow = document.querySelector('.tabs-arrow--left');
  const rightArrow = document.querySelector('.tabs-arrow--right');

  const updateArrowsAndFades = () => {
    if (!tabsWrapper || !tabsNav) return;
    const atStart = tabsNav.scrollLeft <= 1;
    const atEnd = tabsNav.scrollLeft + tabsNav.clientWidth >= tabsNav.scrollWidth - 1;

    if (window.innerWidth <= 768) {
      if (leftArrow) leftArrow.hidden = atStart;
      if (rightArrow) rightArrow.hidden = atEnd;
    } else {
      if (leftArrow) leftArrow.hidden = true;
      if (rightArrow) rightArrow.hidden = true;
    }
  };

  const smoothScrollBy = (container, delta) => {
    container.scrollBy({ left: delta, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  if (leftArrow && rightArrow && tabsNav) {
    leftArrow.addEventListener('click', () =>
      smoothScrollBy(tabsNav, -Math.round(tabsNav.clientWidth * 0.6))
    );
    rightArrow.addEventListener('click', () =>
      smoothScrollBy(tabsNav, Math.round(tabsNav.clientWidth * 0.6))
    );
  }

  const handleTabsScroll = () => {
    updateArrowsAndFades();
  };

  const handleResize = () => {
    // realign underline on resize
    const activeButton = document.querySelector('.tab-button.active');
    if (activeButton) moveUnderline(activeButton);
    updateArrowsAndFades();

    // Recalculate height on resize
    const activeContent = document.querySelector('.tab-content.active');
    if (activeContent) updateContainerHeight(activeContent);
  };

  if (tabsNav) {
    tabsNav.addEventListener('scroll', handleTabsScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    // initial state
    updateArrowsAndFades();
  }

  // --- DNS MODAL LOGIC ---
  const viewIpsBtn = document.getElementById('view-ips-btn');
  const modalOverlay = document.getElementById('dns-modal-overlay');
  const modalCloseBtn = document.getElementById('dns-modal-close');
  const modalDialog = modalOverlay ? modalOverlay.querySelector('.dns-modal') : null;
  const modalStatus = document.getElementById('dns-modal-status');
  const stepTos = document.getElementById('dns-step-tos');
  const stepInfo = document.getElementById('dns-step-info');
  const tosCheckbox = document.getElementById('tos-agreement-checkbox');
  const tosProceedBtn = document.getElementById('tos-proceed-btn');

  // Helper to get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // Helper to set cookie (max-age in seconds, 31536000 = 1 year)
  const setCookie = (name, value, maxAge) => {
    let cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
      cookie += '; Secure';
    }
    document.cookie = cookie;
  };

  let modalLastFocused = null;
  const focusableSelectors =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getModalFocusable = () => {
    if (!modalDialog) return [];
    return Array.from(modalDialog.querySelectorAll(focusableSelectors)).filter((el) => {
      if (el.hidden || el.closest('[hidden]')) return false;
      return el.getClientRects().length > 0;
    });
  };

  const announceModalStatus = (message) => {
    if (modalStatus) modalStatus.textContent = message;
  };

  const openModal = () => {
    if (!modalOverlay) return;
    modalLastFocused = document.activeElement;

    // Reset states
    if (tosCheckbox) tosCheckbox.checked = false;

    // Check if ToS was already accepted
    const tosAccepted = getCookie('dns_tos_accepted');

    if (tosAccepted === 'true') {
      // Show Info directly
      if (stepTos) stepTos.hidden = true;
      if (stepInfo) {
        stepInfo.hidden = false;
        stepInfo.classList.remove('fade-out');
      }
      if (modalDialog) {
        modalDialog.setAttribute('aria-labelledby', 'dns-modal-info-title');
        modalDialog.setAttribute('aria-describedby', 'dns-modal-info-description');
      }
      announceModalStatus('DNS addresses are ready to copy.');
    } else {
      // Show ToS
      if (stepInfo) stepInfo.hidden = true;
      if (stepTos) {
        stepTos.hidden = false;
        stepTos.classList.remove('fade-out');
      }

      // Disable button initially
      if (tosProceedBtn) {
        tosProceedBtn.disabled = true;
        tosProceedBtn.classList.add('cta-button--disabled');
      }
      if (modalDialog) {
        modalDialog.setAttribute('aria-labelledby', 'dns-modal-title');
        modalDialog.setAttribute('aria-describedby', 'dns-modal-description');
      }
      announceModalStatus('Review the service agreement before viewing DNS addresses.');
    }

    modalOverlay.hidden = false;
    document.body.classList.add('body-lock');

    // Focus the first focusable element in the modal
    requestAnimationFrame(() => {
      const firstFocusable = getModalFocusable()[0];
      if (firstFocusable) firstFocusable.focus();
    });

    // Add keyboard handlers
    document.addEventListener('keydown', onModalKeyDown);
    document.addEventListener('focusin', trapModalFocus);

    // Check DNS status when modal opens (or when we proceed to info)
    if (tosAccepted === 'true') {
      checkDnsStatus();
    }
  };

  const checkServerStatus = async (monitorUrl, statusTagId) => {
    const statusTag = document.getElementById(statusTagId);
    if (!statusTag) return;

    const statusText = statusTag.querySelector('.status-text');

    // Reset state
    statusTag.className = 'dns-status-tag';
    if (statusText) statusText.textContent = 'Checking...';
    statusTag.setAttribute('aria-label', 'DNS server status: checking');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(monitorUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Validate that the response origin matches the expected monitor origin
      const expectedOrigin = new URL(monitorUrl).origin;
      const actualOrigin = new URL(response.url).origin;
      if (actualOrigin !== expectedOrigin) {
        throw new Error('Unexpected response origin: ' + actualOrigin);
      }

      // Basic HTTP status and content-type validation
      if (!response.ok) {
        throw new Error('Unexpected response status: ' + response.status);
      }

      const contentType = response.headers.get('content-type') || '';
      const mimeType = contentType.split(';', 1)[0].trim().toLowerCase();

      if (!DNS_MONITOR_ALLOWED_CONTENT_TYPES.includes(mimeType)) {
        throw new Error('Unexpected content type: ' + contentType);
      }

      statusTag.classList.add('status-up');
      if (statusText) statusText.textContent = 'Operational';
      statusTag.setAttribute('aria-label', 'DNS server status: operational');
    } catch (error) {
      console.error('DNS Status Check Failed (' + statusTagId + '):', error);
      statusTag.classList.add('status-down');
      if (statusText) statusText.textContent = 'Service Issue';
      statusTag.setAttribute('aria-label', 'DNS server status: service issue');
    }
  };

  const checkDnsStatus = () => {
    checkServerStatus('https://monitor.dns.hapara.fail/', 'dns-status-tag');
    checkServerStatus('https://monitor.dns2.hapara.fail/', 'dns2-status-tag');
  };

  const onModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getModalFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const trapModalFocus = (e) => {
    if (!modalDialog || modalOverlay.hidden) return;
    if (!modalDialog.contains(e.target)) {
      const firstFocusable = getModalFocusable()[0];
      if (firstFocusable) firstFocusable.focus();
    }
  };

  const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    document.body.classList.remove('body-lock');

    // Remove keyboard handlers
    document.removeEventListener('keydown', onModalKeyDown);
    document.removeEventListener('focusin', trapModalFocus);

    // Reset transitions
    if (stepTos) stepTos.classList.remove('fade-out', 'fade-in');
    if (stepInfo) stepInfo.classList.remove('fade-out', 'fade-in');
    announceModalStatus('');

    // Return focus to trigger
    if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
      modalLastFocused.focus();
    }
  };

  if (viewIpsBtn) {
    viewIpsBtn.addEventListener('click', openModal);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close on click outside (overlay)
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // ToS Checkbox Logic
  if (tosCheckbox && tosProceedBtn) {
    tosCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        tosProceedBtn.disabled = false;
        tosProceedBtn.classList.remove('cta-button--disabled');
      } else {
        tosProceedBtn.disabled = true;
        tosProceedBtn.classList.add('cta-button--disabled');
      }
    });
  }

  // Proceed Button Logic with Transition
  if (tosProceedBtn) {
    tosProceedBtn.addEventListener('click', () => {
      setCookie('dns_tos_accepted', 'true', 31536000); // 1 year

      if (stepTos && stepInfo) {
        // Fade out ToS
        stepTos.classList.add('fade-out');

        setTimeout(() => {
          stepTos.hidden = true;
          stepInfo.hidden = false;
          stepInfo.classList.add('fade-in');
          if (modalDialog) {
            modalDialog.setAttribute('aria-labelledby', 'dns-modal-info-title');
            modalDialog.setAttribute('aria-describedby', 'dns-modal-info-description');
          }
          announceModalStatus('DNS addresses are ready to copy.');
          checkDnsStatus();

          // Small delay to allow fade-in class to apply before removing it/or letting CSS handle opacity
          requestAnimationFrame(() => {
            stepInfo.classList.remove('fade-in'); // This might just pop in if we don't have fade-in defined to start at 0
            const firstInfoControl = getModalFocusable()[0];
            if (firstInfoControl) firstInfoControl.focus();
          });
        }, 250); // Match CSS transition duration
      }
    });
  }

  // --- COPY BUTTON LOGIC ---
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSelector = btn.getAttribute('data-copy-target');
      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          const textToCopy = targetElement.innerText;
          navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
              // Success feedback
              const copiedMsg = btn.querySelector('.copied-message');

              // Add pulsing class
              btn.classList.add('pulsing');

              if (copiedMsg) {
                copiedMsg.setAttribute('role', 'status');
                copiedMsg.classList.add('show');
                setTimeout(() => {
                  copiedMsg.classList.remove('show');
                  btn.classList.remove('pulsing');
                }, 2000);
              }
              announceModalStatus('Copied to clipboard.');
            })
            .catch((err) => {
              console.error('Failed to copy text: ', err);
              announceModalStatus('Copy failed. Select and copy the address manually.');
            });
        }
      }
    });
  });

  // --- COMPATIBILITY CHECKER LOGIC ---
  let BLOCKED_SERVICES = [];
  let PATCHED_SERVICES = new Set();
  let activeCategoryFilter = null;

  const searchInput = document.getElementById('service-search');
  const serviceList = document.getElementById('service-list');
  const serviceResultsStatus = document.getElementById('service-results-status');
  const categoryChipsContainer = document.getElementById('category-chips');

  /**
   * Basic integrity / trust check for the downloaded blocklist content.
   * This is not a cryptographic guarantee, but it ensures that we only
   * proceed when the markdown has the expected stable structure and
   * markers we control.
   *
   * If you intentionally update the upstream blocklist format, update
   * these checks alongside the pinned URL below.
   */
  const isTrustedBlocklist = (text) => {
    if (typeof text !== 'string' || text.length === 0) {
      return false;
    }

    // Require the expected section header and at least one known category
    // marker to be present, so that arbitrary content cannot be silently
    // treated as a valid blocklist.
    const requiredHeader = '## 👁️ Services Targeted';
    const knownCategoryMarker = '#### Monitoring & Classroom Management'; // keep in sync with README.md

    if (!text.includes(requiredHeader)) {
      return false;
    }

    if (!text.includes(knownCategoryMarker)) {
      return false;
    }

    return true;
  };

  // --- Loading Skeleton ---
  const showLoadingSkeleton = () => {
    if (!serviceList) return;
    serviceList.innerHTML = '';
    serviceList.setAttribute('aria-busy', 'true');
    if (serviceResultsStatus) serviceResultsStatus.textContent = 'Loading services.';

    for (let g = 0; g < 3; g++) {
      const group = document.createElement('div');
      group.className = 'service-category-group skeleton-group';

      const header = document.createElement('div');
      header.className = 'skeleton-header skeleton-pulse';
      group.appendChild(header);

      const container = document.createElement('div');
      container.className = 'service-cards-container';

      for (let i = 0; i < 4; i++) {
        const card = document.createElement('div');
        card.className = 'service-card skeleton-card';

        const left = document.createElement('div');
        left.className = 'skeleton-name skeleton-pulse';

        const right = document.createElement('div');
        right.className = 'skeleton-status skeleton-pulse';

        card.appendChild(left);
        card.appendChild(right);
        container.appendChild(card);
      }

      group.appendChild(container);
      serviceList.appendChild(group);
    }
  };

  // --- Fuzzy Matching ---
  const fuzzyMatch = (query, text) => {
    const q = query.toLowerCase();
    const t = text.toLowerCase();

    // Exact substring match
    if (t.includes(q)) return { match: true, score: 1 };

    // Space-insensitive: remove spaces and compare
    const qNoSpace = q.replace(/\s+/g, '');
    const tNoSpace = t.replace(/\s+/g, '');
    if (tNoSpace.includes(qNoSpace)) return { match: true, score: 0.9 };

    // Multi-word: all query words appear somewhere in text
    const words = q.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 1) {
      // Single-word queries are perfectly handled by the exact and space-insensitive checks above.
      // If a single word reaches here, it means it's not an exact match, so we intentionally
      // let it fall through to character-skip matching to find typos or partial matches.
    } else if (words.length > 1 && words.every((w) => t.includes(w))) {
      return { match: true, score: 0.85 };
    }

    // Character-skip subsequence: all query chars appear in order
    if (qNoSpace.length >= 2) {
      let textIndex = 0;
      let matchedChars = 0;
      let consecutiveMatches = 0;
      let maxConsecutive = 0;

      for (
        let queryIndex = 0;
        queryIndex < qNoSpace.length && textIndex < tNoSpace.length;
        textIndex++
      ) {
        if (tNoSpace[textIndex] === qNoSpace[queryIndex]) {
          matchedChars++;
          queryIndex++;
          consecutiveMatches++;
          if (consecutiveMatches > maxConsecutive) maxConsecutive = consecutiveMatches;
        } else {
          consecutiveMatches = 0;
        }
      }

      if (matchedChars === qNoSpace.length) {
        // Boost score based on consecutive matches and starts-with bonus
        const consecutiveBonus = 0.15 * (maxConsecutive / qNoSpace.length);
        const startsWithBonus = tNoSpace.startsWith(qNoSpace[0]) ? 0.1 : 0;
        const score =
          0.4 + 0.2 * (matchedChars / tNoSpace.length) + consecutiveBonus + startsWithBonus;
        return { match: true, score: Math.min(score, 0.79) };
      }
    }

    return { match: false, score: 0 };
  };

  // --- URL Param Helpers ---
  const syncUrlParams = () => {
    const url = new URL(window.location);
    const q = searchInput ? searchInput.value.trim() : '';
    if (q) {
      url.searchParams.set('q', q);
    } else {
      url.searchParams.delete('q');
    }
    if (activeCategoryFilter) {
      url.searchParams.set('category', activeCategoryFilter);
    } else {
      url.searchParams.delete('category');
    }
    history.replaceState(null, '', url);
  };

  const MAX_URL_PARAM_LENGTH = 200;
  const sanitizeUrlParam = (s) =>
    typeof s === 'string' ? s.slice(0, MAX_URL_PARAM_LENGTH).replace(/[\x00-\x1F]/g, '') : '';

  const readUrlParams = () => {
    const url = new URL(window.location);
    const q = sanitizeUrlParam(url.searchParams.get('q') || '');
    const cat = sanitizeUrlParam(url.searchParams.get('category') || '');
    if (q && searchInput) {
      searchInput.value = q;
    }
    if (cat) {
      activeCategoryFilter = cat;
    }
  };

  // --- Category Chips ---
  const renderCategoryChips = () => {
    if (!categoryChipsContainer) return;
    categoryChipsContainer.innerHTML = '';

    // One chip per category
    BLOCKED_SERVICES.forEach((group) => {
      const chip = document.createElement('button');
      chip.className = 'category-chip' + (activeCategoryFilter === group.category ? ' active' : '');
      chip.textContent = group.category;
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(activeCategoryFilter === group.category));
      chip.addEventListener('click', () => {
        if (activeCategoryFilter === group.category) {
          activeCategoryFilter = null; // deselect
        } else {
          activeCategoryFilter = group.category; // select
        }
        syncUrlParams();
        updateChipActiveStates();
        renderServices(searchInput ? searchInput.value : '');
      });
      categoryChipsContainer.appendChild(chip);
    });
  };

  const updateChipActiveStates = () => {
    if (!categoryChipsContainer) return;
    categoryChipsContainer.querySelectorAll('.category-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.textContent === activeCategoryFilter);
      chip.setAttribute('aria-pressed', String(chip.textContent === activeCategoryFilter));
    });
  };

  // --- Fetch Services ---
  const MAX_BLOCKLIST_SIZE_BYTES = 512 * 1024; // 512 KB

  const fetchServices = async () => {
    showLoadingSkeleton();

    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/hapara-fail/blocklist/refs/heads/main/README.md'
      );
      if (!response.ok) throw new Error('Failed to fetch blocklist');

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      if (contentLength > MAX_BLOCKLIST_SIZE_BYTES) {
        throw new Error('Blocklist response exceeds maximum allowed size');
      }
      const text = await response.text();
      if (text.length > MAX_BLOCKLIST_SIZE_BYTES) {
        throw new Error('Blocklist content exceeds maximum allowed size');
      }

      if (!isTrustedBlocklist(text)) {
        throw new Error('Blocklist content failed integrity checks');
      }

      const targetSectionHeader = '## 👁️ Services Targeted';
      const startIdx = text.indexOf(targetSectionHeader);
      if (startIdx === -1) return;

      const sectionText = text.slice(startIdx + targetSectionHeader.length);
      const lines = sectionText.split('\n');

      let currentCategory = null;
      let currentServices = [];
      const parsedServices = [];
      const patchedNames = new Set();
      const patchedHeader = 'Known Patched Systems';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Stop at next section or horizontal rule
        if (trimmed.startsWith('---') || trimmed.startsWith('## ')) {
          if (
            currentCategory &&
            currentServices.length > 0 &&
            currentCategory !== 'Common Dependencies' &&
            currentCategory !== patchedHeader
          ) {
            parsedServices.push({ category: currentCategory, services: currentServices });
          }
          break;
        }

        if (trimmed.startsWith('#### ')) {
          if (
            currentCategory &&
            currentServices.length > 0 &&
            currentCategory !== 'Common Dependencies' &&
            currentCategory !== patchedHeader
          ) {
            parsedServices.push({ category: currentCategory, services: currentServices });
          }
          currentCategory = trimmed.replace('#### ', '').trim();
          currentServices = [];
        } else if ((trimmed.startsWith('* ') || trimmed.startsWith('- ')) && currentCategory) {
          const serviceName = trimmed.replace(/^[\*\-]\s+/, '').trim();
          currentServices.push(serviceName);
          if (currentCategory === patchedHeader) {
            patchedNames.add(serviceName);
          }
        }
      }

      PATCHED_SERVICES = patchedNames;

      // Basic integrity/format validation to ensure the content matches
      // the expected structure before using it in the UI.
      const isValidServices =
        Array.isArray(parsedServices) &&
        parsedServices.every((entry) => {
          if (!entry || typeof entry.category !== 'string' || !Array.isArray(entry.services)) {
            return false;
          }
          // Categories and services should be non-empty strings without control characters
          const safeText = (s) =>
            typeof s === 'string' && s.trim().length > 0 && !/[\x00-\x08\x0E-\x1F]/.test(s);
          if (!safeText(entry.category)) {
            return false;
          }
          return entry.services.every(safeText);
        });

      if (!isValidServices) {
        throw new Error('Fetched blocklist content did not match expected format');
      }

      BLOCKED_SERVICES = parsedServices;
      renderCategoryChips();
      renderServices(searchInput ? searchInput.value : '');
    } catch (error) {
      console.error('Error loading blocklist:', error);
      if (serviceList) {
        serviceList.innerHTML = '';

        const noResults = document.createElement('div');
        noResults.className = 'no-results';

        const messagePara = document.createElement('p');
        messagePara.textContent = 'Unable to load service list from GitHub.';
        noResults.appendChild(messagePara);

        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'retry-btn';

        const retrySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        retrySvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        retrySvg.setAttribute('width', '16');
        retrySvg.setAttribute('height', '16');
        retrySvg.setAttribute('viewBox', '0 0 24 24');
        retrySvg.setAttribute('fill', 'none');
        retrySvg.setAttribute('stroke', 'currentColor');
        retrySvg.setAttribute('stroke-width', '2');
        retrySvg.setAttribute('stroke-linecap', 'round');
        retrySvg.setAttribute('stroke-linejoin', 'round');
        retrySvg.setAttribute('aria-hidden', 'true');
        retrySvg.setAttribute('focusable', 'false');

        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        path1.setAttribute('points', '23 4 23 10 17 10');
        retrySvg.appendChild(path1);

        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('d', 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10');
        retrySvg.appendChild(path2);

        retryBtn.appendChild(retrySvg);
        retryBtn.appendChild(document.createTextNode('Retry'));
        retryBtn.addEventListener('click', () => fetchServices());

        noResults.appendChild(retryBtn);
        serviceList.appendChild(noResults);
        serviceList.setAttribute('aria-busy', 'false');
        if (serviceResultsStatus) serviceResultsStatus.textContent = 'Unable to load service list.';
      }
    }
  };

  // --- Render Services ---
  const renderServices = (filterText = '') => {
    if (!serviceList) return;
    serviceList.innerHTML = '';
    serviceList.setAttribute('aria-busy', 'false');

    const normalizedFilter = filterText.toLowerCase().trim();
    let hasResults = false;
    let cardAnimationIndex = 0;
    let isFuzzy = false;

    // Determine which groups to render based on category filter
    const filteredGroups = activeCategoryFilter
      ? BLOCKED_SERVICES.filter((g) => g.category === activeCategoryFilter)
      : BLOCKED_SERVICES;

    // First pass: exact substring matching
    const exactResults = [];
    filteredGroups.forEach((group) => {
      const matching = group.services.filter((service) =>
        service.toLowerCase().includes(normalizedFilter)
      );
      if (matching.length > 0) {
        exactResults.push({
          category: group.category,
          services: matching,
          total: group.services.length,
        });
      }
    });

    // Second pass: fuzzy matching if no exact results and query >= 2 chars
    let resultsToRender = exactResults;
    if (exactResults.length === 0 && normalizedFilter.length >= 2) {
      const fuzzyResults = [];
      filteredGroups.forEach((group) => {
        const matching = group.services
          .map((service) => ({ service, ...fuzzyMatch(normalizedFilter, service) }))
          .filter((r) => r.match)
          .sort((a, b) => b.score - a.score)
          .map((r) => r.service);

        if (matching.length > 0) {
          fuzzyResults.push({
            category: group.category,
            services: matching,
            total: group.services.length,
          });
        }
      });

      if (fuzzyResults.length > 0) {
        resultsToRender = fuzzyResults;
        isFuzzy = true;
      }
    }

    hasResults = resultsToRender.length > 0;

    // Fuzzy note banner
    if (isFuzzy) {
      const note = document.createElement('div');
      note.className = 'fuzzy-note';
      note.textContent = 'Showing similar results for your search.';
      serviceList.appendChild(note);
    }

    // Render result groups
    resultsToRender.forEach((group) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'service-category-group';

      const headerEl = document.createElement('h3');
      headerEl.className = 'service-category-header';
      headerEl.textContent = group.category;

      // Dynamic service count
      const countSpan = document.createElement('span');
      countSpan.className = 'category-count';
      countSpan.textContent = ` (${group.services.length})`;
      headerEl.appendChild(countSpan);

      categoryEl.appendChild(headerEl);

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'service-cards-container';

      group.services.forEach((service) => {
        const card = document.createElement('div');
        card.className = 'service-card card-enter';
        if (!prefersReducedMotion) {
          card.style.animationDelay = `${cardAnimationIndex * 15}ms`;
        }
        cardAnimationIndex++;

        const serviceInfo = document.createElement('div');
        serviceInfo.className = 'service-info service-info-flex';
        serviceInfo.style.display = 'flex';
        serviceInfo.style.alignItems = 'center';
        serviceInfo.style.gap = '15px';
        serviceInfo.style.width = '100%';
        serviceInfo.style.justifyContent = 'space-between';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'service-name';
        nameSpan.textContent = service;

        const isPatched = PATCHED_SERVICES.has(service);

        const statusSpan = document.createElement('span');
        statusSpan.className = isPatched
          ? 'service-status service-status--patched'
          : 'service-status';
        statusSpan.title = isPatched
          ? 'This service has a hardcoded failsafe that severs your internet connection when blocked, instead of being bypassed.'
          : 'Our DNS prevents this service from connecting to its servers, stopping it from functioning.';

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('xmlns', svgNS);
        svg.setAttribute('width', '14');
        svg.setAttribute('height', '14');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '3');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.marginRight = '4px';

        if (isPatched) {
          // X icon for patched services
          const line1 = document.createElementNS(svgNS, 'line');
          line1.setAttribute('x1', '18');
          line1.setAttribute('y1', '6');
          line1.setAttribute('x2', '6');
          line1.setAttribute('y2', '18');
          svg.appendChild(line1);

          const line2 = document.createElementNS(svgNS, 'line');
          line2.setAttribute('x1', '6');
          line2.setAttribute('y1', '6');
          line2.setAttribute('x2', '18');
          line2.setAttribute('y2', '18');
          svg.appendChild(line2);
        } else {
          // Checkmark icon for blocked services
          const polyline = document.createElementNS(svgNS, 'polyline');
          polyline.setAttribute('points', '20 6 9 17 4 12');
          svg.appendChild(polyline);
        }

        statusSpan.appendChild(svg);
        statusSpan.appendChild(document.createTextNode(isPatched ? 'Patched' : 'Blocked'));

        serviceInfo.appendChild(nameSpan);
        serviceInfo.appendChild(statusSpan);

        card.appendChild(serviceInfo);
        cardsContainer.appendChild(card);
      });

      categoryEl.appendChild(cardsContainer);
      serviceList.appendChild(categoryEl);
    });

    if (!hasResults && normalizedFilter) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';

      const messagePara = document.createElement('p');
      messagePara.appendChild(document.createTextNode('No services found matching "'));

      const strongEl = document.createElement('strong');
      strongEl.textContent = filterText;
      messagePara.appendChild(strongEl);

      messagePara.appendChild(document.createTextNode('". '));
      const br = document.createElement('br');
      messagePara.appendChild(br);
      messagePara.appendChild(
        document.createTextNode('They might not be blocked, or are listed under a different name.')
      );

      noResults.appendChild(messagePara);

      const link = document.createElement('a');
      link.href = 'https://github.com/hapara-fail/blocklist/issues/new?template=addition.yml';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'cta-button';
      link.style.marginTop = '15px';
      link.style.display = 'inline-flex';
      link.style.fontSize = '0.9rem';
      link.style.alignItems = 'center';
      link.style.gap = '8px';

      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgEl.setAttribute('width', '18');
      svgEl.setAttribute('height', '18');
      svgEl.setAttribute('viewBox', '0 0 24 24');
      svgEl.setAttribute('fill', 'none');
      svgEl.setAttribute('stroke', 'currentColor');
      svgEl.setAttribute('stroke-width', '2.5');
      svgEl.setAttribute('stroke-linecap', 'round');
      svgEl.setAttribute('stroke-linejoin', 'round');
      svgEl.setAttribute('aria-hidden', 'true');
      svgEl.setAttribute('focusable', 'false');

      const lineVertical = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineVertical.setAttribute('x1', '12');
      lineVertical.setAttribute('y1', '5');
      lineVertical.setAttribute('x2', '12');
      lineVertical.setAttribute('y2', '19');
      svgEl.appendChild(lineVertical);

      const lineHorizontal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineHorizontal.setAttribute('x1', '5');
      lineHorizontal.setAttribute('y1', '12');
      lineHorizontal.setAttribute('x2', '19');
      lineHorizontal.setAttribute('y2', '12');
      svgEl.appendChild(lineHorizontal);

      link.appendChild(svgEl);
      link.appendChild(document.createTextNode(' Request to add this service'));

      noResults.appendChild(link);
      serviceList.appendChild(noResults);
    }

    const resultCount = resultsToRender.reduce((count, group) => count + group.services.length, 0);
    if (serviceResultsStatus) {
      if (!normalizedFilter && !activeCategoryFilter) {
        serviceResultsStatus.textContent = `${resultCount} services loaded.`;
      } else if (resultCount === 0) {
        serviceResultsStatus.textContent = `No services found for ${filterText || activeCategoryFilter}.`;
      } else {
        serviceResultsStatus.textContent = `${resultCount} matching services found.`;
      }
    }
  };

  let searchDebounceTimer = null;
  const SEARCH_DEBOUNCE_MS = 150;

  if (searchInput) {
    // Read URL params on load
    readUrlParams();

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        syncUrlParams();
        renderServices(e.target.value);
      }, SEARCH_DEBOUNCE_MS);
    });

    // Show skeleton immediately, then fetch
    showLoadingSkeleton();
    fetchServices();
  }
});
