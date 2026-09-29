/** Every API path, relative to `/api/v1`. */
export const API_PATHS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  ACCOUNTS: '/accounts',
  account: (id: string) => `/accounts/${encodeURIComponent(id)}`,
  TRANSACTIONS: '/transactions',
  transaction: (id: string) => `/transactions/${encodeURIComponent(id)}`,
  ANALYTICS_SUMMARY: '/analytics/summary',
  ANALYTICS_MERCHANTS: '/analytics/merchants',
  CONNECTION_PROVIDERS: '/connections/providers',
  linkSession: (provider: string) => `/connections/${provider}/sessions`,
  completeLinkSession: (provider: string, sessionId: string) =>
    `/connections/${provider}/sessions/${encodeURIComponent(sessionId)}/complete`,
  refreshAccount: (id: string) => `/connections/accounts/${encodeURIComponent(id)}/refresh`,
  CLIENT_CONFIG: '/meta/client-config',
} as const;
