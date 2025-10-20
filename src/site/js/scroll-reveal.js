document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // If user prefers reduced motion, show all items immediately
        document.querySelectorAll('.reveal-item').forEach(item => {
            item.classList.add('is-visible');
        });
        return;
    }

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
});