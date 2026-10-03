import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMoney,
  formatPercent,
  groupByMonth,
  monthLabel,
  parseAmountToCents,
  signedCents,
  todayIsoDate,
} from '../src/index.js';

describe('formatMoney', () => {
  it('formats integer cents', () => {
    expect(formatMoney(123_456)).toBe('$1,234.56');
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('supports signed and compact output', () => {
    expect(formatMoney(-1_250, 'USD', { signed: true })).toBe('-$12.50');
    expect(formatMoney(1_250, 'USD', { signed: true })).toBe('+$12.50');
    expect(formatMoney(0, 'USD', { signed: true })).toBe('$0.00');
    expect(formatMoney(125_000_000, 'USD', { compact: true })).toBe('$1.3M');
  });

  it('signs amounts even where Intl ignores signDisplay (React Native / Hermes)', () => {
    const RealNumberFormat = Intl.NumberFormat;
    // Simulate an engine without signDisplay support.
    const HermesLike = function (locale: string, opts: Intl.NumberFormatOptions = {}) {
      return new RealNumberFormat(locale, { ...opts, signDisplay: undefined });
    } as unknown as typeof Intl.NumberFormat;
    Intl.NumberFormat = HermesLike;
    try {
      expect(formatMoney(310_000, 'USD', { signed: true })).toBe('+$3,100.00');
      expect(formatMoney(-1_250, 'USD', { signed: true })).toBe('-$12.50');
      expect(formatMoney(0, 'USD', { signed: true })).toBe('$0.00');
    } finally {
      Intl.NumberFormat = RealNumberFormat;
    }
  });

  it('signs by direction', () => {
    expect(signedCents(500, 'INCOME')).toBe(500);
    expect(signedCents(500, 'EXPENSE')).toBe(-500);
  });
});

describe('parseAmountToCents', () => {
  it.each([
    ['12.50', 1_250],
    ['12.5', 1_250],
    ['12', 1_200],
    ['$1,200.99', 120_099],
    ['0.07', 7],
  ])('parses %s to %i cents without float error', (input, cents) => {
    expect(parseAmountToCents(input)).toBe(cents);
  });

  it.each(['', 'abc', '12.345', '-5', '1.2.3'])('rejects %s', (input) => {
    expect(parseAmountToCents(input)).toBeNull();
  });
});

describe('dates and labels', () => {
  it('formats percent, month and UTC date', () => {
    expect(formatPercent(0.234)).toBe('23%');
    expect(monthLabel(1)).toBe('Jan');
    expect(monthLabel(13)).toBe('');
    expect(formatDate('2026-03-04T00:00:00.000Z')).toBe('Mar 4, 2026');
  });

  it("uses the local calendar date for today, not UTC's", () => {
    expect(todayIsoDate(new Date(2026, 8, 28, 23, 30))).toBe('2026-09-28');
    expect(todayIsoDate(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });

  it('groups by month keeping order', () => {
    const groups = groupByMonth([
      { occurredAt: '2026-04-02T00:00:00.000Z', id: 1 },
      { occurredAt: '2026-04-01T00:00:00.000Z', id: 2 },
      { occurredAt: '2026-03-30T00:00:00.000Z', id: 3 },
    ]);
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ['Apr 2026', [1, 2]],
      ['Mar 2026', [3]],
    ]);
  });
});
