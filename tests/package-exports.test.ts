import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Consumers resolve this package with different conditions: Node ESM and
 * Vite use "import"; Jest (CommonJS resolution) and some bundlers only match
 * "default". Every condition must reach the build.
 */
describe('package.json exports', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const root = pkg.exports['.'];

  it('offers types, import and a default fallback', () => {
    expect(root).toEqual({ types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' });
  });

  it('lists default last, as resolution is order-sensitive', () => {
    expect(Object.keys(root).at(-1)).toBe('default');
  });
});
