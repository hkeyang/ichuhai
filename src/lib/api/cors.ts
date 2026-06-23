export function securityHeaders(request: Request, env: CloudflareEnv): Record<string, string> {
  const origin = (request.headers.get('origin') || '').replace(/\/$/, '');
  const allowed = new Set(
    [env.PUBLIC_SITE_URL, ...(env.ALLOWED_ORIGINS || '').split(',')]
      .filter(Boolean)
      .map((s) => s.trim().replace(/\/$/, ''))
  );
  const headers: Record<string, string> = {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'cache-control': 'no-store',
    vary: 'Origin',
  };
  if (origin && allowed.has(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'GET,POST,PATCH,OPTIONS';
    headers['access-control-allow-headers'] = 'content-type,x-admin-token,x-admin-username,x-internal-token';
  }
  return headers;
}

export function jsonResponse(data: unknown, status: number, request: Request, env: CloudflareEnv): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...securityHeaders(request, env),
    },
  });
}

export function optionsResponse(request: Request, env: CloudflareEnv): Response {
  return new Response(null, { status: 204, headers: securityHeaders(request, env) });
}
