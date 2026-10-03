import { describe, expect, it, vi } from 'vitest';
import { ApiError, HttpClient, cookieRefreshTokenStore, memoryRefreshTokenStore } from '../src/index.js';
import { errorBody, json, recordingFetch, session } from './helpers.js';

const unauthorized = () => json(401, errorBody('UNAUTHORIZED'));

describe('HttpClient requests', () => {
  it('sends bearer token, JSON body, query string, client headers and credentials', async () => {
    const rec = recordingFetch(() => json(200, { ok: true }));
    const http = new HttpClient({
      baseUrl: '/api/v1',
      fetch: rec.fetch,
      client: { platform: 'ios', version: '1.2.3' },
      credentials: 'omit',
    });
    await http.acceptSession(session());

    await http.request('/things', { method: 'POST', body: { a: 1 }, query: { year: 2026, empty: '', none: undefined } });

    expect(rec.last()).toEqual({
      url: '/api/v1/things?year=2026',
      method: 'POST',
      body: { a: 1 },
      credentials: 'omit',
      headers: {
        authorization: 'Bearer access-1',
        'content-type': 'application/json',
        'x-client-platform': 'ios',
        'x-client-version': '1.2.3',
      },
    });
  });

  it('sends the device name when the app provides one', async () => {
    const rec = recordingFetch(() => json(200, {}));
    await new HttpClient({ baseUrl: '', fetch: rec.fetch, client: { platform: 'ios', version: '2.0.0', deviceName: "Rahul's iPhone" } }).request('/x');
    expect(rec.last().headers).toMatchObject({ 'x-device-name': "Rahul's iPhone", 'x-client-platform': 'ios' });
  });

  it("defaults to the browser's cookie strategy", async () => {
    const rec = recordingFetch(() => json(200, {}));
    await new HttpClient({ baseUrl: '', fetch: rec.fetch }).request('/x');
    expect(rec.last().credentials).toBe('include');
    expect(rec.last().headers).toEqual({});
    expect(await cookieRefreshTokenStore.get()).toBeNull();
    await expect(cookieRefreshTokenStore.set('ignored')).resolves.toBeUndefined();
  });

  it('turns an error body into an ApiError with the server message', async () => {
    const http = new HttpClient({ baseUrl: '', fetch: recordingFetch(() => json(422, errorBody('VALIDATION_FAILED', 'Bad input'))).fetch });
    await expect(http.request('/x', { auth: false })).rejects.toMatchObject({ status: 422, code: 'VALIDATION_FAILED', message: 'Bad input' });
  });

  it('falls back to a generic error for a non-JSON failure', async () => {
    const http = new HttpClient({ baseUrl: '', fetch: recordingFetch(() => new Response('oops', { status: 502 })).fetch });
    await expect(http.request('/x', { auth: false })).rejects.toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' });
  });

  it('reports a network failure as a friendly ApiError', async () => {
    const http = new HttpClient({ baseUrl: '', fetch: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) });
    await expect(http.request('/x')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('returns undefined for 204', async () => {
    const http = new HttpClient({ baseUrl: '', fetch: recordingFetch(() => new Response(null, { status: 204 })).fetch });
    expect(await http.request('/x')).toBeUndefined();
  });

  it('notifies when the app is too old (426) with the version to update to', async () => {
    const upgrade = vi.fn();
    const http = new HttpClient({
      baseUrl: '',
      fetch: recordingFetch(() => json(426, errorBody('UPGRADE_REQUIRED', 'Update', { minVersion: '2.0.0' }))).fetch,
    });
    http.onUpgradeRequired(upgrade);
    await expect(http.request('/x')).rejects.toMatchObject({ code: 'UPGRADE_REQUIRED' });
    expect(upgrade).toHaveBeenCalledWith('2.0.0');
  });
});

describe('HttpClient sessions', () => {
  it('stores the refresh token and sends it in the body when refreshing (mobile)', async () => {
    const store = memoryRefreshTokenStore();
    const rec = recordingFetch((url) => (url === '/auth/refresh' ? json(200, session(2)) : json(200, {})));
    const http = new HttpClient({ baseUrl: '', fetch: rec.fetch, refreshTokenStore: store });

    await http.acceptSession(session(1));
    expect(await store.get()).toBe('refresh-1');

    await http.refreshSession();
    expect(rec.last()).toMatchObject({ url: '/auth/refresh', body: { refreshToken: 'refresh-1' } });
    expect(await store.get()).toBe('refresh-2');
    expect(await http.storedRefreshToken()).toBe('refresh-2');
  });

  it('refreshes with no body on web, where the cookie carries the token', async () => {
    const rec = recordingFetch(() => json(200, session(2)));
    await new HttpClient({ baseUrl: '', fetch: rec.fetch }).refreshSession();
    expect(rec.last().body).toBeUndefined();
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const rec = recordingFetch((url, init) => {
      if (url === '/auth/refresh') return json(200, session(2));
      return (init.headers as Record<string, string>).authorization === 'Bearer access-2' ? json(200, { data: 1 }) : unauthorized();
    });
    const http = new HttpClient({ baseUrl: '', fetch: rec.fetch });
    await http.acceptSession(session(1));

    expect(await http.request('/x')).toEqual({ data: 1 });
    expect(rec.fetchMock).toHaveBeenCalledTimes(3);
  });

  it('shares one refresh between concurrent 401s (the server rotates tokens)', async () => {
    let refreshCalls = 0;
    const rec = recordingFetch((url, init) => {
      if (url === '/auth/refresh') {
        refreshCalls += 1;
        return json(200, session(2));
      }
      return (init.headers as Record<string, string>).authorization === 'Bearer access-2' ? json(200, {}) : unauthorized();
    });
    const http = new HttpClient({ baseUrl: '', fetch: rec.fetch });
    await http.acceptSession(session(1));

    await Promise.all([http.request('/a'), http.request('/b'), http.request('/c')]);
    expect(refreshCalls).toBe(1);
  });

  it('ends the session when the refresh is rejected', async () => {
    const expired = vi.fn();
    const store = memoryRefreshTokenStore('stale');
    const http = new HttpClient({ baseUrl: '', fetch: recordingFetch(unauthorized).fetch, refreshTokenStore: store });
    http.onSessionExpired(expired);

    await expect(http.request('/x')).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledOnce();
    expect(http.hasAccessToken()).toBe(false);
    expect(await store.get()).toBeNull();
  });

  it('keeps the session through a network blip during refresh', async () => {
    const expired = vi.fn();
    const store = memoryRefreshTokenStore('still-valid');
    const http = new HttpClient({ baseUrl: '', fetch: vi.fn().mockRejectedValue(new TypeError('offline')), refreshTokenStore: store });
    http.onSessionExpired(expired);

    await expect(http.refreshSession()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(expired).not.toHaveBeenCalled();
    expect(await store.get()).toBe('still-valid');
  });

  it('does not refresh for unauthenticated calls such as a wrong password', async () => {
    const rec = recordingFetch(() => json(401, errorBody('UNAUTHORIZED', 'Wrong password')));
    const http = new HttpClient({ baseUrl: '', fetch: rec.fetch });
    await expect(http.request('/auth/login', { method: 'POST', auth: false })).rejects.toMatchObject({ message: 'Wrong password' });
    expect(rec.fetchMock).toHaveBeenCalledOnce();
  });
});
