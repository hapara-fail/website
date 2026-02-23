document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cookieNotice = document.getElementById('cookieNotice');
  const acceptCookie = document.getElementById('acceptCookie');

  if (cookieNotice && acceptCookie) {
    // If consent already set, hide immediately
    if (document.cookie.split(';').some((item) => item.trim().startsWith('cookieConsent='))) {
      cookieNotice.style.display = 'none';
    }

    acceptCookie.addEventListener('click', () => {
      // Set cookie first
      document.cookie = 'cookieConsent=true; path=/; max-age=31536000; SameSite=Lax';

      if (prefersReducedMotion) {
        // Respect reduced motion: hide instantly (no animation)
        cookieNotice.style.display = 'none';
        return;
      }

      // If already hiding, do nothing
      if (cookieNotice.classList.contains('cookie-notice--hiding')) return;

      // Listen for the animation end BEFORE triggering the animation
      const onAnimEnd = (e) => {
        // Ensure it's the slideOut animation that completed
        if (e.animationName === 'slideOut') {
          cookieNotice.style.display = 'none';
        }
      };

      cookieNotice.addEventListener('animationend', onAnimEnd, { once: true });

      // Add the hiding class to trigger the CSS keyframe
      cookieNotice.classList.add('cookie-notice--hiding');

      // Fallback in case animationend doesn't fire
      setTimeout(() => {
        if (getComputedStyle(cookieNotice).display !== 'none') {
          cookieNotice.style.display = 'none';
        }
      }, 900); // slightly longer than the animation
    });
  }
});
