export const APP_NAME = 'Pennypath';

export const API_VERSION_PATH = '/api/v1';

export const LOCALE = 'en-US';
export const DEFAULT_CURRENCY = 'USD';
export const CENTS_PER_UNIT = 100;
/** $1,000,000.00 — the API rejects single entries above this. */
export const MAX_AMOUNT_CENTS = 100_000_000;

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const FIELD_LIMITS = {
  NAME: 60,
  INSTITUTION: 60,
  MERCHANT: 120,
  NOTE: 500,
  DISPLAY_NAME: 80,
  PASSWORD_MIN: 10,
  PASSWORD_MAX: 200,
} as const;

export const TRANSACTIONS_PAGE_SIZE = 50;
export const TOP_MERCHANTS_LIMIT = 5;
export const YEAR_PICKER_SPAN = 5;
