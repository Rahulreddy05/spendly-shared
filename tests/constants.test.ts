import { describe, expect, it } from 'vitest';
import {
  ACCOUNT_COLORS,
  ACCOUNT_COLOR_HEX,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABEL,
  CATEGORIES,
  CATEGORY_LABEL,
  DIRECTIONS,
  DIRECTION_LABEL,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  LAST4_PATTERN,
  MONEY_DATA_QUERY_ROOTS,
  QUERY_KEYS,
  SECURITY_EVENT,
  SECURITY_EVENT_LABEL,
  WARNING_SECURITY_EVENTS,
  isCategoryAllowed,
  providerPath,
  CONNECTION_STATUS,
  CONNECTION_STATUS_HELP,
  CONNECTION_STATUS_LABEL,
  LINK_PLATFORM,
} from '../src/index.js';

describe('constants', () => {
  it('labels every category, direction, account type and colour', () => {
    for (const c of CATEGORIES) expect(CATEGORY_LABEL[c]).toBeTruthy();
    for (const d of DIRECTIONS) expect(DIRECTION_LABEL[d]).toBeTruthy();
    for (const t of ACCOUNT_TYPES) expect(ACCOUNT_TYPE_LABEL[t]).toBeTruthy();
    for (const c of ACCOUNT_COLORS) expect(ACCOUNT_COLOR_HEX[c]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('keeps income and expense categories apart, with TRANSFER allowed both ways', () => {
    expect(EXPENSE_CATEGORIES.filter((c) => (INCOME_CATEGORIES as readonly string[]).includes(c))).toEqual([]);
    expect(isCategoryAllowed('SALARY', 'INCOME')).toBe(true);
    expect(isCategoryAllowed('SALARY', 'EXPENSE')).toBe(false);
    expect(isCategoryAllowed('TRANSFER', 'EXPENSE')).toBe(true);
    expect(isCategoryAllowed('TRANSFER', 'INCOME')).toBe(true);
  });

  it('accepts only four digits as last4', () => {
    expect(LAST4_PATTERN.test('1234')).toBe(true);
    for (const v of ['123', '12345', '12a4', '4111111111111111']) expect(LAST4_PATTERN.test(v)).toBe(false);
  });

  it('labels every security event and only warns about real ones', () => {
    for (const type of Object.values(SECURITY_EVENT)) expect(SECURITY_EVENT_LABEL[type]).toBeTruthy();
    for (const type of WARNING_SECURITY_EVENTS) expect(Object.values(SECURITY_EVENT)).toContain(type);
  });

  it('labels and explains every connection status', () => {
    for (const status of Object.values(CONNECTION_STATUS)) {
      expect(CONNECTION_STATUS_LABEL[status]).toBeTruthy();
      expect(CONNECTION_STATUS_HELP[status]).toBeTruthy();
    }
    expect(Object.values(LINK_PLATFORM)).toEqual(['web', 'ios', 'android']);
  });

  it('builds query keys and provider paths', () => {
    expect(QUERY_KEYS.summary(2026)).toEqual(['analytics', 'summary', 2026]);
    expect(QUERY_KEYS.merchants(2026, 'INCOME')).toEqual(['analytics', 'merchants', 2026, 'INCOME']);
    expect(QUERY_KEYS.transactions({ year: 2026 })).toEqual(['transactions', { year: 2026 }]);
    expect(MONEY_DATA_QUERY_ROOTS).toContain(QUERY_KEYS.accounts);
    expect(providerPath('PLAID')).toBe('plaid');
    expect(MONEY_DATA_QUERY_ROOTS).toContain(QUERY_KEYS.connections);
  });
});
