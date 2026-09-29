import type { HttpClient } from './http-client.js';
import { API_PATHS } from '../constants/api-paths.constants.js';
import { providerPath, type ProviderId } from '../constants/accounts.constants.js';
import type { Direction } from '../constants/categories.constants.js';
import type {
  Account,
  AuthResponse,
  ClientConfig,
  CreateAccountInput,
  CreateTransactionInput,
  LinkSession,
  LinkSessionOptions,
  LoginInput,
  MerchantTotal,
  ProvidersResponse,
  RegisterInput,
  SyncResult,
  Transaction,
  TransactionFilters,
  TransactionPage,
  UpdateAccountInput,
  UpdateTransactionInput,
  User,
  YearSummary,
} from '../types/api.js';

/**
 * Every endpoint Spendly clients call, grouped by resource. Screens never call
 * fetch directly; they use hooks, which use this. Tests swap in a fake.
 */
export function createSpendlyApi(http: HttpClient) {
  const startSession = async (promise: Promise<AuthResponse>): Promise<AuthResponse> => {
    const session = await promise;
    await http.acceptSession(session);
    return session;
  };

  return {
    meta: {
      clientConfig: () => http.request<ClientConfig>(API_PATHS.CLIENT_CONFIG, { auth: false }),
    },
    auth: {
      register: (input: RegisterInput) =>
        startSession(http.request<AuthResponse>(API_PATHS.AUTH_REGISTER, { method: 'POST', body: input, auth: false })),
      login: (input: LoginInput) =>
        startSession(http.request<AuthResponse>(API_PATHS.AUTH_LOGIN, { method: 'POST', body: input, auth: false })),
      /** Revokes the refresh token server-side, then forgets the session locally either way. */
      logout: async (): Promise<void> => {
        const refreshToken = await http.storedRefreshToken();
        try {
          await http.request<void>(API_PATHS.AUTH_LOGOUT, {
            method: 'POST',
            auth: false,
            ...(refreshToken ? { body: { refreshToken } } : {}),
          });
        } finally {
          await http.clearSession();
        }
      },
      restoreSession: () => http.refreshSession(),
      me: () => http.request<User>(API_PATHS.AUTH_ME),
      /** Permanently deletes the account and all its data. */
      deleteAccount: async (password: string): Promise<void> => {
        await http.request<void>(API_PATHS.AUTH_ME, { method: 'DELETE', body: { password } });
        await http.clearSession();
      },
    },
    accounts: {
      list: () => http.request<{ accounts: Account[] }>(API_PATHS.ACCOUNTS).then((r) => r.accounts),
      create: (input: CreateAccountInput) =>
        http.request<{ account: Account }>(API_PATHS.ACCOUNTS, { method: 'POST', body: input }).then((r) => r.account),
      update: (id: string, input: UpdateAccountInput) =>
        http
          .request<{ account: Account }>(API_PATHS.account(id), { method: 'PATCH', body: input })
          .then((r) => r.account),
      remove: (id: string) => http.request<void>(API_PATHS.account(id), { method: 'DELETE' }),
    },
    transactions: {
      list: (filters: TransactionFilters & { cursor?: string; limit?: number }) =>
        http.request<TransactionPage>(API_PATHS.TRANSACTIONS, { query: { ...filters } }),
      create: (input: CreateTransactionInput) =>
        http
          .request<{ transaction: Transaction }>(API_PATHS.TRANSACTIONS, { method: 'POST', body: input })
          .then((r) => r.transaction),
      update: (id: string, input: UpdateTransactionInput) =>
        http
          .request<{ transaction: Transaction }>(API_PATHS.transaction(id), { method: 'PATCH', body: input })
          .then((r) => r.transaction),
      remove: (id: string) => http.request<void>(API_PATHS.transaction(id), { method: 'DELETE' }),
    },
    analytics: {
      summary: (year: number) => http.request<YearSummary>(API_PATHS.ANALYTICS_SUMMARY, { query: { year } }),
      merchants: (year: number, direction: Direction, limit: number) =>
        http
          .request<{ merchants: MerchantTotal[] }>(API_PATHS.ANALYTICS_MERCHANTS, { query: { year, direction, limit } })
          .then((r) => r.merchants),
    },
    connections: {
      providers: () => http.request<ProvidersResponse>(API_PATHS.CONNECTION_PROVIDERS).then((r) => r.providers),
      startLink: (provider: ProviderId, options: LinkSessionOptions = {}) =>
        http
          .request<{ session: LinkSession }>(API_PATHS.linkSession(providerPath(provider)), {
            method: 'POST',
            ...(options.returnUrl ? { body: { returnUrl: options.returnUrl } } : {}),
          })
          .then((r) => r.session),
      completeLink: (provider: ProviderId, sessionId: string) =>
        http
          .request<{ accounts: Account[] }>(API_PATHS.completeLinkSession(providerPath(provider), sessionId), {
            method: 'POST',
          })
          .then((r) => r.accounts),
      refreshAccount: (id: string) =>
        http.request<{ sync: SyncResult }>(API_PATHS.refreshAccount(id), { method: 'POST' }).then((r) => r.sync),
    },
  };
}

export type SpendlyApi = ReturnType<typeof createSpendlyApi>;
