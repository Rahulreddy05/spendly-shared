import { ApiError } from './api-error.js';
import { cookieRefreshTokenStore, type RefreshTokenStore } from './refresh-token-store.js';
import type { ApiErrorBody, AuthResponse } from '../types/api.js';
import { API_PATHS } from '../constants/api-paths.constants.js';
import { ERROR_CODE, ERROR_MESSAGE, HTTP_STATUS } from '../constants/errors.constants.js';
import { CLIENT_HEADER, type ClientPlatform } from '../constants/clients.constants.js';

type Query = Record<string, string | number | undefined>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  /** Attach the access token and retry once after a refresh on 401. Default true. */
  auth?: boolean;
}

export interface HttpClientOptions {
  /** e.g. '/api/v1' on web (same origin) or 'https://spendly.example.com/api/v1' on mobile. */
  baseUrl: string;
  fetch?: typeof fetch;
  refreshTokenStore?: RefreshTokenStore;
  /** Sent as X-Client-* headers so the API can enforce a minimum app version. */
  client?: { platform: ClientPlatform; version: string };
  /** 'include' on web so the refresh cookie is sent; mobile does not need cookies. */
  credentials?: RequestCredentials;
}

/**
 * Typed fetch wrapper used by every Spendly client. The access token lives only
 * in memory; the refresh token lives wherever the platform's
 * `RefreshTokenStore` keeps it.
 */
export class HttpClient {
  private accessToken: string | null = null;
  private refreshing: Promise<AuthResponse> | null = null;
  private sessionExpiredListener: (() => void) | null = null;
  private upgradeRequiredListener: ((minVersion: string | undefined) => void) | null = null;

  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly store: RefreshTokenStore;
  private readonly clientHeaders: Record<string, string>;
  private readonly credentials: RequestCredentials;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch ?? ((...args) => fetch(...args));
    this.store = options.refreshTokenStore ?? cookieRefreshTokenStore;
    this.credentials = options.credentials ?? 'include';
    this.clientHeaders = options.client
      ? { [CLIENT_HEADER.PLATFORM]: options.client.platform, [CLIENT_HEADER.VERSION]: options.client.version }
      : {};
  }

  hasAccessToken(): boolean {
    return this.accessToken !== null;
  }

  onSessionExpired(listener: (() => void) | null): void {
    this.sessionExpiredListener = listener;
  }

  /** Called when the API says this app version is too old (HTTP 426). */
  onUpgradeRequired(listener: ((minVersion: string | undefined) => void) | null): void {
    this.upgradeRequiredListener = listener;
  }

  /** Stores a fresh session from login, register or refresh. */
  async acceptSession(session: AuthResponse): Promise<void> {
    this.accessToken = session.accessToken;
    await this.store.set(session.refreshToken);
  }

  async clearSession(): Promise<void> {
    this.accessToken = null;
    await this.store.set(null);
  }

  /** The stored refresh token, if this platform keeps one (mobile). */
  storedRefreshToken(): Promise<string | null> {
    return this.store.get();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { auth = true } = options;
    try {
      return await this.send<T>(path, options);
    } catch (error) {
      if (!auth || !(error instanceof ApiError) || error.status !== HTTP_STATUS.UNAUTHORIZED) {
        throw error;
      }
      await this.refreshSession();
      return this.send<T>(path, options);
    }
  }

  /**
   * Exchanges the refresh token for a new session. Concurrent callers share one
   * in-flight refresh, because the server rotates the token and a second
   * parallel refresh would be rejected as a replay.
   */
  refreshSession(): Promise<AuthResponse> {
    this.refreshing ??= this.store
      .get()
      .then((refreshToken) =>
        this.send<AuthResponse>(API_PATHS.AUTH_REFRESH, {
          method: 'POST',
          auth: false,
          ...(refreshToken ? { body: { refreshToken } } : {}),
        }),
      )
      .then(async (session) => {
        await this.acceptSession(session);
        return session;
      })
      .catch(async (error: unknown) => {
        // Only a definitive rejection ends the session; a network blip does not.
        if (error instanceof ApiError && error.status === HTTP_STATUS.UNAUTHORIZED) {
          await this.clearSession();
          this.sessionExpiredListener?.();
        }
        throw error;
      })
      .finally(() => {
        this.refreshing = null;
      });
    return this.refreshing;
  }

  private buildUrl(path: string, query?: Query): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    return `${this.baseUrl}${path}${qs ? `?${qs}` : ''}`;
  }

  private async send<T>(path: string, options: RequestOptions): Promise<T> {
    const { method = 'GET', body, query, auth = true } = options;
    const headers: Record<string, string> = { ...this.clientHeaders };
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (auth && this.accessToken) headers.authorization = `Bearer ${this.accessToken}`;

    let response: Response;
    try {
      response = await this.fetchImpl(this.buildUrl(path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: this.credentials,
      });
    } catch {
      throw ApiError.network();
    }

    if (response.status === HTTP_STATUS.NO_CONTENT) return undefined as T;

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const err = (payload as ApiErrorBody | null)?.error;
      const error = new ApiError(
        response.status,
        err?.code ?? ERROR_CODE.UNKNOWN,
        err?.message ?? ERROR_MESSAGE.UNKNOWN,
        err?.details,
      );
      if (response.status === HTTP_STATUS.UPGRADE_REQUIRED) {
        this.upgradeRequiredListener?.((err?.details as { minVersion?: string } | undefined)?.minVersion);
      }
      throw error;
    }
    return payload as T;
  }
}
