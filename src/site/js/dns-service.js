document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        const revealItems = document.querySelectorAll('.reveal-item');
        if (revealItems.length > 0) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            revealItems.forEach(item => observer.observe(item));
        }
    }

    // --- TABS & OS DETECTION SCRIPT ---
    const tabsNav = document.querySelector('.tabs-nav');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabButtonsArray = Array.from(tabButtons);
    const tabUnderline = document.querySelector('.tab-underline');
    const tabsWrapper = document.querySelector('.tabs-content-wrapper');
    const osDetectionMessage = document.getElementById('os-detection-message');

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
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }

        if (currentActiveButton === newActiveButton) {
            if (newActiveContent) updateContainerHeight(newActiveContent);
            return;
        }

        const currentActiveContent = document.querySelector('.tab-content.active');

        tabButtons.forEach(btn => btn.classList.remove('active'));
        if (newActiveButton) newActiveButton.classList.add('active');
        moveUnderline(newActiveButton);

        if (currentActiveContent && !isInitial) {
            const currentIndex = tabButtonsArray.indexOf(currentActiveButton);
            const newIndex = tabButtonsArray.indexOf(newActiveButton);
            const directionClass = newIndex > currentIndex ? 'slide-from-right' : 'slide-from-left';

            currentActiveContent.classList.add('is-exiting');
            newActiveContent.classList.add(directionClass);

            setTimeout(() => {
                currentActiveContent.classList.remove('active', 'is-exiting');
                newActiveContent.classList.add('active');
                setTimeout(() => newActiveContent.classList.remove('slide-from-right', 'slide-from-left'), 10);
            }, 50);

        } else if (newActiveContent) {
            newActiveContent.classList.add('active');
        }

        if (newActiveContent) {
            // Update height immediately
            updateContainerHeight(newActiveContent);
        }
    };

    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => setActiveTab(tab.dataset.target));
    });

    function detectOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        if (userAgent.includes("cros")) return 'chromeos';
        if (/mac|macintel|macppc|mac68k/.test(platform)) return 'macos';
        if (/win32|win64|windows|wince/.test(platform)) return 'windows';
        if (/iphone|ipad|ipod/.test(platform) || (userAgent.includes("mac") && "ontouchend" in document)) return 'ios';
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
            const osMap = { chromeos: 'ChromeOS', windows: 'Windows', macos: 'macOS', ios: 'iOS / iPadOS', android: 'Android', linux: 'Linux' };
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
        container.scrollBy({ left: delta, behavior: 'smooth' });
    };

    if (leftArrow && rightArrow && tabsNav) {
        leftArrow.addEventListener('click', () => smoothScrollBy(tabsNav, -Math.round(tabsNav.clientWidth * 0.6)));
        rightArrow.addEventListener('click', () => smoothScrollBy(tabsNav, Math.round(tabsNav.clientWidth * 0.6)));
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
        document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    };

    const openModal = () => {
        if (!modalOverlay) return;

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
        }

        modalOverlay.hidden = false;
        document.body.classList.add('body-lock');

        // Check DNS status when modal opens (or when we proceed to info)
        if (tosAccepted === 'true') {
            checkDnsStatus();
        }
    };

    const checkDnsStatus = async () => {
        const statusTag = document.getElementById('dns-status-tag');
        if (!statusTag) return;

        const statusText = statusTag.querySelector('.status-text');

        // Reset state
        statusTag.className = 'dns-status-tag';
        if (statusText) statusText.textContent = 'Checking...';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch('https://dns-monitor.a9x.workers.dev/', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.status === 200) {
                statusTag.classList.add('status-up');
                if (statusText) statusText.textContent = 'Operational';
            } else {
                throw new Error('Service down');
            }
        } catch (error) {
            console.error('DNS Status Check Failed:', error);
            statusTag.classList.add('status-down');
            if (statusText) statusText.textContent = 'Service Issue';
        }
    };

    const closeModal = () => {
        if (!modalOverlay) return;
        modalOverlay.hidden = true;
        document.body.classList.remove('body-lock');

        // Reset transitions
        if (stepTos) stepTos.classList.remove('fade-out', 'fade-in');
        if (stepInfo) stepInfo.classList.remove('fade-out', 'fade-in');
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
                    checkDnsStatus();

                    // Small delay to allow fade-in class to apply before removing it/or letting CSS handle opacity
                    requestAnimationFrame(() => {
                        stepInfo.classList.remove('fade-in'); // This might just pop in if we don't have fade-in defined to start at 0
                    });
                }, 250); // Match CSS transition duration
            }
        });
    }

    // --- COPY BUTTON LOGIC ---
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSelector = btn.getAttribute('data-copy-target');
            if (targetSelector) {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    const textToCopy = targetElement.innerText;
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        // Success feedback
                        const copiedMsg = btn.querySelector('.copied-message');

                        // Add pulsing class
                        btn.classList.add('pulsing');

                        if (copiedMsg) {
                            copiedMsg.classList.add('show');
                            setTimeout(() => {
                                copiedMsg.classList.remove('show');
                                btn.classList.remove('pulsing');
                            }, 2000);
                        }
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                }
            }
        });
    });

    // --- COMPATIBILITY CHECKER LOGIC ---
    let BLOCKED_SERVICES = [];

    const searchInput = document.getElementById('service-search');
    const serviceList = document.getElementById('service-list');

    const fetchServices = async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/hapara-fail/blocklist/refs/heads/main/README.md');
            if (!response.ok) throw new Error('Failed to fetch blocklist');
            const text = await response.text();

            const targetSectionHeader = "## 👁️ Services Targeted";
            const startIdx = text.indexOf(targetSectionHeader);
            if (startIdx === -1) return;

            const sectionText = text.slice(startIdx + targetSectionHeader.length);
            const lines = sectionText.split('\n');

            let currentCategory = null;
            let currentServices = [];
            const parsedServices = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Stop at next section or horizontal rule
                if (trimmed.startsWith('---') || trimmed.startsWith('## ')) {
                    if (currentCategory && currentServices.length > 0 && currentCategory !== "Common Dependencies") {
                        parsedServices.push({ category: currentCategory, services: currentServices });
                    }
                    break;
                }

                if (trimmed.startsWith('#### ')) {
                    if (currentCategory && currentServices.length > 0 && currentCategory !== "Common Dependencies") {
                        parsedServices.push({ category: currentCategory, services: currentServices });
                    }
                    currentCategory = trimmed.replace('#### ', '').trim();
                    currentServices = [];
                } else if (trimmed.startsWith('* ') && currentCategory) {
                    currentServices.push(trimmed.replace('* ', '').trim());
                }
            }

            BLOCKED_SERVICES = parsedServices;
            renderServices(searchInput ? searchInput.value : '');

        } catch (error) {
            console.error('Error loading blocklist:', error);
            if (serviceList) {
                serviceList.innerHTML = '<div class="no-results"><p>Unable to load service list from GitHub.</p></div>';
            }
        }
    };

    const renderServices = (filterText = '') => {
        if (!serviceList) return;
        serviceList.innerHTML = '';

        const normalizedFilter = filterText.toLowerCase().trim();
        let hasResults = false;

        BLOCKED_SERVICES.forEach(group => {
            // Filter services within the group
            const matchingServices = group.services.filter(service =>
                service.toLowerCase().includes(normalizedFilter)
            );

            if (matchingServices.length > 0) {
                hasResults = true;
                const categoryEl = document.createElement('div');
                categoryEl.className = 'service-category-group';

                const headerEl = document.createElement('h3');
                headerEl.className = 'service-category-header';
                headerEl.textContent = group.category;
                categoryEl.appendChild(headerEl);

                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'service-cards-container';

                matchingServices.forEach(service => {
                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.innerHTML = `
                        <div class="service-info" style="display: flex; align-items: center; gap: 15px; width: 100%; justify-content: space-between;">
                            <span class="service-name">${service}</span>
                            <span class="service-status">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Blocked
                            </span>
                        </div>
                    `;
                    cardsContainer.appendChild(card);
                });

                categoryEl.appendChild(cardsContainer);
                serviceList.appendChild(categoryEl);
            }
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
            messagePara.appendChild(document.createTextNode('They might not be blocked, or are listed under a different name.'));

            noResults.appendChild(messagePara);

            const link = document.createElement('a');
            link.href = 'https://github.com/hapara-fail/blocklist/issues/new?template=service---domain-addition.md';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'cta-button';
            link.style.marginTop = '15px';
            link.style.display = 'inline-flex';
            link.style.fontSize = '0.9rem';
            link.style.alignItems = 'center';
            link.style.gap = '8px';

            link.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Request to add this service
            `;

            noResults.appendChild(link);
            serviceList.appendChild(noResults);
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderServices(e.target.value);
        });
        // Initial render
        renderServices();
        fetchServices();
    }
});
