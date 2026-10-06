# Pennypath Shared

@ENGINEERING_STANDARDS.md

The npm package `@rahulreddy05/spendly-shared` (GitHub Packages): types,
constants, API client and formatting used by spendly-web, spendly-mobile and
spendly-api. Plain TypeScript, ESM, no framework deps — must run in browsers,
Node 22 and React Native (Hermes).

## Rules

- No React, no DOM-only or Node-only APIs (fetch, URLSearchParams and Intl are fine).
- Relative imports end in `.js` (NodeNext resolution, so Node can import the build).
- Anything here is a public contract for three apps: semver it. Removing or
  renaming an export, or changing a type incompatibly, is a major version.
- `types/api.ts` must match spendly-api's responses exactly; change them together.
- Category/account constants must match spendly-api's Prisma enums.
- Coverage thresholds in `vitest.config.ts` are 95%+; keep them.

## Commands

`npm test`, `npm run test:coverage`, `npm run lint`, `npm run typecheck`, `npm run build`.
Release: bump version → tag `vX.Y.Z` → push tags → CI publishes.
