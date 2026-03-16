document.addEventListener('DOMContentLoaded', () => {
  // If consent already set, do nothing
  if (document.cookie.split(';').some((item) => item.trim().startsWith('cookieConsent='))) {
    return;
  }

  const noticeHTML = `
    <div
      class="cookie-notice"
      id="cookieNotice"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
    >
      <div class="cookie-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cookie-icon lucide-cookie"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
        <p>We only use functional cookies to enhance your experience. No tracking, no ads. Ever.</p>
      </div>
      <button class="cookie-button" id="acceptCookie" aria-label="Accept cookies">Okay</button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', noticeHTML);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cookieNotice = document.getElementById('cookieNotice');
  const acceptCookie = document.getElementById('acceptCookie');

  if (cookieNotice && acceptCookie) {
    acceptCookie.addEventListener('click', () => {
      // Set cookie first
      let cookieStr = 'cookieConsent=true; path=/; max-age=31536000; SameSite=Lax';
      if (window.location.protocol === 'https:') {
        cookieStr += '; Secure';
      }
      document.cookie = cookieStr;

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
