import { HttpError } from './errors';

const MAX_BODY_BYTES = 131072; // 128KB

export async function parseBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  const contentType = request.headers.get('content-type') || '';
  if (['POST', 'PATCH', 'PUT'].includes(request.method) && contentType && !contentType.includes('application/json')) {
    throw new HttpError(415, 'content-type must be application/json');
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw new HttpError(413, 'request body too large');
  }
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new HttpError(400, 'invalid json body');
  }
}
