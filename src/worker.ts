/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { getDb } from './lib/db';
import { getAuth } from './lib/auth';
import type { Auth } from './lib/auth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_ENABLE_RESET_LOGGING?: boolean;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

type AppVariables = { auth: Auth };
type AppType = { Bindings: Env; Variables: AppVariables };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOG_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BLOG_SLUG_LENGTH = 200;
const BLOG_PATH_PREFIX = '/blog/';

const REDIRECT_MAP: ReadonlyMap<string, string> = new Map<string, string>([
  ['/bypass', '/services/dns'],
  ['/dns', '/services/dns'],
  ['/forms', '/tool/gfu'],

  ['/discord', 'https://discord.gg/KA66dHUF4P'],
  ['/github', 'https://github.com/hapara-fail'],
]);

const ROUTE_MAP: ReadonlyMap<string, string> = new Map<string, string>([
  ['/', 'index.html'],
  ['/about', 'about.html'],
  ['/contribute', 'contribute.html'],
  ['/terms', 'terms.html'],
  ['/privacy', 'privacy.html'],
  ['/services/dns', 'dns-service.html'],
  ['/tool/gfu', 'gfu-tool.html'],
  ['/blog', 'blog.html'],
  ['/license', 'license.html'],

  // Auth pages
  ['/login', 'login.html'],
  ['/signup', 'signup.html'],
  ['/forgot-password', 'forgot-password.html'],
  ['/reset-password', 'reset-password.html'],
  ['/dashboard', 'dashboard.html'],
]);

// ---------------------------------------------------------------------------
// Helpers (preserved from original worker)
// ---------------------------------------------------------------------------

/**
 * Build a sanitized set of headers to forward when fetching assets.
 * Only forwards a small set of safe, relevant headers (e.g., cache validators).
 */
function buildAssetRequestHeaders(request: Request): Headers {
  const incoming = request.headers;
  const forwarded = new Headers();

  // Allow list of headers to forward to the asset fetch.
  const allowedHeaderNames = [
    'if-none-match',
    'if-modified-since',
    'accept',
    'accept-language',
    'user-agent',
  ];

  for (const name of allowedHeaderNames) {
    const value = incoming.get(name);
    if (value !== null) {
      forwarded.set(name, value);
    }
  }

  return forwarded;
}

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function setSecurityHeaders(headers: Headers): void {
  if (!headers.has('X-Content-Type-Options')) headers.set('X-Content-Type-Options', 'nosniff');
  if (!headers.has('Referrer-Policy'))
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!headers.has('X-Frame-Options')) headers.set('X-Frame-Options', 'SAMEORIGIN');
  if (!headers.has('Content-Security-Policy')) {
    const cspDirectives = [
      "default-src 'self';",
      "img-src 'self' data:;",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "font-src 'self' https://fonts.gstatic.com;",
      // Cloudflare Turnstile requires its own origin for scripts and the
      // challenge iframe. Without this, browsers silently block the widget.
      "script-src 'self' https://challenges.cloudflare.com;",
      "frame-src https://challenges.cloudflare.com;",
      "connect-src 'self' https://dns-monitor.a9x.workers.dev https://raw.githubusercontent.com;",
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self' https://docs.google.com;",
      "frame-ancestors 'self'",
    ];
    headers.set('Content-Security-Policy', cspDirectives.join(' '));
  }
  if (!headers.has('Strict-Transport-Security')) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  if (!headers.has('Permissions-Policy')) {
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  }
  // [M-4] Prevents Adobe Flash/PDF cross-domain data reads.
  if (!headers.has('X-Permitted-Cross-Domain-Policies')) {
    headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  }
}

function applySecurityHeaders(body: BodyInit | null, init: ResponseInit): Response;
function applySecurityHeaders(original: Response): Response;
function applySecurityHeaders(
  bodyOrResponse: Response | BodyInit | null,
  init?: ResponseInit
): Response {
  if (bodyOrResponse instanceof Response) {
    const cloned = bodyOrResponse.clone();
    const headers = new Headers(cloned.headers);
    setSecurityHeaders(headers);
    if (cloned.status === 304) {
      return new Response(null, { status: 304, headers });
    }
    return new Response(cloned.body, { status: cloned.status, headers });
  }
  const resp = new Response(bodyOrResponse, init);
  setSecurityHeaders(resp.headers);
  return resp;
}

function handleAssetResponse(response: Response): Response | null {
  if (response.status === 304 || response.ok) {
    return applySecurityHeaders(response);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hono App
// ---------------------------------------------------------------------------

const app = new Hono<AppType>();

// ---------------------------------------------------------------------------
// Shared middleware – initialise auth once per /api/* request
// ---------------------------------------------------------------------------

app.use('/api/*', async (c, next) => {
  // [H-4] Reject requests early if the auth secret is missing or too short.
  // A secret shorter than 32 chars is cryptographically weak and allows
  // session tokens to be forged.
  if (!c.env.BETTER_AUTH_SECRET || c.env.BETTER_AUTH_SECRET.length < 32) {
    return c.json(
      { error: 'Server misconfiguration: invalid auth secret.' },
      500
    );
  }

  const db = getDb(c.env.DB);
  const auth = getAuth(db, {
    BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
    BETTER_AUTH_ENABLE_RESET_LOGGING: c.env.BETTER_AUTH_ENABLE_RESET_LOGGING,
    TURNSTILE_SECRET_KEY: c.env.TURNSTILE_SECRET_KEY,
  });
  c.set('auth', auth);
  await next();
});

// [H-1] Rate limiting for auth endpoints.
// Configure Cloudflare WAF rules (Dashboard → Security → WAF → Rate Limiting)
// targeting /api/auth/sign-in/email and /api/auth/sign-up/email:
//   - Max 10 requests / 60 seconds per IP for sign-in (brute-force protection)
//   - Max 5 requests / 60 seconds per IP for sign-up (spam prevention)
//   - Max 3 requests / 300 seconds per IP for forget-password (reset flooding)
// Workers KV-based rate limiting can be added here when KV is provisioned.

// ---------------------------------------------------------------------------
// Auth API Routes – mounted BEFORE the static site catch-all
// These accept POST and GET, so they must not be blocked by the method check.
// ---------------------------------------------------------------------------

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const auth = c.get('auth');
  return auth.handler(c.req.raw);
});

