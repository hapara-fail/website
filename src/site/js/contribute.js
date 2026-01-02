document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Crypto address copy functionality ---
  document.querySelectorAll('.copy-btn').forEach((button) => {
    const copiedMessage = button.querySelector('.copied-message');

    button.addEventListener('click', () => {
      const targetSelector = button.dataset.copyTarget;
      const addressElement = document.querySelector(targetSelector);
      if (addressElement) {
        navigator.clipboard
          .writeText(addressElement.textContent)
          .then(() => {
            if (prefersReducedMotion) return; // Skip animations if disabled

            // Add pulsing animation
            button.classList.remove('pulsing');
            void button.offsetWidth; // Trigger reflow
            button.classList.add('pulsing');

            // Show "Copied!" message
            if (copiedMessage) {
              copiedMessage.classList.add('show');
              setTimeout(() => {
                copiedMessage.classList.remove('show');
              }, 1500); // Hide after 1.5 seconds
            }
          })
          .catch((err) => {
            console.error('Failed to copy text: ', err);
          });
      }
    });
  });

  // --- Scroll reveal animations ---
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-item').forEach((item) => {
      item.classList.add('is-visible');
    });
    return;
  }

  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length > 0) {
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
  }
});
