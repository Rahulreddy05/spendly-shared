export const ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'OTHER'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  CHECKING: 'Checking',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit card',
  CASH: 'Cash',
  OTHER: 'Other',
};

export const ACCOUNT_COLORS = ['petrol', 'plum', 'moss', 'rust', 'slate'] as const;
export type AccountColor = (typeof ACCOUNT_COLORS)[number];
export const DEFAULT_ACCOUNT_COLOR: AccountColor = 'petrol';

/** Hex values for each account colour, for platforms without CSS variables. */
export const ACCOUNT_COLOR_HEX: Record<AccountColor, string> = {
  petrol: '#0f6e6e',
  plum: '#6d3f73',
  moss: '#4f6b2c',
  rust: '#a24a26',
  slate: '#4a5563',
};

export const DATA_SOURCE = { MANUAL: 'MANUAL', PLAID: 'PLAID' } as const;
export type DataSource = (typeof DATA_SOURCE)[keyof typeof DATA_SOURCE];

export const ACCOUNT_STATUS = { ACTIVE: 'ACTIVE', DISCONNECTED: 'DISCONNECTED' } as const;
export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const TRANSACTION_STATUS = { PENDING: 'PENDING', POSTED: 'POSTED' } as const;
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const PROVIDER = { PLAID: 'PLAID' } as const;
export type ProviderId = (typeof PROVIDER)[keyof typeof PROVIDER];
export const PROVIDER_IDS = [PROVIDER.PLAID] as const;
/** URL segment for a provider (`/connections/plaid/...`). */
export const providerPath = (id: ProviderId): string => id.toLowerCase();

/** Where the bank-linking SDK is being opened. */
export const LINK_PLATFORM = { WEB: 'web', IOS: 'ios', ANDROID: 'android' } as const;
export type LinkPlatform = (typeof LINK_PLATFORM)[keyof typeof LINK_PLATFORM];

/** Health of one bank login. LOGIN_REQUIRED means "Fix connection" (update mode). */
export const CONNECTION_STATUS = {
  ACTIVE: 'ACTIVE',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  DISCONNECTED: 'DISCONNECTED',
} as const;
export type ConnectionStatus = (typeof CONNECTION_STATUS)[keyof typeof CONNECTION_STATUS];

export const CONNECTION_STATUS_LABEL: Record<ConnectionStatus, string> = {
  ACTIVE: 'Connected',
  LOGIN_REQUIRED: 'Needs attention',
  DISCONNECTED: 'Disconnected',
};

export const CONNECTION_STATUS_HELP: Record<ConnectionStatus, string> = {
  ACTIVE: 'Transactions update automatically.',
  LOGIN_REQUIRED: 'Your bank needs you to sign in again before Pennypath can update.',
  DISCONNECTED: 'Access was revoked at your bank. Remove this connection and link it again.',
};

/**
 * Right after linking, the bank can take a few seconds to prepare history.
 * Clients retry the first sync this many times before leaving it to webhooks.
 */
export const INITIAL_SYNC = { ATTEMPTS: 6, INTERVAL_MS: 5_000 } as const;

/** Last 4 digits only — never a full card or account number. */
export const LAST4_PATTERN = /^\d{4}$/;
