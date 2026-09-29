import { ERROR_CODE, ERROR_MESSAGE } from '../constants/errors.constants.js';

/** Every failed API call surfaces as this, with a message safe to show users. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static network(): ApiError {
    return new ApiError(0, ERROR_CODE.NETWORK, ERROR_MESSAGE.NETWORK);
  }
}

export const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : ERROR_MESSAGE.UNKNOWN;
