/**
 * Scroll Reveal Engine
 *
 * Uses IntersectionObserver to reveal `.reveal` elements as they enter the
 * viewport. Supports:
 *   - data-reveal-delay="200"  → custom delay in ms
 *   - data-reveal-stagger      → auto-staggers direct .reveal children
 *
 * Respects prefers-reduced-motion and degrades gracefully without JS
 * (pair with a <noscript> class override in the HTML).
 */
document.addEventListener('DOMContentLoaded', () => {
  const STAGGER_MS = 80; // matches --anim-stagger in CSS
  const THRESHOLD = 0.15;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Prepare stagger delays ---
  // Parents with [data-reveal-stagger] auto-compute delays for children.
  const staggerParents = document.querySelectorAll('[data-reveal-stagger]');
  staggerParents.forEach((parent) => {
    const children = parent.querySelectorAll(':scope > .reveal');
    children.forEach((child, index) => {
      // Only set delay if no explicit delay is already specified
      if (!child.hasAttribute('data-reveal-delay')) {
        child.style.transitionDelay = `${index * STAGGER_MS}ms`;
      }
    });
  });

  // --- Apply explicit data-reveal-delay ---
  const delayedItems = document.querySelectorAll('[data-reveal-delay]');
  delayedItems.forEach((item) => {
    const delay = item.getAttribute('data-reveal-delay');
    item.style.transitionDelay = `${delay}ms`;
  });

  // --- Collect all reveal elements ---
  const revealItems = document.querySelectorAll('.reveal');

  if (revealItems.length === 0) return;

  // If user prefers reduced motion, show everything immediately
  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
      item.style.transitionDelay = '';
    });
    return;
  }

  // Fallback for browsers without IntersectionObserver
  if (typeof IntersectionObserver === 'undefined') {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
      item.style.transitionDelay = '';
    });
    return;
  }

  // --- IntersectionObserver ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Clean up delay after animation completes so it doesn't
          // interfere with future hover transitions
          const duration = parseFloat(
            getComputedStyle(entry.target).getPropertyValue('--anim-duration') || '0.7'
          );
          const delay = parseFloat(entry.target.style.transitionDelay) || 0;
          const cleanupMs = duration * 1000 + delay + 100;

          setTimeout(() => {
            entry.target.style.transitionDelay = '';
            entry.target.style.willChange = 'auto';
          }, cleanupMs);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -60px 0px' }
  );

  revealItems.forEach((item) => observer.observe(item));
});
