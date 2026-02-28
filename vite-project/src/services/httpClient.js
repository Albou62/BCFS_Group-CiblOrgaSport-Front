import { API_BASE_URL } from '../config/apiBase';

const API_URL = API_BASE_URL;

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

function buildUrl(path, params) {
  if (!String(path || '').startsWith('/')) {
    throw createAppError({
      code: 'INVALID_PATH',
      message: 'API path must start with "/"',
      status: 0,
      cause: { path },
    });
  }

  const url = new URL(`${API_URL}${path}`);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function parseBody(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawBody = await res.text();
  if (!rawBody) return null;

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  const firstChar = rawBody.trim().charAt(0);
  if (firstChar === '{' || firstChar === '[' || firstChar === '"') {
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  return rawBody;
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

export async function request(path, { method = 'GET', token, body, signal, headers, params } = {}) {
  try {
    const res = await fetch(buildUrl(path, params), {
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

export function apiDelete(path, token, body, options = {}) {
  return request(path, { ...options, method: 'DELETE', token, body });
}

if (import.meta.env.DEV && !import.meta.env.TEST) {
  // eslint-disable-next-line no-console
  console.info('[httpClient] API base URL:', API_URL);
}
