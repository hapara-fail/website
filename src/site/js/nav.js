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
          icon: [
            'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
            'm9 12 2 2 4-4',
          ],
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
      ],
    },
    {
      type: 'link',
      href: '/contribute',
      label: 'Contribute',
      icon: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5',
    },
    {
      type: 'link',
      href: 'https://support.hapara.fail/',
      label: 'Support',
      icon: [
        'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719',
        'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3',
        'M12 17h.01',
      ],
    },
  ],
  social: [
    {
      href: 'https://discord.gg/KA66dHUF4P',
      label: 'Discord',
      viewBox: '0 0 24 24',
      path: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
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
      path: 'M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z',
    },
  ],
};

// Helper to create SVG element
function createSvgIcon(iconPath, role = null, ariaLabelledBy = null) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke', 'currentColor');

  const paths = Array.isArray(iconPath) ? iconPath : [iconPath];
  paths.forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  if (role) svg.setAttribute('role', role);
  if (ariaLabelledBy) svg.setAttribute('aria-labelledby', ariaLabelledBy);

  // Mark as decorative if no explicit accessible role is set
  if (!role && !ariaLabelledBy) {
    svg.setAttribute('aria-hidden', 'true');
  }

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
  svg.setAttribute('aria-hidden', 'true');

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
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', social.path);

    if (social.fill) {
      path.setAttribute('fill', social.fill);
    } else {
      path.setAttribute('fill', 'currentColor');
    }

    if (social.stroke) {
      path.setAttribute('stroke', social.stroke);
      if (social.strokeWidth) path.setAttribute('stroke-width', social.strokeWidth);
      if (social.strokeLinecap) path.setAttribute('stroke-linecap', social.strokeLinecap);
      if (social.strokeLinejoin) path.setAttribute('stroke-linejoin', social.strokeLinejoin);
    }

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

    // Validate that commit looks like a short/full git SHA
    const commitRegex = /^[0-9a-f]{7,40}$/i;
    if (!commitRegex.test(v.commit)) {
      footerText.textContent = 'Made with 💖';
      navFooter.appendChild(footerText);
      return navFooter;
    }

    // Sanitize both message and commit for safe innerHTML use
    const safeMsg = (v.message || '').replace(
      /[<>"&]/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c]
    );
    const safeCommit = v.commit.replace(
      /[<>"&]/g,
      (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c]
    );

    footerText.innerHTML = `<div class="version-footer">
      <div class="version-footer-svg"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor"><path d="M21.007 8.222A3.738 3.738 0 0 0 15.045 5.2a3.737 3.737 0 0 0 1.156 6.583 2.988 2.988 0 0 1-2.668 1.67h-2.99a4.456 4.456 0 0 0-2.989 1.165V7.4a3.737 3.737 0 1 0-1.494 0v9.117a3.776 3.776 0 1 0 1.816.099 2.99 2.99 0 0 1 2.668-1.667h2.99a4.484 4.484 0 0 0 4.223-3.039 3.736 3.736 0 0 0 3.25-3.687zM4.565 3.738a2.242 2.242 0 1 1 4.484 0 2.242 2.242 0 0 1-4.484 0zm4.484 16.441a2.242 2.242 0 1 1-4.484 0 2.242 2.242 0 0 1 4.484 0zm8.221-9.715a2.242 2.242 0 1 1 0-4.485 2.242 2.242 0 0 1 0 4.485z"></path></svg></div>
      <a href="https://github.com/hapara-fail/website/commit/${safeCommit}" target="_blank" rel="noopener noreferrer" class="version-footer-link">${safeCommit}</a>
      <span class="version-footer-sep">&bull;</span>
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

  // Track running WAAPI animations so we can cancel on re-open / re-close
  let _itemAnims = [];
  // Monotonically-incrementing token used to invalidate stale close() cleanup
  // callbacks (transitionend + safety setTimeout) when open() is called first.
  let _closeId = 0;

  function open() {
    lastFocused = document.activeElement;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');

    // Invalidate any in-flight close() cleanup handlers
    _closeId++;

    // Cancel any lingering close animations (this reverts fill:forwards state)
    _itemAnims.forEach((a) => a.cancel());
    _itemAnims = [];

    // Reveal elements so they can be painted
    drawerEl.hidden = false;
    overlayEl.hidden = false;

    // Wait one frame so hidden=false paints, then trigger CSS transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drawerEl.classList.add('is-open');
        overlayEl.classList.add('is-open');
        drawerEl.style.overflow = 'hidden';
        const navList = drawerEl.querySelector('.nav-list');
        if (navList) navList.style.overflow = 'hidden';

        // Stagger-animate each top-level nav item
        const items = drawerEl.querySelectorAll('.nav-list > li');
        let lastAnim = null;
        items.forEach((li, i) => {
          const anim = li.animate(
            [
              { opacity: 0, transform: 'translateX(20px) scale(0.97)', filter: 'blur(3px)' },
              { opacity: 1, transform: 'translateX(0)   scale(1)', filter: 'blur(0px)' },
            ],
            {
              duration: 380,
              delay: 60 + i * 45,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            }
          );
          _itemAnims.push(anim);
          lastAnim = anim;
        });

        // Animate the footer in slightly after the items
        const footer = drawerEl.querySelector('.nav-footer');
        if (footer) {
          const footerAnim = footer.animate(
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 340,
              delay: 60 + items.length * 45 + 20,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            }
          );
          _itemAnims.push(footerAnim);
          // Remove overflow clip once the last animation finishes
          footerAnim.onfinish = () => {
            drawerEl.style.overflow = '';
            if (navList) navList.style.overflow = '';
          };
        } else if (lastAnim) {
          lastAnim.onfinish = () => {
            drawerEl.style.overflow = '';
            if (navList) navList.style.overflow = '';
          };
        }
      });
    });

    document.body.classList.add('body-lock');
    const first = drawerEl.querySelector(focusableSelectors);
    if (first) first.focus();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', trapFocus);
  }

  function close() {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');

    // Stamp this close so any async callbacks can check if they're still valid
    const myCloseId = ++_closeId;

    // Cancel any running open-stagger animations
    _itemAnims.forEach((a) => a.cancel());
    _itemAnims = [];

    // Clip overflow on drawer + list during close-out animations too
    drawerEl.style.overflow = 'hidden';
    const navList = drawerEl.querySelector('.nav-list');
    if (navList) navList.style.overflow = 'hidden';

    // Quick fade-out of items in reverse before drawer slides away
    const items = drawerEl.querySelectorAll('.nav-list > li');
    const total = items.length;
    items.forEach((li, i) => {
      const anim = li.animate(
        [
          { opacity: 1, transform: 'translateX(0)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translateX(14px)', filter: 'blur(2px)' },
        ],
        {
          duration: 180,
          delay: (total - 1 - i) * 22,
          easing: 'cubic-bezier(0.4, 0, 1, 1)',
          fill: 'forwards',
        }
      );
      _itemAnims.push(anim);
    });

    const footer = drawerEl.querySelector('.nav-footer');
    if (footer) {
      const footerAnim = footer.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(8px)' },
        ],
        {
          duration: 140,
          easing: 'cubic-bezier(0.4, 0, 1, 1)',
          fill: 'forwards',
        }
      );
      _itemAnims.push(footerAnim);
    }

    // After items fade, slide drawer out via CSS transition
    const itemFadeDuration = total * 22 + 180;
    setTimeout(
      () => {
        if (_closeId !== myCloseId) return; // drawer was re-opened, bail
        drawerEl.classList.remove('is-open');
        overlayEl.classList.remove('is-open');
      },
      Math.min(itemFadeDuration, 240)
    );

    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', trapFocus);

    // Clean up after the CSS slide-out transition finishes
    function onTransitionEnd(e) {
      if (e.propertyName !== 'transform') return;
      drawerEl.removeEventListener('transitionend', onTransitionEnd);
      if (_closeId !== myCloseId) return;
      drawerEl.hidden = true;
      overlayEl.hidden = true;
      drawerEl.style.overflow = '';
      if (navList) navList.style.overflow = '';
      document.body.classList.remove('body-lock');
      _itemAnims.forEach((a) => a.cancel());
      _itemAnims = [];
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    drawerEl.addEventListener('transitionend', onTransitionEnd);

    // Safety fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (_closeId !== myCloseId) return;
      drawerEl.hidden = true;
      overlayEl.hidden = true;
      drawerEl.style.overflow = '';
      if (navList) navList.style.overflow = '';
      document.body.classList.remove('body-lock');
    }, 620);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  function trapFocus(e) {
    if (!drawerEl.classList.contains('is-open')) return;
    if (!drawerEl.contains(e.target)) {
      const first = drawerEl.querySelector(focusableSelectors);
      if (first) first.focus();
    }
  }

  btn.addEventListener('click', function () {
    if (drawerEl.classList.contains('is-open')) close();
    else open();
  });
  overlayEl.addEventListener('click', close);

  // Submenus — polished toggle with WAAPI stagger
  // Uses an explicit state machine + monotonic token to prevent misalignment on spam clicks.
  Array.from(drawerEl.querySelectorAll('.has-submenu')).forEach(function (group) {
    const toggle = group.querySelector('.submenu-toggle');
    const submenu = group.querySelector('.submenu');
    if (!toggle || !submenu) return;

    // Source of truth: 'closed' | 'opening' | 'open' | 'closing'
    let _subState = 'closed';
    // Monotonically-incrementing token — stale async callbacks compare against this
    let _subToken = 0;
    let _subAnims = [];

    function openSubmenu() {
      _subState = 'opening';
      const myToken = ++_subToken;

      // Cancel any in-flight animations immediately
      _subAnims.forEach((a) => a.cancel());
      _subAnims = [];

      // Make sure submenu is visible before animating
      submenu.hidden = false;
      group.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');

      requestAnimationFrame(function () {
        if (_subToken !== myToken) return; // superseded by another click
        requestAnimationFrame(function () {
          if (_subToken !== myToken) return;

          const subItems = submenu.querySelectorAll('li');
          let lastAnim = null;
          subItems.forEach((li, idx) => {
            const a = li.animate(
              [
                { opacity: 0, transform: 'translateY(-10px) scale(0.95)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' },
              ],
              {
                duration: 320,
                delay: idx * 40,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                fill: 'both',
              }
            );
            _subAnims.push(a);
            lastAnim = a;
          });

          if (lastAnim) {
            lastAnim.onfinish = () => {
              if (_subToken === myToken) _subState = 'open';
            };
          } else {
            _subState = 'open';
          }
        });
      });
    }

    function closeSubmenu() {
      _subState = 'closing';
      const myToken = ++_subToken;

      // Cancel any in-flight animations immediately
      _subAnims.forEach((a) => a.cancel());
      _subAnims = [];

      // Update toggle state right away so re-clicks read correctly
      group.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');

      const subItems = submenu.querySelectorAll('li');
      const count = subItems.length;
      let lastAnim = null;
      subItems.forEach((li, idx) => {
        const a = li.animate(
          [
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(-6px) scale(0.97)' },
          ],
          {
            duration: 180,
            delay: (count - 1 - idx) * 25,
            easing: 'cubic-bezier(0.4, 0, 1, 1)',
            fill: 'forwards',
          }
        );
        _subAnims.push(a);
        lastAnim = a;
      });

      const totalDur = count * 25 + 180;
      const hideDur = Math.min(totalDur, 260);

      if (lastAnim) {
        lastAnim.onfinish = () => {
          if (_subToken !== myToken) return;
          submenu.hidden = true;
          _subAnims.forEach((a) => a.cancel());
          _subAnims = [];
          _subState = 'closed';
        };
      }

      // Safety fallback in case onfinish doesn't fire (e.g. zero items)
      setTimeout(function () {
        if (_subToken !== myToken) return;
        submenu.hidden = true;
        _subAnims.forEach((a) => a.cancel());
        _subAnims = [];
        _subState = 'closed';
      }, hideDur + 50);
    }

    toggle.addEventListener('click', function () {
      // Decide intent based on explicit state, not DOM class (which lags behind)
      if (_subState === 'closed' || _subState === 'closing') {
        openSubmenu();
      } else {
        closeSubmenu();
      }
    });
  });

  // ====== Scroll Header Show/Hide ======
  // Auto-hide header on scroll down, show on scroll up or at top
  const header = document.querySelector('.main-header');
  if (header) {
    let lastScrollY = 0;
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
      // Hide when scrolling down fast (but not if focused element is in header)
      else if (currentScrollY > lastScrollY && scrollDifference > scrollSpeed) {
        if (!header.contains(document.activeElement)) {
          header.classList.add('header-hidden');
        }
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

    // Initial check deferred to avoid forced reflow
    window.requestAnimationFrame(function () {
      lastScrollY = window.scrollY;
      updateHeader();
    });
  }
})();
