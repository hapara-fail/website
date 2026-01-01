document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- FAQ Dropdown Animation ---
    const FAQ_HEIGHT_TRANSITION_DELAY_MS = 10;
    document.querySelectorAll('.faq-item').forEach(detail => {
        const summary = detail.querySelector('summary');
        const contentWrapper = detail.querySelector('.faq-content-wrapper');

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            if (prefersReducedMotion) {
                detail.open = !detail.open;
                return;
            }
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
            if (detail.open) {
                const height = contentWrapper.scrollHeight;
                contentWrapper.style.height = `${height}px`;
                setTimeout(() => { contentWrapper.style.height = '0px'; }, FAQ_HEIGHT_TRANSITION_DELAY_MS);
                // Use transitionend with a fallback timeout to ensure state is consistent
                const finishClose = createOnceHandler(() => {
                    detail.open = false;
                });
                contentWrapper.addEventListener('transitionend', finishClose, { once: true });
                // Fallback in case transitionend does not fire (e.g., element removed or transition canceled)
                setTimeout(finishClose, 500);
            } else {
                contentWrapper.style.height = '0px';
                detail.open = true;
                const height = contentWrapper.scrollHeight;
                setTimeout(() => { contentWrapper.style.height = `${height}px`; }, FAQ_HEIGHT_TRANSITION_DELAY_MS);
                // Use transitionend with a fallback timeout to ensure height is reset
                const finishOpen = createOnceHandler(() => {
                    if (detail.open) {
                        contentWrapper.style.height = '';
                    }
                });
                contentWrapper.addEventListener('transitionend', finishOpen, { once: true });
                // Fallback in case transitionend does not fire
                setTimeout(finishOpen, 500);
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
            void heroTitle.offsetWidth;
            requestAnimationFrame(() => {
                heroTitle.classList.add('revealed');
            });
        }

        // --- Scroll Reveal Animation ---
        const revealItems = document.querySelectorAll('.reveal-item');
        const INTERSECTION_THRESHOLD = 0.1;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: INTERSECTION_THRESHOLD });
        revealItems.forEach(item => observer.observe(item));
    }
});