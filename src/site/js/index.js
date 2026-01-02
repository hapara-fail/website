document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Utility: ensure handler runs at most once
  const createOnceHandler = (fn) => {
    let called = false;
    return function (...args) {
      if (called) {
        return;
      }
      called = true;
      return fn.apply(this, args);
    };
  };

  // --- FAQ Dropdown Animation ---
  // Refactored to handle spam clicks and provide immediate feedback
  // Refactored to handle spam clicks and provide immediate feedback
  document.querySelectorAll('.faq-item').forEach((detail) => {
    const summary = detail.querySelector('summary');
    const contentWrapper = detail.querySelector('.faq-content-wrapper');

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (prefersReducedMotion) {
        detail.open = !detail.open;
        return;
      }

      // If it's closed OR it's currently animating to close (has 'closing' class), we open it.
      if (!detail.open || detail.classList.contains('closing')) {
        // OPENING
        const wasClosing = detail.classList.contains('closing');
        detail.classList.remove('closing');
        detail.open = true;

        // CRITICAL FIX: To animate FROM 0, we must set it to 0 immediately after opening
        // but before the browser paints the "auto" height.
        if (!wasClosing) {
          contentWrapper.style.height = '0px';
        } else {
          const startHeight = contentWrapper.offsetHeight;
          contentWrapper.style.height = `${startHeight}px`;
        }

        // Force reflow
        contentWrapper.getBoundingClientRect();

        // Transition to full height
        const targetHeight = contentWrapper.scrollHeight;
        contentWrapper.style.height = `${targetHeight}px`;

        // Clean up logic: only unset height if we are still open and not closing again
        const finishOpen = () => {
          if (detail.open && !detail.classList.contains('closing')) {
            contentWrapper.style.height = '';
          }
        };

        contentWrapper.addEventListener('transitionend', finishOpen, { once: true });
      } else {
        // CLOSING
        detail.classList.add('closing');

        // Set explicit height to start transition from current height
        const startHeight = contentWrapper.offsetHeight;
        contentWrapper.style.height = `${startHeight}px`;

        // Force reflow
        contentWrapper.getBoundingClientRect();

        // Transition to 0
        requestAnimationFrame(() => {
          contentWrapper.style.height = '0px';
        });

        // Clean up logic: only close detail if we are still marked as closing
        const finishClose = () => {
          if (detail.classList.contains('closing')) {
            detail.open = false;
            detail.classList.remove('closing');
            contentWrapper.style.height = '';
          }
        };
        contentWrapper.addEventListener('transitionend', finishClose, { once: true });
      }
    });
  });

  if (!prefersReducedMotion) {
    // --- Hero Title Word Animation ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const text = heroTitle.textContent.trim();
      // Build word wrappers safely using DOM APIs
      const wordsArray = text.split(/\s+/);
      heroTitle.textContent = '';
      // 100ms between words gives a readable cascading reveal without feeling sluggish.
      const WORD_ANIMATION_DELAY_MS = 100;
      wordsArray.forEach((word, index) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'word-wrapper';
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = word;
        wordSpan.style.transitionDelay = `${index * WORD_ANIMATION_DELAY_MS}ms`;
        wrapper.appendChild(wordSpan);
        heroTitle.appendChild(wrapper);
        if (index < wordsArray.length - 1) {
          heroTitle.appendChild(document.createTextNode(' '));
        }
      });

      // Force a synchronous layout/reflow so the subsequent class addition
      // starts the CSS transition/animation from its initial state.
      // Read layout explicitly; the value is unused, we only need the side effect.
      heroTitle.getBoundingClientRect();
      requestAnimationFrame(() => {
        heroTitle.classList.add('revealed');
      });
    }
  }
});
