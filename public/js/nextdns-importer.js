document.addEventListener('astro:page-load', () => {
  const openNextDnsModalBtn = document.getElementById('open-nextdns-modal');
  const openControlDModalBtn = document.getElementById('open-controld-modal');
  if (!openNextDnsModalBtn && !openControlDModalBtn) return;

  // Control D Modal
  const cdOverlay = document.getElementById('controld-modal-overlay');
  const cdCloseBtn = document.getElementById('close-controld-modal');
  const cdGotItBtn = document.getElementById('controld-btn-close');

  const openCdModal = () => cdOverlay?.removeAttribute('hidden');
  const closeCdModal = () => cdOverlay?.setAttribute('hidden', '');

  openControlDModalBtn?.addEventListener('click', openCdModal);
  cdCloseBtn?.addEventListener('click', closeCdModal);
  cdGotItBtn?.addEventListener('click', closeCdModal);

  // NextDNS Modal Setup
  const overlay = document.getElementById('nextdns-modal-overlay');
  const closeBtn = document.getElementById('close-nextdns-modal');
  const step1 = document.getElementById('nextdns-step-1');
  const step2 = document.getElementById('nextdns-step-2');
  const step3 = document.getElementById('nextdns-step-3');
  const step4 = document.getElementById('nextdns-step-4');

  const apiKeyInput = document.getElementById('modal-nextdns-api-key');
  const profileIdInput = document.getElementById('modal-nextdns-profile-id');
  const loadingMessage = document.getElementById('nextdns-loading-message');

  const progressContainer = document.getElementById('nextdns-progress-container');
  const progressBar = document.getElementById('nextdns-import-progress');
  const etaMessage = document.getElementById('nextdns-eta-message');

  const btn1 = document.getElementById('nextdns-btn-1');
  const back1 = document.getElementById('nextdns-back-1');
  const btn2 = document.getElementById('nextdns-btn-2');
  const btnCloseSuccess = document.getElementById('nextdns-btn-close-success');

  const NEXTDNS_PROXY_PATH = '/api/nextdns';
  const BLOCKLIST_SOURCES = [
    'https://cdn.jsdelivr.net/gh/hapara-fail/blocklist@main/blocklist.txt',
    'https://raw.githubusercontent.com/hapara-fail/blocklist/refs/heads/main/blocklist.txt',
  ];
  const IMPORT_CONCURRENCY = 1;
  let globalPauseUntil = 0;
  let funnyMessageInterval = null;
  let isRateLimited = false;

  const FUNNY_MESSAGES = [
    'Bribing the DNS servers...',
    'Consulting the blocklist oracle...',
    'Convincing your router to behave...',
    'Adding extra strength to the denylist...',
    'Ensuring maximum ad-blocking capability...',
    'Polishing the allowlist rules...',
    'Routing around the bad stuff...',
  ];

  const validateApiKey = () => {
    const val = apiKeyInput.value.trim();
    const icon = apiKeyInput.nextElementSibling;
    if (val.length === 0) {
      apiKeyInput.classList.remove('is-valid', 'is-invalid');
      icon.classList.remove('is-valid', 'is-invalid');
    } else if (val.length === 40) {
      apiKeyInput.classList.remove('is-invalid');
      apiKeyInput.classList.add('is-valid');
      icon.classList.remove('is-invalid');
      icon.classList.add('is-valid');
    } else {
      apiKeyInput.classList.remove('is-valid');
      apiKeyInput.classList.add('is-invalid');
      icon.classList.remove('is-valid');
      icon.classList.add('is-invalid');
    }
  };
  apiKeyInput?.addEventListener('input', validateApiKey);

  const resetModalState = () => {
    apiKeyInput.value = '';
    profileIdInput.value = '';
    validateApiKey();
    goToStep(step1);
    stopLoadingMessages();
    progressContainer?.setAttribute('hidden', '');
  };

  const openNextDnsModal = () => {
    resetModalState();
    overlay?.removeAttribute('hidden');
  };

  const closeNextDnsModal = () => {
    overlay?.setAttribute('hidden', '');
    stopLoadingMessages();
  };

  openNextDnsModalBtn?.addEventListener('click', openNextDnsModal);
  closeBtn?.addEventListener('click', closeNextDnsModal);
  btnCloseSuccess?.addEventListener('click', closeNextDnsModal);

  const goToStep = (targetStep) => {
    [step1, step2, step3, step4].forEach((step) => {
      if (step === targetStep) {
        step.removeAttribute('hidden');
        step.classList.remove('fade-out');
        setTimeout(() => step.classList.remove('fade-in'), 50);
      } else {
        step.classList.add('fade-in');
        step.setAttribute('hidden', '');
      }
    });
  };

  btn1?.addEventListener('click', () => {
    if (apiKeyInput.value.trim().length !== 40) {
      apiKeyInput.focus();
      return;
    }
    step1.classList.add('fade-out');
    setTimeout(() => goToStep(step2), 250);
  });

  back1?.addEventListener('click', () => {
    step2.classList.add('fade-out');
    setTimeout(() => goToStep(step1), 250);
  });

  btn2?.addEventListener('click', () => {
    const rawId = profileIdInput.value.trim();
    if (!rawId) {
      profileIdInput.focus();
      return;
    }
    step2.classList.add('fade-out');
    setTimeout(() => {
      goToStep(step3);
      startImport(apiKeyInput.value.trim(), parseProfileId(rawId));
    }, 250);
  });

  const parseProfileId = (input) => {
    const match = input.match(/(?:my\.nextdns\.io\/)?([a-zA-Z0-9]{6})(?:\/|$)/i);
    return match ? match[1] : input;
  };

  const startLoadingMessages = () => {
    let msgIndex = 0;
    isRateLimited = false;
    loadingMessage.textContent = 'Fetching the blocklist...';

    funnyMessageInterval = setInterval(() => {
      if (!isRateLimited) {
        loadingMessage.textContent = FUNNY_MESSAGES[msgIndex % FUNNY_MESSAGES.length];
        msgIndex++;
      }
    }, 3000);
  };

  const stopLoadingMessages = () => {
    clearInterval(funnyMessageInterval);
  };

  let startTime = 0;
  const updateProgress = (completed, total) => {
    if (!progressContainer || !progressBar || !etaMessage) return;
    progressContainer.removeAttribute('hidden');
    progressBar.max = Math.max(total, 1);
    progressBar.value = completed;

    if (completed === 0 || total === 0) {
      etaMessage.textContent = 'Calculating time remaining...';
      return;
    }

    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / completed;
    const remainingItems = total - completed;
    const estimatedRemainingMs = avgTimePerItem * remainingItems;

    if (estimatedRemainingMs > 60000) {
      etaMessage.textContent = `About ${Math.ceil(estimatedRemainingMs / 60000)} minutes remaining...`;
    } else if (estimatedRemainingMs > 10000) {
      etaMessage.textContent = `About ${Math.ceil(estimatedRemainingMs / 1000)} seconds remaining...`;
    } else if (remainingItems === 0) {
      etaMessage.textContent = 'Wrapping up...';
    } else {
      etaMessage.textContent = 'Almost done...';
    }
  };

  // Importer Core Logic
  const formatApiErrors = (payload, fallback) => {
    if (!payload || !Array.isArray(payload.errors) || payload.errors.length === 0) return fallback;
    return payload.errors
      .map((e) => e.detail || e.title || e.code || 'NextDNS API error')
      .join(' ');
  };

  const readJsonSafely = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { errors: [{ detail: text }] };
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkGlobalPause = async () => {
    while (Date.now() < globalPauseUntil) {
      await delay(globalPauseUntil - Date.now() + 100);
    }
  };

  const nextDnsRequest = async (apiKey, path, options = {}, retries = 5) => {
    await checkGlobalPause();

    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    const proxyPayload = { apiKey, path, method: options.method || 'GET' };
    if (options.body) proxyPayload.body = JSON.parse(options.body);

    let response;
    try {
      response = await fetch(NEXTDNS_PROXY_PATH, {
        method: 'POST',
        headers,
        body: JSON.stringify(proxyPayload),
      });
    } catch {
      if (retries > 0) {
        await delay(2000);
        return nextDnsRequest(apiKey, path, options, retries - 1);
      }
      throw new Error('Could not reach the local NextDNS proxy.');
    }

    if (response.status === 429 && retries > 0) {
      isRateLimited = true;
      if (loadingMessage)
        loadingMessage.textContent =
          "Rate limited. Don't worry, the tool is still working as intended.";

      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : 30000 * Math.pow(1.5, 5 - retries) + Math.random() * 1000;
      const newPauseUntil = Date.now() + waitTime;
      if (newPauseUntil > globalPauseUntil) globalPauseUntil = newPauseUntil;

      setTimeout(() => {
        if (Date.now() >= globalPauseUntil) {
          isRateLimited = false;
        }
      }, waitTime);

      await delay(waitTime);
      return nextDnsRequest(apiKey, path, options, retries - 1);
    }

    const payload = await readJsonSafely(response);
    if (!response.ok || payload.errors) {
      if (response.status >= 500 && retries > 0) {
        await delay(2000);
        return nextDnsRequest(apiKey, path, options, retries - 1);
      }
      throw new Error(formatApiErrors(payload, `NextDNS API returned HTTP ${response.status}`));
    }
    return payload;
  };

  const normalizeDomain = (value) => {
    let domain = value
      .trim()
      .toLowerCase()
      .replace(/^\*\./, '')
      .replace(/^\.+/, '')
      .replace(/\.+$/, '');
    if (!domain || domain.includes('*') || domain.includes('/') || /\s/.test(domain)) return '';
    if (domain.length > 253 || !domain.includes('.')) return '';
    const labels = domain.split('.');
    const valid = labels.every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9-]+$/.test(label) &&
        !label.startsWith('-') &&
        !label.endsWith('-')
    );
    return valid ? domain : '';
  };

  const domainFromRule = (line) => {
    const withoutOptions = line.split('$')[0].trim();
    if (withoutOptions.startsWith('||'))
      return normalizeDomain(withoutOptions.slice(2).split('^')[0].split('|')[0]);
    if (withoutOptions.startsWith('|http://') || withoutOptions.startsWith('|https://')) {
      try {
        return normalizeDomain(new URL(withoutOptions.slice(1).replace(/\^$/, '')).hostname);
      } catch {
        return '';
      }
    }
    const hostsMatch = withoutOptions.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([^\s#]+)/);
    if (hostsMatch) return normalizeDomain(hostsMatch[1]);
    if (/^[a-z0-9.-]+$/i.test(withoutOptions)) return normalizeDomain(withoutOptions);
    return '';
  };

  const parseBlocklist = (content) => {
    const allowDomains = new Set();
    const denyDomains = new Set();
    content.split(/\r?\n/).forEach((rawLine) => {
      const line = rawLine.trim();
      if (
        !line ||
        line.startsWith('!') ||
        line.startsWith('[') ||
        line.includes('##') ||
        line.includes('#@#') ||
        line.includes('#$#')
      )
        return;
      if (line.startsWith('@@')) {
        const domain = domainFromRule(line.slice(2));
        if (domain) allowDomains.add(domain);
        return;
      }
      const domain = domainFromRule(line);
      if (domain) denyDomains.add(domain);
    });
    return { allowDomains: [...allowDomains].sort(), denyDomains: [...denyDomains].sort() };
  };

  const fetchBlocklist = async () => {
    let lastError;
    for (const source of BLOCKLIST_SOURCES) {
      try {
        const response = await fetch(source, {
          cache: 'no-store',
          headers: { Accept: 'text/plain' },
        });
        if (!response.ok) {
          lastError = new Error(`Blocklist fetch failed: HTTP ${response.status}`);
          continue;
        }
        const content = await response.text();
        const rules = parseBlocklist(content);
        if (rules.allowDomains.length + rules.denyDomains.length === 0) {
          lastError = new Error('Blocklist did not contain importable domains');
          continue;
        }
        return rules;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Unable to fetch the hapara.fail blocklist');
  };

  const fetchExistingList = async (apiKey, profileId, listName) => {
    const entries = new Map();
    let cursor = '';
    do {
      const query = new URLSearchParams();
      if (cursor) query.set('cursor', cursor);
      const payload = await nextDnsRequest(
        apiKey,
        `/profiles/${encodeURIComponent(profileId)}/${listName}${query.toString() ? `?${query.toString()}` : ''}`
      );
      const data = Array.isArray(payload.data) ? payload.data : [];
      data.forEach((entry) => {
        if (entry && entry.id) entries.set(entry.id.toLowerCase(), entry.active !== false);
      });
      cursor = payload.meta && payload.meta.pagination ? payload.meta.pagination.cursor : '';
    } while (cursor);
    return entries;
  };

  const runLimited = async (items, worker) => {
    let currentIndex = 0;
    const results = [];
    const runWorker = async () => {
      while (currentIndex < items.length) {
        const item = items[currentIndex];
        currentIndex += 1;
        try {
          results.push(await worker(item));
        } catch (error) {
          results.push({ item, error });
        }
        updateProgress(currentIndex, items.length);
        await delay(500);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(IMPORT_CONCURRENCY, items.length) }, () => runWorker())
    );
    return results;
  };

  const buildOperations = (domains, existing, listName) => {
    return domains
      .map((domain) => {
        if (!existing.has(domain)) return { action: 'add', domain, listName };
        if (!existing.get(domain)) return { action: 'activate', domain, listName };
        return null;
      })
      .filter(Boolean);
  };

  const startImport = async (apiKey, profileId) => {
    startLoadingMessages();
    startTime = Date.now();
    try {
      const rules = await fetchBlocklist();

      if (!isRateLimited && loadingMessage) {
        loadingMessage.textContent = 'Checking existing denylist and allowlist...';
      }

      const [existingDenylist, existingAllowlist] = await Promise.all([
        fetchExistingList(apiKey, profileId, 'denylist'),
        fetchExistingList(apiKey, profileId, 'allowlist'),
      ]);
      const operations = [
        ...buildOperations(rules.denyDomains, existingDenylist, 'denylist'),
        ...buildOperations(rules.allowDomains, existingAllowlist, 'allowlist'),
      ];

      if (operations.length > 0) {
        updateProgress(0, operations.length);
        await runLimited(operations, async (op) => {
          if (op.action === 'add') {
            await nextDnsRequest(
              apiKey,
              `/profiles/${encodeURIComponent(profileId)}/${op.listName}`,
              {
                method: 'POST',
                body: JSON.stringify({ id: op.domain, active: true }),
              }
            );
            return { ...op, status: 'added' };
          }
          try {
            await nextDnsRequest(
              apiKey,
              `/profiles/${encodeURIComponent(profileId)}/${op.listName}/${encodeURIComponent(op.domain)}`,
              { method: 'DELETE' }
            );
          } catch (e) {
            if (e.message && e.message.includes('429')) throw e;
          }
          await nextDnsRequest(
            apiKey,
            `/profiles/${encodeURIComponent(profileId)}/${op.listName}`,
            {
              method: 'POST',
              body: JSON.stringify({ id: op.domain, active: true }),
            }
          );
          return { ...op, status: 'activated' };
        });
      }

      stopLoadingMessages();
      step3.classList.add('fade-out');
      setTimeout(() => {
        goToStep(step4);
        fireConfetti();
      }, 250);
    } catch (error) {
      stopLoadingMessages();
      alert(`Import Error: ${error.message}`);
      step3.classList.add('fade-out');
      setTimeout(() => goToStep(step1), 250);
    }
  };

  const fireConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#524af2', '#a855f7', '#4ade80', '#f4efff', '#16152e'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 2,
        dx: Math.random() * 4 - 2,
        dy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
      });
    }

    let animationId;
    let frames = 0;
    const fadeStartY = canvas.height * 0.78;
    const fadeEndY = canvas.height + 120;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleInc;
        p.dy += 0.018;
        p.y += p.dy;
        p.x += Math.sin(p.tiltAngle) * 2;

        const alpha = p.y <= fadeStartY ? 1 : Math.max(0, 1 - (p.y - fadeStartY) / (fadeEndY - fadeStartY));
        if (alpha > 0) active = true;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.moveTo(p.x + p.tilt + p.r, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      frames++;
      if (active && frames < 420) {
        animationId = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };
    draw();
  };
});
