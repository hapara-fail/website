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
    const tabContents = document.querySelectorAll('.tab-content');
    const tabUnderline = document.querySelector('.tab-underline');
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

    const setActiveTab = (targetId, isInitial = false) => {
        const currentActiveButton = document.querySelector('.tab-button.active');
        const newActiveButton = document.querySelector(`.tab-button[data-target="${targetId}"]`);
        if (currentActiveButton === newActiveButton) return;
        
        const currentActiveContent = document.querySelector('.tab-content.active');
        const newActiveContent = document.getElementById(targetId);

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

    // --- CHROMEOS METHOD SWITCHER ---
    const method1Div = document.getElementById('chromeos-method1');
    const method2Div = document.getElementById('chromeos-method2');
    const showMethod2Btn = document.getElementById('show-method2-btn');
    const showMethod1Btn = document.getElementById('show-method1-btn');

    const switchMethods = (showDiv, hideDiv) => {
        hideDiv.classList.remove('active');
        showDiv.classList.add('active');
    };

    if (showMethod2Btn) {
        showMethod2Btn.addEventListener('click', () => switchMethods(method2Div, method1Div));
    }
    if (showMethod1Btn) {
        showMethod1Btn.addEventListener('click', () => switchMethods(method1Div, method2Div));
    }

    // --- MOBILE ARROWS + FADES SYSTEM ---
    const tabsWrapper = document.querySelector('.tabs-scroll-wrapper');
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
    };

    if (tabsNav) {
        tabsNav.addEventListener('scroll', handleTabsScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        // initial state
        updateArrowsAndFades();
    }
});