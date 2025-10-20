document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- FAQ Dropdown Animation ---
    document.querySelectorAll('.faq-item').forEach(detail => {
        const summary = detail.querySelector('summary');
        const contentWrapper = detail.querySelector('.faq-content-wrapper');

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            if (prefersReducedMotion) {
                detail.open = !detail.open;
                return;
            }
            if (detail.open) {
                const height = contentWrapper.scrollHeight;
                contentWrapper.style.height = `${height}px`;
                setTimeout(() => { contentWrapper.style.height = '0px'; }, 10);
                contentWrapper.addEventListener('transitionend', () => { detail.open = false; }, { once: true });
            } else {
                contentWrapper.style.height = '0px';
                detail.open = true;
                const height = contentWrapper.scrollHeight;
                setTimeout(() => { contentWrapper.style.height = `${height}px`; }, 10);
                contentWrapper.addEventListener('transitionend', () => { if (detail.open) { contentWrapper.style.height = ''; } }, { once: true });
            }
        });
    });

    if (!prefersReducedMotion) {
        // --- Hero Title Word Animation ---
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const text = heroTitle.textContent.trim();
            // Build word wrappers
            heroTitle.innerHTML = text.split(' ').map(word => `<span class="word-wrapper"><span class="word">${word}</span></span>`).join(' ');
            
            const words = heroTitle.querySelectorAll('.word');
            words.forEach((word, i) => {
                word.style.transitionDelay = `${i * 100}ms`;
            });

            // Force layout then add class to trigger animation
            void heroTitle.offsetWidth;
            requestAnimationFrame(() => {
                heroTitle.classList.add('revealed');
            });
        }

        // --- Scroll Reveal Animation ---
        const revealItems = document.querySelectorAll('.reveal-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealItems.forEach(item => observer.observe(item));
    }
});