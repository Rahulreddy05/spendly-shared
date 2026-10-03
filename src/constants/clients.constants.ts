/** Headers mobile apps send so the API can enforce a minimum app version. */
export const CLIENT_HEADER = {
  PLATFORM: 'x-client-platform',
  VERSION: 'x-client-version',
  /** Human-readable device name for the sessions list, e.g. "Rahul's iPhone". */
  DEVICE_NAME: 'x-device-name',
} as const;

export const CLIENT_PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;
export type ClientPlatform = (typeof CLIENT_PLATFORM)[keyof typeof CLIENT_PLATFORM];

/** Custom URL scheme of the mobile app; the API allows it as a link return URL. */
export const MOBILE_APP_SCHEME = 'spendly';
