# spendly-shared

Code shared by every Spendly app — `spendly-web`, `spendly-mobile` (React
Native) and `spendly-api` — so there is one source of truth instead of copies.

| Module | What's in it |
| --- | --- |
| `constants/` | categories, directions, account types/colours, API paths, query keys, error codes, client headers |
| `types/api.ts` | request and response shapes of the API |
| `api/` | `HttpClient` (in-memory access token, single-flight refresh, client-version headers), `RefreshTokenStore` strategy, `createSpendlyApi` |
| `format/` | money (integer cents → display), dates, percent, amount parsing |

Plain TypeScript with no framework dependencies: it runs in browsers, Node and
React Native.

## Using it

```ts
import { HttpClient, createSpendlyApi, formatMoney } from '@rahulreddy05/spendly-shared';

// Web: the refresh token lives in an httpOnly cookie (the default store).
const http = new HttpClient({ baseUrl: '/api/v1' });

// Mobile: pass a Keychain/Keystore-backed RefreshTokenStore and client info.
// const http = new HttpClient({ baseUrl, refreshTokenStore, client: { platform: 'ios', version }, credentials: 'omit' });

const api = createSpendlyApi(http);
```

Installing needs a GitHub token with `read:packages` — see `.npmrc.consumer.example`.

## Developing

```bash
npm ci
npm test              # or test:coverage (thresholds enforced)
npm run lint && npm run typecheck && npm run build
```

To try an unpublished change in an app: `npm run build` here, then
`npm link` here and `npm link @rahulreddy05/spendly-shared` in the app.

## Releasing

1. Bump `version` in `package.json` (semver: breaking change → major).
2. Commit, then `git tag v1.2.3 && git push --tags`.
3. CI tests and publishes to GitHub Packages. Update the apps to the new version.

See [ENGINEERING_STANDARDS.md](ENGINEERING_STANDARDS.md).
