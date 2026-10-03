import { describe, expect, it, vi } from 'vitest';
import { ApiError, isReauthRequired, withReauth } from '../src/index.js';

const reauthError = () => new ApiError(403, 'REAUTH_REQUIRED', 'Please confirm your password to continue.');

describe('withReauth', () => {
  it('runs the action directly when no confirmation is needed', async () => {
    const ask = vi.fn();
    expect(await withReauth(ask, async () => 'ok')).toBe('ok');
    expect(ask).not.toHaveBeenCalled();
  });

  it('asks once and retries after REAUTH_REQUIRED', async () => {
    const action = vi.fn().mockRejectedValueOnce(reauthError()).mockResolvedValue('done');
    const ask = vi.fn().mockResolvedValue(true);
    expect(await withReauth(ask, action)).toBe('done');
    expect(ask).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('gives up with the original error if the user cancels', async () => {
    const error = reauthError();
    await expect(withReauth(vi.fn().mockResolvedValue(false), vi.fn().mockRejectedValue(error))).rejects.toBe(error);
  });

  it('passes other errors straight through', async () => {
    const ask = vi.fn();
    await expect(withReauth(ask, vi.fn().mockRejectedValue(new Error('boom')))).rejects.toThrow('boom');
    expect(ask).not.toHaveBeenCalled();
    expect(isReauthRequired(new ApiError(403, 'FORBIDDEN', 'x'))).toBe(false);
  });
});
