/**
 * Where the refresh token lives between app launches (Strategy). Each platform
 * supplies its own:
 * - Web: the browser holds it in an httpOnly cookie that scripts cannot read,
 *   so the store is empty and the cookie travels with the request by itself.
 * - Mobile: the iOS Keychain / Android Keystore via expo-secure-store.
 */
export interface RefreshTokenStore {
  get(): Promise<string | null>;
  set(token: string | null): Promise<void>;
}

/** Browser strategy: the httpOnly cookie is the store. */
export const cookieRefreshTokenStore: RefreshTokenStore = {
  get: async () => null,
  set: async () => undefined,
};

/** In-memory store, for tests and short-lived scripts. */
export function memoryRefreshTokenStore(initial: string | null = null): RefreshTokenStore {
  let token = initial;
  return {
    get: async () => token,
    set: async (next) => {
      token = next;
    },
  };
}
