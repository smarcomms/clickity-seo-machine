/**
 * Validate API key from request headers
 */
export function validateApiKey(headers: Headers): boolean {
  const apiKey = headers.get('x-api-key');
  const expectedKey = process.env.SEO_BLOG_API_KEY;

  if (!expectedKey) {
    console.error('[v0] SEO_BLOG_API_KEY environment variable not set');
    return false;
  }

  if (!apiKey) {
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create error response
 */
export function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create success response
 */
export function successResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
