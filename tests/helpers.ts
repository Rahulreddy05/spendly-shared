import { vi } from 'vitest';

export const json = (status: number, body: unknown): Response =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const errorBody = (code: string, message = code, details?: unknown) => ({ error: { code, message, details } });

export const session = (n = 1) => ({
  accessToken: `access-${n}`,
  refreshToken: `refresh-${n}`,
  user: { id: 'u1', email: 'a@b.co', displayName: null },
});

/** A fetch mock plus a helper to read what the last call sent. */
export function recordingFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => respond(url, init));
  const call = (i: number) => {
    const [url, init] = fetchMock.mock.calls.at(i) as [string, RequestInit];
    return {
      url,
      method: init.method,
      headers: init.headers as Record<string, string>,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
      credentials: init.credentials,
    };
  };
  return { fetch: fetchMock as unknown as typeof fetch, fetchMock, call, last: () => call(-1) };
}
