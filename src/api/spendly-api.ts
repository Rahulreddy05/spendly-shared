import type { HttpClient } from './http-client.js';
import { API_PATHS } from '../constants/api-paths.constants.js';
import { INITIAL_SYNC, providerPath, type LinkPlatform, type ProviderId } from '../constants/accounts.constants.js';
import type { Direction } from '../constants/categories.constants.js';
import type {
  Account,
  AuthResponse,
  BankConnection,
  ClientConfig,
  CreateAccountInput,
  CreateTransactionInput,
  DeviceSession,
  LinkToken,
  LoginInput,
  LoginResult,
  MerchantTotal,
  MfaStatus,
  ProvidersResponse,
  RegisterInput,
  SecondFactor,
  SecurityEvent,
  SyncResult,
  Transaction,
  TransactionFilters,
  TransactionPage,
  TotpSetup,
  UpdateAccountInput,
  UpdateTransactionInput,
  User,
  YearSummary,
} from '../types/api.js';

/**
 * Every endpoint Pennypath clients call, grouped by resource. Screens never call
 * fetch directly; they use hooks, which use this. Tests swap in a fake.
 */
/** Narrowing helper: did login stop at the two-factor step? */
export const isMfaChallenge = (result: LoginResult): result is Extract<LoginResult, { mfaRequired: true }> =>
  'mfaRequired' in result && result.mfaRequired === true;

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
      /** Resolves to a session, or to a 2FA challenge to finish with `verifyMfa`. */
      login: async (input: LoginInput): Promise<LoginResult> => {
        const result = await http.request<LoginResult>(API_PATHS.AUTH_LOGIN, { method: 'POST', body: input, auth: false });
        if (!isMfaChallenge(result)) await http.acceptSession(result);
        return result;
      },
      verifyMfa: (mfaToken: string, factor: SecondFactor) =>
        startSession(
          http.request<AuthResponse>(API_PATHS.AUTH_MFA_VERIFY, {
            method: 'POST',
            body: { mfaToken, ...factor },
            auth: false,
          }),
        ),
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
      /** Permanently deletes the account and all its data. 2FA users also pass a factor. */
      deleteAccount: async (password: string, factor?: SecondFactor): Promise<void> => {
        await http.request<void>(API_PATHS.AUTH_ME, { method: 'DELETE', body: { password, ...factor } });
        await http.clearSession();
      },
      verifyEmail: (code: string) => http.request<void>(API_PATHS.EMAIL_VERIFY, { method: 'POST', body: { code } }),
      resendVerification: () => http.request<{ sent: true }>(API_PATHS.EMAIL_RESEND, { method: 'POST' }),
      /** Always "succeeds", whether or not the email has an account. */
      forgotPassword: (email: string) =>
        http.request<{ sent: true }>(API_PATHS.PASSWORD_FORGOT, { method: 'POST', body: { email }, auth: false }),
      resetPassword: (input: { email: string; code: string; newPassword: string }) =>
        http.request<void>(API_PATHS.PASSWORD_RESET, { method: 'POST', body: input, auth: false }),
      changePassword: (input: { currentPassword: string; newPassword: string }) =>
        http.request<void>(API_PATHS.PASSWORD_CHANGE, { method: 'POST', body: input }),
      /** Confirms the password (and 2FA) to unlock sensitive actions for a few minutes. */
      reauthenticate: (password: string, factor?: SecondFactor) =>
        http.request<void>(API_PATHS.AUTH_REAUTH, { method: 'POST', body: { password, ...factor } }),
    },
    security: {
      mfaStatus: () => http.request<MfaStatus>(API_PATHS.MFA_STATUS),
      setupTotp: () =>
        http.request<{ setup: TotpSetup }>(API_PATHS.MFA_TOTP_SETUP, { method: 'POST' }).then((r) => r.setup),
      /** Turns 2FA on; resolves to recovery codes, which are shown once. */
      confirmTotp: (code: string) =>
        http
          .request<{ recoveryCodes: string[] }>(API_PATHS.MFA_TOTP_CONFIRM, { method: 'POST', body: { code } })
          .then((r) => r.recoveryCodes),
      disableMfa: (password: string, factor: SecondFactor) =>
        http.request<void>(API_PATHS.MFA_DISABLE, { method: 'POST', body: { password, ...factor } }),
      regenerateRecoveryCodes: () =>
        http
          .request<{ recoveryCodes: string[] }>(API_PATHS.MFA_RECOVERY_CODES, { method: 'POST' })
          .then((r) => r.recoveryCodes),
      sessions: () =>
        http.request<{ sessions: DeviceSession[] }>(API_PATHS.SESSIONS).then((r) => r.sessions),
      revokeSession: (id: string) => http.request<void>(API_PATHS.session(id), { method: 'DELETE' }),
      revokeOtherSessions: () => http.request<void>(API_PATHS.SESSIONS_REVOKE_OTHERS, { method: 'POST' }),
      events: () => http.request<{ events: SecurityEvent[] }>(API_PATHS.SECURITY_EVENTS).then((r) => r.events),
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
      list: () => http.request<{ connections: BankConnection[] }>(API_PATHS.CONNECTIONS).then((r) => r.connections),
      createLinkToken: (provider: ProviderId, platform: LinkPlatform) =>
        http
          .request<{ link: LinkToken }>(API_PATHS.linkToken(providerPath(provider)), { method: 'POST', body: { platform } })
          .then((r) => r.link),
      /** Hands the SDK's one-time token to the API, which links the bank and imports history. */
      exchange: (provider: ProviderId, publicToken: string) =>
        http
          .request<{ connection: BankConnection }>(API_PATHS.exchange(providerPath(provider)), {
            method: 'POST',
            body: { publicToken },
          })
          .then((r) => r.connection),
      sync: (id: string) =>
        http.request<{ sync: SyncResult }>(API_PATHS.connectionSync(id), { method: 'POST' }).then((r) => r.sync),
      /** Link token for "Fix connection": the user signs in to the bank again. */
      createUpdateLinkToken: (id: string, platform: LinkPlatform) =>
        http
          .request<{ link: LinkToken }>(API_PATHS.connectionUpdateLinkToken(id), { method: 'POST', body: { platform } })
          .then((r) => r.link),
      markReconnected: (id: string) =>
        http
          .request<{ connection: BankConnection }>(API_PATHS.connectionReconnected(id), { method: 'POST' })
          .then((r) => r.connection),
      remove: (id: string) => http.request<void>(API_PATHS.connection(id), { method: 'DELETE' }),
    },
  };
}

export type SpendlyApi = ReturnType<typeof createSpendlyApi>;

export interface InitialSyncOptions {
  attempts?: number;
  intervalMs?: number;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * The bank may still be preparing history right after linking, so the first
 * sync can come back empty. Retries until something arrives or attempts run
 * out (webhooks pick up anything later). Returns how many transactions arrived.
 */
export async function waitForInitialSync(
  api: Pick<SpendlyApi, 'connections'>,
  connectionId: string,
  { attempts = INITIAL_SYNC.ATTEMPTS, intervalMs = INITIAL_SYNC.INTERVAL_MS, sleep = defaultSleep }: InitialSyncOptions = {},
): Promise<number> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const { upserted } = await api.connections.sync(connectionId);
    if (upserted > 0 || attempt === attempts) return upserted;
    await sleep(intervalMs);
  }
  return 0;
}
