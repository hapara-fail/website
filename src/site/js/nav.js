// Config
const NAV_CONFIG = {
  items: [
    {
      type: 'link',
      href: '/',
      label: 'Home',
      icon: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    },
    {
      type: 'link',
      href: '/about',
      label: 'About',
      icon: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
    },
    {
      type: 'link',
      href: '/blog',
      label: 'Blog',
      icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z',
    },
    {
      type: 'submenu',
      label: 'Services',
      icon: 'M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z',
      items: [
        {
          href: '/services/dns',
          label: 'DNS',
          icon: 'M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z',
        },
      ],
    },
    {
      type: 'submenu',
      label: 'Tools',
      icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z',
      items: [
        {
          href: '/tool/gfu',
          label: 'Google Form Unlocker',
          icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
        },
        {
          href: '/tool/wifi',
          label: 'ChromeOS WiFi Password Extractor',
          icon: 'M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z',
        },
      ],
    },
    {
      type: 'link',
      href: '/contribute',
      label: 'Contribute',
      icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z',
    },
    {
      type: 'link',
      href: 'https://support.hapara.fail/',
      label: 'Support',
      icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  ],
  social: [
    {
      href: 'https://discord.gg/KA66dHUF4P',
      label: 'Discord',
      viewBox: '0 0 24 24',
      path: 'M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z',
    },
    {
      href: 'https://github.com/hapara-fail',
      label: 'GitHub',
      viewBox: '0 0 24 24',
      path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
    {
      href: 'mailto:support@support.hapara.fail',
      label: 'Email',
      viewBox: '0 0 24 24',
      path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    },
  ],
};

// Helper to create SVG element
function createSvgIcon(iconPath, role = 'img', ariaLabelledBy = null) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke', 'currentColor');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('d', iconPath);

  svg.appendChild(path);

  if (role) svg.setAttribute('role', role);
  if (ariaLabelledBy) svg.setAttribute('aria-labelledby', ariaLabelledBy);

  return svg;
}

// Helper to create toggle icon (for submenus)
function createToggleIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke', 'currentColor');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('d', 'm8.25 4.5 7.5 7.5-7.5 7.5');

  svg.appendChild(path);
  return svg;
}

// Build navigation markup
function buildNavMarkup() {
  const navList = document.createElement('ul');
  navList.className = 'nav-list';

  NAV_CONFIG.items.forEach((item) => {
    const li = document.createElement('li');

    if (item.type === 'submenu') {
      li.className = 'has-submenu';

      const button = document.createElement('button');
      button.className = 'submenu-toggle';
      button.setAttribute('aria-haspopup', 'true');
      button.setAttribute('aria-expanded', 'false');

      const icon = createSvgIcon(item.icon);
      button.appendChild(icon);

      const span = document.createElement('span');
      span.textContent = item.label;
      button.appendChild(span);

      const toggleSpan = document.createElement('span');
      toggleSpan.className = 'toggle-icon';
      toggleSpan.appendChild(createToggleIcon());
      button.appendChild(toggleSpan);

      li.appendChild(button);

      // Create submenu
      const submenu = document.createElement('ul');
      submenu.className = 'submenu';
      submenu.hidden = true;

      item.items.forEach((subitem) => {
        const subli = document.createElement('li');
        const a = document.createElement('a');
        a.href = subitem.href;
        a.appendChild(createSvgIcon(subitem.icon));

        const labelSpan = document.createElement('span');
        labelSpan.textContent = subitem.label;
        a.appendChild(labelSpan);

        subli.appendChild(a);
        submenu.appendChild(subli);
      });

      li.appendChild(submenu);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      if (item.target) a.target = item.target;
      if (item.rel) a.rel = item.rel;

      a.appendChild(createSvgIcon(item.icon));

      const span = document.createElement('span');
      span.textContent = item.label;
      a.appendChild(span);

      li.appendChild(a);
    }

    navList.appendChild(li);
  });

  return navList;
}

// Build footer markup
function buildFooterMarkup() {
  const navFooter = document.createElement('div');
  navFooter.className = 'nav-footer';

  const footerLinks = document.createElement('div');
  footerLinks.className = 'nav-footer-links';

  NAV_CONFIG.social.forEach((social) => {
    const a = document.createElement('a');
    a.href = social.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', social.label);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', social.viewBox);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', social.path);
    path.setAttribute('fill', 'currentColor');

    svg.appendChild(path);
    a.appendChild(svg);
    footerLinks.appendChild(a);
  });

  navFooter.appendChild(footerLinks);

  const footerText = document.createElement('div');
  footerText.className = 'nav-footer-text';

  const v = window.__HAPARA_VERSION;
  if (v && v.commit && v.commit !== 'unknown') {
    // Expose for debugging
    window.haparaVersion = v;

    // Sanitize message for safe innerHTML use
    const safeMsg = (v.message || '').replace(
      /[<>"&]/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c]
    );

    footerText.innerHTML = `<div class="version-footer">
      <div class="version-footer-svg"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"><path d="M21.007 8.222A3.738 3.738 0 0 0 15.045 5.2a3.737 3.737 0 0 0 1.156 6.583 2.988 2.988 0 0 1-2.668 1.67h-2.99a4.456 4.456 0 0 0-2.989 1.165V7.4a3.737 3.737 0 1 0-1.494 0v9.117a3.776 3.776 0 1 0 1.816.099 2.99 2.99 0 0 1 2.668-1.667h2.99a4.484 4.484 0 0 0 4.223-3.039 3.736 3.736 0 0 0 3.25-3.687zM4.565 3.738a2.242 2.242 0 1 1 4.484 0 2.242 2.242 0 0 1-4.484 0zm4.484 16.441a2.242 2.242 0 1 1-4.484 0 2.242 2.242 0 0 1 4.484 0zm8.221-9.715a2.242 2.242 0 1 1 0-4.485 2.242 2.242 0 0 1 0 4.485z"></path></svg></div>
      <a href="https://github.com/hapara-fail/website/commit/${v.commit}" target="_blank" rel="noopener noreferrer" class="version-footer-link">${v.commit}</a>
      <span class="version-footer-sep">•</span>
      <span class="version-footer-msg" title="${safeMsg}">${safeMsg}</span>
    </div>`;
  } else {
    footerText.textContent = 'Made with 💖';
  }

  navFooter.appendChild(footerText);

  return navFooter;
}

