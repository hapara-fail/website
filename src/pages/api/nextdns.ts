import type { APIRoute } from 'astro';

export const prerender = false;

const NEXTDNS_API_BASE = 'https://api.nextdns.io';
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PATCH', 'DELETE']);
const ALLOWED_LISTS = new Set(['allowlist', 'denylist']);

type ProxyRequestBody = {
  apiKey?: unknown;
  body?: unknown;
  method?: unknown;
  path?: unknown;
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

function isAllowedNextDnsPath(path: string): boolean {
  if (!path.startsWith('/profiles')) return false;
  if (path.includes('://') || path.includes('..') || path.includes('//')) return false;

  const url = new URL(path, NEXTDNS_API_BASE);
  if (url.origin !== NEXTDNS_API_BASE) return false;

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length === 1 && parts[0] === 'profiles') return true;
  if (parts.length < 3 || parts[0] !== 'profiles') return false;

  const listName = parts[2];
  if (!ALLOWED_LISTS.has(listName)) return false;

  return parts.length === 3 || parts.length === 4;
}

export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let payload: ProxyRequestBody;

  try {
    payload = (await request.json()) as ProxyRequestBody;
  } catch {
    return jsonResponse({ errors: [{ detail: 'Invalid JSON request body.' }] }, { status: 400 });
  }

  const apiKey = typeof payload.apiKey === 'string' ? payload.apiKey.trim() : '';
  const path = typeof payload.path === 'string' ? payload.path.trim() : '';
  const method = typeof payload.method === 'string' ? payload.method.toUpperCase() : 'GET';

  if (!apiKey) {
    return jsonResponse({ errors: [{ detail: 'Missing NextDNS API key.' }] }, { status: 400 });
  }

  if (!path || !isAllowedNextDnsPath(path)) {
    return jsonResponse({ errors: [{ detail: 'Unsupported NextDNS API path.' }] }, { status: 400 });
  }

  if (!ALLOWED_METHODS.has(method)) {
    return jsonResponse(
      { errors: [{ detail: 'Unsupported NextDNS API method.' }] },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const headers = new Headers({
    Accept: 'application/json',
    'X-Api-Key': apiKey,
  });

  let body: string | undefined;
  if (method !== 'GET' && payload.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(payload.body);
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(new URL(path, NEXTDNS_API_BASE), {
      method,
      headers,
      body,
    });
  } catch {
    return jsonResponse(
      { errors: [{ detail: 'Could not reach the NextDNS API from the server.' }] },
      { status: 502 }
    );
  }

  const responseText = await upstreamResponse.text();
  const responseHeaders = new Headers({
    'Content-Type':
      upstreamResponse.headers.get('Content-Type') || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });

  const rateLimitHeaders = [
    'Retry-After',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
  ];
  rateLimitHeaders.forEach((header) => {
    const value = upstreamResponse.headers.get(header);
    if (value) {
      responseHeaders.set(header, value);
    }
  });

  const noBodyStatuses = new Set([101, 204, 205, 304]);
  const responseBody = noBodyStatuses.has(upstreamResponse.status) ? null : responseText || '{}';

  return new Response(responseBody, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};
