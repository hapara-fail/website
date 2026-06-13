(() => {
  const STORAGE_KEY = 'haparaFailShutdownNoticeDismissed';

  function isDismissed() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function setDismissed() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // If storage is unavailable, still dismiss for the current page.
    }
  }

  function setBannerHeight(banner) {
    const height = banner && !banner.hidden ? banner.offsetHeight : 0;
    document.documentElement.style.setProperty('--shutdown-banner-height', `${height}px`);
  }

  function applyBannerState(banner, shouldShow) {
    document.documentElement.classList.toggle('shutdown-banner-visible', shouldShow);
    document.documentElement.classList.toggle('shutdown-banner-dismissed', !shouldShow);

    if (banner) {
      banner.hidden = !shouldShow;
      setBannerHeight(banner);
    } else {
      setBannerHeight(null);
    }
  }

  function initShutdownBanner() {
    const banner = document.querySelector('[data-shutdown-banner]');
    const closeButton = banner?.querySelector('.shutdown-banner__close');
    const shouldShow = !isDismissed();

    if (window.__haparaShutdownBannerObserver) {
      window.__haparaShutdownBannerObserver.disconnect();
      window.__haparaShutdownBannerObserver = null;
    }

    applyBannerState(banner, shouldShow);

    if (!banner || !closeButton) return;

    closeButton.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setDismissed();
      applyBannerState(banner, false);
    };

    if (shouldShow && 'ResizeObserver' in window) {
      window.__haparaShutdownBannerObserver = new ResizeObserver(() => setBannerHeight(banner));
      window.__haparaShutdownBannerObserver.observe(banner);
    }
  }

  document.addEventListener('DOMContentLoaded', initShutdownBanner);
  document.addEventListener('astro:page-load', initShutdownBanner);
  document.addEventListener('astro:before-swap', () => {
    if (window.__haparaShutdownBannerObserver) {
      window.__haparaShutdownBannerObserver.disconnect();
      window.__haparaShutdownBannerObserver = null;
    }
  });
})();
