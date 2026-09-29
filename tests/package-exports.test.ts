import { describe, expect, it } from 'vitest';
// A JSON import instead of node:fs — this package has no Node types, on purpose.
import pkg from '../package.json' with { type: 'json' };

/**
 * Consumers resolve this package with different conditions: Node ESM and
 * Vite use "import"; Jest (CommonJS resolution) and some bundlers only match
 * "default". Every condition must reach the build.
 */
describe('package.json exports', () => {
  const root = pkg.exports['.'];

  it('offers types, import and a default fallback', () => {
    expect(root).toEqual({ types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' });
  });

  it('lists default last, as resolution is order-sensitive', () => {
    expect(Object.keys(root).at(-1)).toBe('default');
  });
});