// ---------------------------------------------------------------------------
// Protected API route – /api/me
// ---------------------------------------------------------------------------

app.get('/api/me', async (c) => {
  const auth = c.get('auth');
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // [M-2] Whitelist only the fields the client actually needs.
  // Do not spread the full session/user object — new fields added by library
  // upgrades (e.g., tokens, internal flags) should not be auto-exposed.
  const { token, ipAddress, userAgent, ...safeSession } =
    (session.session as Record<string, unknown>) ?? {};

  const rawUser = session.user as Record<string, unknown>;
  const safeUser = {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    image: rawUser.image ?? null,
    emailVerified: rawUser.emailVerified ?? false,
  };

  return c.json({
    user: safeUser,
    session: safeSession,
  });
});

// ---------------------------------------------------------------------------
// Static Site – All remaining routes (preserved original worker logic)
// ---------------------------------------------------------------------------

app.all('*', async (c) => {
  const request = c.req.raw;
  const url = new URL(request.url);
  const normalizedPath = normalizePath(url.pathname);
  const method = request.method.toUpperCase();

  // Only allow safe methods for static site routes
  if (method !== 'GET' && method !== 'HEAD') {
    return applySecurityHeaders('Method Not Allowed', {
      status: 405,
      headers: {
        Allow: 'GET, HEAD',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  // Check if this is a redirect
  const redirectTarget = REDIRECT_MAP.get(normalizedPath);
  if (redirectTarget) {
    return applySecurityHeaders(null, {
      status: 301,
      headers: {
        Location: redirectTarget,
      },
    });
  }

  // Check if this is a mapped route
  let htmlFilename = ROUTE_MAP.get(normalizedPath);

  // /blog/[slug] -> blog-[slug].html
  if (!htmlFilename && normalizedPath.startsWith(BLOG_PATH_PREFIX)) {
    const slug = normalizedPath.slice(BLOG_PATH_PREFIX.length);
    if (slug && slug.length <= MAX_BLOG_SLUG_LENGTH && BLOG_SLUG_REGEX.test(slug)) {
      htmlFilename = `blog-${slug}.html`;
    }
  }

  // If we have a mapped HTML file, fetch it from assets
  if (htmlFilename) {
    const assetUrl = new URL(url);
    assetUrl.pathname = `/${htmlFilename}`;
    const response = await c.env.ASSETS.fetch(assetUrl, {
      method: request.method,
      headers: buildAssetRequestHeaders(request),
    });
    let mappedAssetResponse = handleAssetResponse(response);
    
    // Inject Turnstile Site Key into auth pages
    if (mappedAssetResponse && ['login.html', 'signup.html', 'forgot-password.html'].includes(htmlFilename)) {
      mappedAssetResponse = new HTMLRewriter()
        .on('[data-sitekey="TURNSTILE_SITE_KEY_PLACEHOLDER"]', {
          element(element) {
            element.setAttribute('data-sitekey', c.env.TURNSTILE_SITE_KEY || '');
          }
        })
        .transform(mappedAssetResponse);
    }

    if (mappedAssetResponse) return mappedAssetResponse;
    // For mapped HTML routes, if the asset fetch fails, fall through to 404 handling below.
  } else {
    // For static assets (CSS, JS, images, etc.), pass through with sanitized headers
    const assetRequest = new Request(request.url, {
      method: request.method,
      headers: buildAssetRequestHeaders(request),
    });
    const response = await c.env.ASSETS.fetch(assetRequest);
    const staticAssetResponse = handleAssetResponse(response);
    if (staticAssetResponse) return staticAssetResponse;
  }

  // 404 fallback - fetch 404.html
  const notFoundUrl = new URL(url);
  notFoundUrl.pathname = '/404.html';

  const notFoundResponse = await c.env.ASSETS.fetch(notFoundUrl, {
    method: request.method,
    headers: buildAssetRequestHeaders(request),
  });

  const processedNotFoundResponse = handleAssetResponse(notFoundResponse);
  // Only short-circuit 304 Not Modified responses; allow 200 OK to be rewrapped as 404 below.
  if (processedNotFoundResponse && processedNotFoundResponse.status === 304) {
    return processedNotFoundResponse;
  }

  // For successful responses, wrap in 404 status
  if (notFoundResponse.ok) {
    const resp = new Response(notFoundResponse.body, {
      status: 404,
      headers: notFoundResponse.headers,
    });
    return applySecurityHeaders(resp);
  }

  // Ultimate fallback
  const resp = new Response('Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
  return applySecurityHeaders(resp);
});

export default app;
