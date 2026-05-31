import { defineMiddleware } from 'astro:middleware';

function setSecurityHeaders(headers: Headers): void {
  if (!headers.has('X-Content-Type-Options')) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }
  if (!headers.has('Referrer-Policy')) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  if (!headers.has('X-Frame-Options')) {
    headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  if (!headers.has('Content-Security-Policy')) {
    const cspDirectives = [
      "default-src 'self';",
      "style-src 'self' 'unsafe-inline';",
      "font-src 'self';",
      "img-src 'self' data:;",
      "script-src 'self' 'unsafe-inline';",
      "connect-src 'self' https://monitor.dns.hapara.fail https://monitor.dns2.hapara.fail https://raw.githubusercontent.com;",
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
}

/**
 * Astro middleware that applies security headers and enforces safe HTTP methods.
 * Replaces the equivalent logic from the former custom Cloudflare Worker (src/worker.ts).
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const method = _context.request.method.toUpperCase();

  // Only allow safe methods for a static site
  if (method !== 'GET' && method !== 'HEAD') {
    const headers = new Headers({
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    setSecurityHeaders(headers);

    return new Response('Method Not Allowed', {
      status: 405,
      headers,
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);

  // Security headers based on the former worker.
  setSecurityHeaders(headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
