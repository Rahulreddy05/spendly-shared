/** Account-security values shared by web and mobile. Mirrors spendly-api. */

export const EMAIL_CODE_DIGITS = 6;
export const TOTP_CODE_DIGITS = 6;
export const RECOVERY_CODE_COUNT = 10;

/** Minutes a password confirmation keeps sensitive actions unlocked. */
export const REAUTH_MAX_AGE_MINUTES = 10;

export const SECURITY_EVENT = {
  SIGN_IN: 'SIGN_IN',
  SIGN_IN_FAILED: 'SIGN_IN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  RECOVERY_CODE_USED: 'RECOVERY_CODE_USED',
  RECOVERY_CODES_REGENERATED: 'RECOVERY_CODES_REGENERATED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  OTHER_SESSIONS_REVOKED: 'OTHER_SESSIONS_REVOKED',
  REFRESH_TOKEN_REUSE: 'REFRESH_TOKEN_REUSE',
} as const;
export type SecurityEventType = (typeof SECURITY_EVENT)[keyof typeof SECURITY_EVENT];

export const SECURITY_EVENT_LABEL: Record<SecurityEventType, string> = {
  SIGN_IN: 'Signed in',
  SIGN_IN_FAILED: 'Failed sign-in attempt',
  ACCOUNT_LOCKED: 'Sign-in locked after failed attempts',
  EMAIL_VERIFIED: 'Email verified',
  PASSWORD_CHANGED: 'Password changed',
  PASSWORD_RESET: 'Password reset',
  MFA_ENABLED: 'Two-factor authentication turned on',
  MFA_DISABLED: 'Two-factor authentication turned off',
  RECOVERY_CODE_USED: 'Recovery code used to sign in',
  RECOVERY_CODES_REGENERATED: 'New recovery codes created',
  SESSION_REVOKED: 'A device was signed out',
  OTHER_SESSIONS_REVOKED: 'All other devices were signed out',
  REFRESH_TOKEN_REUSE: 'Suspicious activity: a device was signed out',
};

/** Events worth highlighting in the activity list. */
export const WARNING_SECURITY_EVENTS: readonly SecurityEventType[] = [
  SECURITY_EVENT.SIGN_IN_FAILED,
  SECURITY_EVENT.ACCOUNT_LOCKED,
  SECURITY_EVENT.MFA_DISABLED,
  SECURITY_EVENT.REFRESH_TOKEN_REUSE,
];