(function () {
  const btn = document.querySelector('.hamburger-menu');
  const drawer = document.querySelector('[data-nav-drawer]');
  const overlay = document.querySelector('[data-nav-overlay]');
  if (!btn) return;

  // If markup isn't present on this page yet, create it now to ensure global behavior
  function ensureMarkupExists() {
    if (!overlay) {
      const ov = document.createElement('div');
      ov.className = 'nav-overlay';
      ov.setAttribute('data-nav-overlay', '');
      ov.hidden = true;
      document.body.appendChild(ov);
    }
    if (!drawer) {
      const nav = document.createElement('nav');
      nav.className = 'nav-drawer';
      nav.id = 'site-drawer';
      nav.setAttribute('aria-label', 'Main menu');
      nav.setAttribute('data-nav-drawer', '');
      nav.hidden = true;

      nav.appendChild(buildNavMarkup());
      nav.appendChild(buildFooterMarkup());

      document.body.appendChild(nav);
    } else {
      // Drawer exists but might be empty after HTML cleanup — populate if needed
      if (!drawer.querySelector('.nav-list')) drawer.appendChild(buildNavMarkup());
      if (!drawer.querySelector('.nav-footer')) drawer.appendChild(buildFooterMarkup());
    }
  }

  ensureMarkupExists();

  const drawerEl = document.querySelector('[data-nav-drawer]');
  const overlayEl = document.querySelector('[data-nav-overlay]');
  if (!drawerEl || !overlayEl) return;

  // Ensure ARIA attributes on button
  btn.setAttribute('aria-controls', 'site-drawer');
  if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');

  const focusableSelectors = 'a, button, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    drawerEl.hidden = false;
    overlayEl.hidden = false;
    requestAnimationFrame(function () {
      drawerEl.classList.add('is-open');
      overlayEl.classList.add('is-open');
    });
    document.body.classList.add('body-lock');
    var first = drawerEl.querySelector(focusableSelectors);
    if (first) first.focus();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', trapFocus);
  }

  function close() {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    drawerEl.classList.remove('is-open');
    overlayEl.classList.remove('is-open');
    document.body.classList.remove('body-lock');
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', trapFocus);
    setTimeout(function () {
      drawerEl.hidden = true;
      overlayEl.hidden = true;
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }, 300);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  function trapFocus(e) {
    if (!drawerEl.classList.contains('is-open')) return;
    if (!drawerEl.contains(e.target)) {
      var first = drawerEl.querySelector(focusableSelectors);
      if (first) first.focus();
    }
  }

  btn.addEventListener('click', function () {
    if (drawerEl.classList.contains('is-open')) close();
    else open();
  });
  overlayEl.addEventListener('click', close);

  // Submenus
  Array.prototype.forEach.call(drawerEl.querySelectorAll('.has-submenu'), function (group) {
    var toggle = group.querySelector('.submenu-toggle');
    var submenu = group.querySelector('.submenu');
    if (!toggle || !submenu) return;
    toggle.addEventListener('click', function () {
      var willOpen = !group.classList.contains('is-open');
      if (willOpen) {
        // Opening: unhide, wait for paint, then animate
        submenu.hidden = false;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            group.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
          });
        });
      } else {
        // Closing: animate out smoothly, then hide
        group.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        // Wait for longest animation: max-height (0.45s) + buffer
        setTimeout(function () {
          submenu.hidden = true;
        }, 480);
      }
    });
  });

  // ====== Scroll Header Show/Hide ======
  // Auto-hide header on scroll down, show on scroll up or at top
  const header = document.querySelector('.main-header');
  if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 50; // Minimum distance before triggering hide/show
    const scrollSpeed = 10; // Speed threshold to detect "fast" scrolling

    // Add class to manage header visibility
    header.classList.add('header-scrolling');

    // Add transition styles if not already defined
    if (!document.querySelector('#header-scroll-styles')) {
      const style = document.createElement('style');
      style.id = 'header-scroll-styles';
      style.textContent = `
                .main-header.header-scrolling {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .main-header.header-hidden {
                    transform: translateX(-50%) translateY(calc(-100% - 30px));
                }
            `;
      document.head.appendChild(style);
    }

    function updateHeader() {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Always show header at the very top
      if (currentScrollY <= scrollThreshold) {
        header.classList.remove('header-hidden');
      }
      // Hide when scrolling down fast
      else if (currentScrollY > lastScrollY && scrollDifference > scrollSpeed) {
        header.classList.add('header-hidden');
      }
      // Show when scrolling up fast
      else if (currentScrollY < lastScrollY && scrollDifference > scrollSpeed) {
        header.classList.remove('header-hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    // Listen to scroll events
    window.addEventListener('scroll', requestTick, { passive: true });

    // Initial check
    updateHeader();
  }
})();
