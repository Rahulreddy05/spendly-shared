import { CENTS_PER_UNIT, DEFAULT_CURRENCY, LOCALE, MONTHS_SHORT } from '../constants/app.constants.js';

/**
 * The only place money becomes a display string. Amounts arrive as integer
 * cents; the division happens here, at the presentation edge, and nowhere else.
 */
export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  options: { compact?: boolean; signed?: boolean } = {},
): string {
  const formatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    notation: options.compact ? 'compact' : 'standard',
    maximumFractionDigits: options.compact ? 1 : 2,
  });
  if (!options.signed) return formatter.format(cents / CENTS_PER_UNIT);

  // The sign is added by hand rather than with Intl's `signDisplay`, which
  // React Native's Hermes engine ignores (it would drop the "+" on income).
  const magnitude = formatter.format(Math.abs(cents) / CENTS_PER_UNIT);
  if (cents > 0) return `+${magnitude}`;
  if (cents < 0) return `-${magnitude}`;
  return magnitude;
}

/** Signed amount for a transaction: money in positive, money out negative. */
export const signedCents = (amountCents: number, direction: 'INCOME' | 'EXPENSE'): number =>
  direction === 'INCOME' ? amountCents : -amountCents;

/** 0.234 → "23%". */
export function formatPercent(fraction: number): string {
  return new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
}

export const monthLabel = (month: number): string => MONTHS_SHORT[month - 1] ?? '';

/** API dates are 'YYYY-MM-DD' at UTC midnight; show them without timezone drift. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso),
  );
}

/**
 * A moment in time (createdAt, lastUsedAt) in the viewer's own time zone, e.g.
 * "Oct 5, 2026, 6:02 PM". Use formatDate for transaction dates instead, which
 * are calendar dates with no time zone.
 */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Parses a user-typed amount ("12.50", "$1,200") into integer cents without
 * floating-point rounding. Returns null for anything that is not money.
 */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(2, '0'));
  return whole * CENTS_PER_UNIT + fraction;
}

/** The user's local calendar date as 'YYYY-MM-DD' (not UTC, which can be tomorrow). */
export function todayIsoDate(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Groups items by 'YYYY-MM' of their occurredAt, newest group first as given. */
export function groupByMonth<T extends { occurredAt: string }>(
  items: readonly T[],
): { key: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = item.occurredAt.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    key,
    label: `${monthLabel(Number(key.slice(5, 7)))} ${key.slice(0, 4)}`,
    items: list,
  }));
}
