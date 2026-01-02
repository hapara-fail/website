document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal-item');

  // If no items to reveal or if user prefers reduced motion, show everything immediately
  if (revealItems.length === 0) return;

  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });
    return;
  }

  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for browsers without IntersectionObserver
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => observer.observe(item));
});
