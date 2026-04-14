<script>
  import { onMount } from "svelte";

  let showNotice = false;
  let isHiding = false;

  onMount(() => {
    // If consent already set, do nothing
    if (document.cookie.split(';').some((item) => item.trim().startsWith('cookieConsent='))) {
      return;
    }
    showNotice = true;
  });

  function acceptCookie() {
    // Set cookie first
    let cookieStr = 'cookieConsent=true; path=/; max-age=31536000; SameSite=Lax';
    if (window.location.protocol === 'https:') {
      cookieStr += '; Secure';
    }
    document.cookie = cookieStr;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      showNotice = false;
      return;
    }

    if (isHiding) return;
    isHiding = true;

    // We can handle the animation by waiting for it to finish
    // Since Svelte removes the node when showNotice = false, we can use 
    // a timeout to wait for the CSS animation to finish before removing from DOM.
    // However, the original code added a class 'cookie-notice--hiding'.
    // Let's rely on the timeout instead of animationend for simplicity, 
    // or just let Svelte handle it. 
    // A timeout of 600ms covers the standard slideOut animation length.
    setTimeout(() => {
      showNotice = false;
    }, 600);
  }
</script>

{#if showNotice}
  <div
    class="cookie-notice {isHiding ? 'cookie-notice--hiding' : ''}"
    id="cookieNotice"
    role="dialog"
    aria-live="polite"
    aria-label="Cookie notice"
  >
    <div class="cookie-content">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cookie-icon lucide-cookie"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>
      <p>We only use functional cookies to enhance your experience. No tracking, no ads. Ever.</p>
    </div>
    <button class="cookie-button" id="acceptCookie" aria-label="Accept cookies" on:click={acceptCookie}>Okay</button>
  </div>
{/if}
