export const HTTP_STATUS = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  UPGRADE_REQUIRED: 426,
} as const;

/** Codes the API returns (subset clients branch on) plus client-side codes. */
export const ERROR_CODE = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
  NETWORK: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGE = {
  NETWORK: 'Could not reach Spendly. Check your connection and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
  LINK_CANCELLED: 'Bank linking was cancelled.',
} as const;
