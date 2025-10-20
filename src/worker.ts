/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ASSETS: Fetcher;
}

const ROUTE_MAP: ReadonlyMap<string, string> = new Map<string, string>([
  ['/', 'index.html'],
  ['/about', 'about.html'],
  ['/contribute', 'contribute.html'],
  ['/terms', 'tos.html'],
  ['/privacy', 'privacy.html'],
  ['/services/dns', 'dns-service.html'],
  ['/tool/gfu', 'gfu-tool.html'],
  ['/tool/wifi', 'wifi-tool.html'],
  ['/blog', 'blog.html'],
]);

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function setSecurityHeaders(headers: Headers): void {
  if (!headers.has('X-Content-Type-Options')) headers.set('X-Content-Type-Options', 'nosniff');
  if (!headers.has('Referrer-Policy')) headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!headers.has('X-Frame-Options')) headers.set('X-Frame-Options', 'SAMEORIGIN');
}

function applySecurityHeaders(original: Response): Response {
  const headers = new Headers(original.headers);
  setSecurityHeaders(headers);
  if (original.status === 304) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(original.body, { status: original.status, headers });
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);
    const method = request.method.toUpperCase();

    // Only allow safe methods for static site
    if (method !== 'GET' && method !== 'HEAD') {
      const resp = new Response('Method Not Allowed', {
        status: 405,
        headers: {
          'Allow': 'GET, HEAD',
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
      setSecurityHeaders(resp.headers);
      return resp;
    }

    // Check if this is a mapped route
    let htmlFile = ROUTE_MAP.get(path);

    // /blog/[slug] -> blog-[slug].html
    if (!htmlFile && path.startsWith('/blog/')) {
      const slug = path.slice('/blog/'.length);
      if (slug && /^[a-z0-9-]+$/.test(slug)) {
        htmlFile = `blog-${slug}.html`;
      }
    }

    // If we have a mapped HTML file, fetch it from assets
    if (htmlFile) {
      const assetUrl = new URL(url);
      assetUrl.pathname = `/${htmlFile}`;
      const response = await env.ASSETS.fetch(assetUrl.toString(), {
        method: request.method,
        headers: request.headers
      });
      if (response.status === 304) return applySecurityHeaders(response);
      if (response.ok) return applySecurityHeaders(response);
    }

    // For static assets (CSS, JS, images, etc.), pass through
    const response = await env.ASSETS.fetch(request);
    if (response.status === 304) return applySecurityHeaders(response);
    if (response.ok) return applySecurityHeaders(response);

    // 404 fallback - fetch 404.html
    const notFoundUrl = new URL(url);
    notFoundUrl.pathname = '/404.html';

    const notFoundResponse = await env.ASSETS.fetch(notFoundUrl.toString(), {
      method: request.method,
      headers: request.headers
    });

    if (notFoundResponse.status === 304) return applySecurityHeaders(notFoundResponse);
    if (notFoundResponse.ok) {
      const resp = new Response(notFoundResponse.body, {
        status: 404,
        headers: notFoundResponse.headers
      });
      return applySecurityHeaders(resp);
    }

    // Ultimate fallback
    const resp = new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    return applySecurityHeaders(resp);
  }
} satisfies ExportedHandler<Env>;