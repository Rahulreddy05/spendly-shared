import { ApiError } from './api-error.js';
import { ERROR_CODE } from '../constants/errors.constants.js';

/** Asks the user to confirm their password; resolves true once confirmed. */
export type RequestReauth = () => Promise<boolean>;

export const isReauthRequired = (error: unknown): boolean =>
  error instanceof ApiError && error.code === ERROR_CODE.REAUTH_REQUIRED;

/**
 * Runs a sensitive action. If the API answers REAUTH_REQUIRED, asks the user to
 * confirm their password (via the app's own dialog) and retries once.
 */
export async function withReauth<T>(requestReauth: RequestReauth, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (!isReauthRequired(error)) throw error;
    if (!(await requestReauth())) throw error;
    return action();
  }
}
