const API_URL = import.meta.env.VITE_API_URL;

const defaultUnauthorizedHandler = () => {};
let onUnauthorized = defaultUnauthorizedHandler;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : defaultUnauthorizedHandler;
}

export function createAppError({ code = 'UNKNOWN_ERROR', message = 'Unexpected error', status = 0, cause = null } = {}) {
  return { code, message, status, cause };
}

function buildHeaders(token, { hasBody = false, headers = {} } = {}) {
  const builtHeaders = { ...headers };
  if (token) builtHeaders.Authorization = `Bearer ${token}`;
  if (hasBody && !builtHeaders['Content-Type']) builtHeaders['Content-Type'] = 'application/json';
  return builtHeaders;
}

async function parseBody(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType) return null;
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  const text = await res.text();
  return text || null;
}

function inferErrorCode(status, data) {
  if (typeof data?.code === 'string' && data.code.trim()) return data.code;
  if (status === 401) return 'TOKEN_EXPIRED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status >= 500) return 'SERVER_ERROR';
  if (status >= 400) return 'REQUEST_ERROR';
  return 'NETWORK_ERROR';
}

function normalizeHttpError(res, data) {
  const status = res.status;
  const message = data?.message || data?.error || `Request failed (${status})`;
  const error = createAppError({
    code: inferErrorCode(status, data),
    message,
    status,
    cause: data,
  });
  if (status === 401) onUnauthorized(error);
  return error;
}

function normalizeNetworkError(error) {
  if (error?.name === 'AbortError') {
    return createAppError({
      code: 'ABORTED',
      message: 'Request was aborted',
      status: 0,
      cause: error,
    });
  }

  return createAppError({
    code: 'NETWORK_ERROR',
    message: error?.message || 'Network request failed',
    status: 0,
    cause: error,
  });
}

export async function request(path, { method = 'GET', token, body, signal, headers } = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: buildHeaders(token, { hasBody: body !== undefined, headers }),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await parseBody(res);
    if (!res.ok) {
      throw normalizeHttpError(res, data);
    }
    return data;
  } catch (error) {
    if (error?.code && Object.prototype.hasOwnProperty.call(error, 'status')) {
      throw error;
    }
    throw normalizeNetworkError(error);
  }
}

export function apiGet(path, token, options = {}) {
  return request(path, { ...options, method: 'GET', token });
}

export function apiPost(path, token, body, options = {}) {
  return request(path, { ...options, method: 'POST', token, body });
}

export function apiPut(path, token, body, options = {}) {
  return request(path, { ...options, method: 'PUT', token, body });
}
