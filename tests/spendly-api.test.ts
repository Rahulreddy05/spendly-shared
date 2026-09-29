import { describe, expect, it } from 'vitest';
import { ApiError, HttpClient, createSpendlyApi, errorMessage, memoryRefreshTokenStore } from '../src/index.js';
import { errorBody, json, recordingFetch, session } from './helpers.js';

function setup(respond: (url: string) => unknown = () => ({})) {
  const store = memoryRefreshTokenStore();
  const rec = recordingFetch((url) => {
    const body = respond(url);
    return body === null ? new Response(null, { status: 204 }) : json(200, body);
  });
  const http = new HttpClient({ baseUrl: '/api/v1', fetch: rec.fetch, refreshTokenStore: store });
  return { api: createSpendlyApi(http), http, store, last: rec.last };
}

describe('spendly API contract', () => {
  it('login and register start a session', async () => {
    const { api, http, store, last } = setup(() => session());
    await api.auth.login({ email: 'a@b.co', password: 'p' });
    expect(last()).toMatchObject({ url: '/api/v1/auth/login', method: 'POST', body: { email: 'a@b.co', password: 'p' } });
    expect(http.hasAccessToken()).toBe(true);
    expect(await store.get()).toBe('refresh-1');

    await api.auth.register({ email: 'a@b.co', password: 'p', displayName: 'A' });
    expect(last()).toMatchObject({ url: '/api/v1/auth/register', body: { displayName: 'A' } });
  });

  it('logout revokes the stored token and clears the session even if the call fails', async () => {
    const { api, http, store, last } = setup((url) => (url.endsWith('/logout') ? null : session()));
    await api.auth.login({ email: 'a@b.co', password: 'p' });
    await api.auth.logout();
    expect(last()).toMatchObject({ url: '/api/v1/auth/logout', body: { refreshToken: 'refresh-1' } });
    expect(http.hasAccessToken()).toBe(false);
    expect(await store.get()).toBeNull();

    const failing = new HttpClient({ baseUrl: '', fetch: recordingFetch(() => json(500, errorBody('X'))).fetch, refreshTokenStore: memoryRefreshTokenStore('t') });
    await expect(createSpendlyApi(failing).auth.logout()).rejects.toBeInstanceOf(ApiError);
    expect(await failing.storedRefreshToken()).toBeNull();
  });

  it('restores a session, reads the profile, and deletes the account', async () => {
    const { api, http, last } = setup((url) => (url.endsWith('/auth/me') ? null : session()));
    await api.auth.restoreSession();
    expect(last()).toMatchObject({ url: '/api/v1/auth/refresh', method: 'POST' });
    await api.auth.me();
    expect(last()).toMatchObject({ url: '/api/v1/auth/me', method: 'GET' });
    await api.auth.deleteAccount('pw');
    expect(last()).toMatchObject({ url: '/api/v1/auth/me', method: 'DELETE', body: { password: 'pw' } });
    expect(http.hasAccessToken()).toBe(false);
  });

  it('reads the public client config without auth', async () => {
    const { api, last } = setup(() => ({ minAppVersion: { ios: '1.0.0', android: '1.0.0' }, providers: [] }));
    await api.meta.clientConfig();
    expect(last()).toMatchObject({ url: '/api/v1/meta/client-config', method: 'GET' });
    expect(last().headers.authorization).toBeUndefined();
  });

  it('account endpoints unwrap their envelopes', async () => {
    const { api, last } = setup(() => ({ accounts: ['a'], account: 'one' }));
    expect(await api.accounts.list()).toEqual(['a']);
    expect(await api.accounts.create({ name: 'W', type: 'CASH', color: 'moss' })).toBe('one');
    expect(await api.accounts.update('id 1', { archived: true })).toBe('one');
    expect(last()).toMatchObject({ url: '/api/v1/accounts/id%201', method: 'PATCH', body: { archived: true } });
    await api.accounts.remove('id1');
    expect(last()).toMatchObject({ url: '/api/v1/accounts/id1', method: 'DELETE' });
  });

  it('transaction endpoints pass filters as query params', async () => {
    const { api, last } = setup(() => ({ items: [], nextCursor: null, transaction: 'tx' }));
    await api.transactions.list({ year: 2026, direction: 'INCOME', cursor: 'c1', limit: 50 });
    expect(last().url).toBe('/api/v1/transactions?year=2026&direction=INCOME&cursor=c1&limit=50');
    const input = { accountId: 'a', amountCents: 100, direction: 'EXPENSE' as const, category: 'OTHER' as const, occurredAt: '2026-01-01' };
    expect(await api.transactions.create(input)).toBe('tx');
    expect(await api.transactions.update('t1', { category: 'TRANSFER' })).toBe('tx');
    expect(last()).toMatchObject({ url: '/api/v1/transactions/t1', method: 'PATCH', body: { category: 'TRANSFER' } });
    await api.transactions.remove('t1');
    expect(last()).toMatchObject({ url: '/api/v1/transactions/t1', method: 'DELETE' });
  });

  it('analytics endpoints', async () => {
    const { api, last } = setup(() => ({ merchants: ['m'] }));
    await api.analytics.summary(2026);
    expect(last().url).toBe('/api/v1/analytics/summary?year=2026');
    expect(await api.analytics.merchants(2026, 'EXPENSE', 5)).toEqual(['m']);
    expect(last().url).toBe('/api/v1/analytics/merchants?year=2026&direction=EXPENSE&limit=5');
  });

  it('connection endpoints, including the mobile return URL', async () => {
    const { api, last } = setup(() => ({ providers: ['STRIPE'], session: 's', accounts: ['a'], sync: { upserted: 1, removed: 0 } }));
    expect(await api.connections.providers()).toEqual(['STRIPE']);
    expect(await api.connections.startLink('STRIPE')).toBe('s');
    expect(last()).toMatchObject({ url: '/api/v1/connections/stripe/sessions', method: 'POST', body: undefined });
    await api.connections.startLink('STRIPE', { returnUrl: 'spendly://link-complete' });
    expect(last().body).toEqual({ returnUrl: 'spendly://link-complete' });
    expect(await api.connections.completeLink('STRIPE', 'fcsess/1')).toEqual(['a']);
    expect(last().url).toBe('/api/v1/connections/stripe/sessions/fcsess%2F1/complete');
    expect(await api.connections.refreshAccount('acc1')).toEqual({ upserted: 1, removed: 0 });
  });

  it('errorMessage shows API messages and hides anything else', () => {
    expect(errorMessage(new ApiError(400, 'X', 'Nice message'))).toBe('Nice message');
    expect(errorMessage(new Error('stack trace detail'))).toBe('Something went wrong. Please try again.');
  });
});
