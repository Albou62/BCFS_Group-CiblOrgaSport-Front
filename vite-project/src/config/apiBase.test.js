import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './apiBase';

describe('resolveApiBaseUrl', () => {
  function setLocationHostname(hostname) {
    Object.defineProperty(globalThis, 'location', {
      value: { hostname },
      configurable: true,
    });
  }

  it('uses explicit VITE_API_URL when provided', () => {
    expect(resolveApiBaseUrl('https://example.org/')).toBe('https://example.org');
  });

  it('falls back to localhost gateway for local hostnames', () => {
    const previousLocation = globalThis.location;
    setLocationHostname('localhost');
    expect(resolveApiBaseUrl('')).toBe('http://localhost:8080');
    Object.defineProperty(globalThis, 'location', { value: previousLocation, configurable: true });
  });

  it('falls back to remote gateway for non-local hostnames', () => {
    const previousLocation = globalThis.location;
    setLocationHostname('ciblorgasport.vercel.app');
    expect(resolveApiBaseUrl('')).toBe('https://bcfs-group-ciblorgasport-back.onrender.com');
    Object.defineProperty(globalThis, 'location', { value: previousLocation, configurable: true });
  });
});
