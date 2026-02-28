const LOCAL_GATEWAY_URL = 'http://localhost:8080';
const REMOTE_GATEWAY_URL = 'https://bcfs-group-ciblorgasport-back.onrender.com';

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'host.docker.internal',
]);

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function isLocalHost(hostname) {
  if (!hostname) return false;
  const normalized = String(hostname).toLowerCase();
  return LOCAL_HOSTS.has(normalized) || normalized.endsWith('.local');
}

function getRuntimeHostname() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  if (typeof globalThis !== 'undefined' && globalThis.location) {
    return globalThis.location.hostname;
  }
  return '';
}

export function resolveApiBaseUrl(explicitUrl = import.meta.env.VITE_API_URL) {
  if (explicitUrl && String(explicitUrl).trim()) {
    return stripTrailingSlash(explicitUrl);
  }

  const hostname = getRuntimeHostname();
  if (isLocalHost(hostname)) {
    return LOCAL_GATEWAY_URL;
  }
  return REMOTE_GATEWAY_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
