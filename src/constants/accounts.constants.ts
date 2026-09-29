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

export const DATA_SOURCE = { MANUAL: 'MANUAL', STRIPE: 'STRIPE' } as const;
export type DataSource = (typeof DATA_SOURCE)[keyof typeof DATA_SOURCE];

export const ACCOUNT_STATUS = { ACTIVE: 'ACTIVE', DISCONNECTED: 'DISCONNECTED' } as const;
export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const TRANSACTION_STATUS = { PENDING: 'PENDING', POSTED: 'POSTED' } as const;
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const PROVIDER = { STRIPE: 'STRIPE' } as const;
export type ProviderId = (typeof PROVIDER)[keyof typeof PROVIDER];
export const PROVIDER_IDS = [PROVIDER.STRIPE] as const;
/** URL segment for a provider (`/connections/stripe/...`). */
export const providerPath = (id: ProviderId): string => id.toLowerCase();

/** Last 4 digits only — never a full card or account number. */
export const LAST4_PATTERN = /^\d{4}$/;
