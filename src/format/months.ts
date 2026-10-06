import { LOCALE } from '../constants/app.constants.js';

/**
 * Budget months are "YYYY-MM". Clients use the user's local calendar to pick
 * "this month"; the API counts transactions by their date, which has no time zone.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

/** The user's current local month, e.g. "2026-10". */
export const currentMonth = (now: Date = new Date()): string => `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

/** "2026-10" moved by `delta` months ("2026-01", -1 → "2025-12"). */
export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number) as [number, number];
  const d = new Date(year, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** "2026-10" → "October 2026". */
export function formatMonth(month: string): string {
  const [year, m] = month.split('-').map(Number) as [number, number];
  return new Date(year, m - 1, 1).toLocaleString(LOCALE, { month: 'long', year: 'numeric' });
}

/**
 * How far through `month` we are, 0..1 (1 for past months, 0 for future ones).
 * Lets budgets show pace: "80% used, 50% of the month gone".
 */
export function monthElapsed(month: string, now: Date = new Date()): number {
  const [year, m] = month.split('-').map(Number) as [number, number];
  const start = new Date(year, m - 1, 1).getTime();
  const end = new Date(year, m, 1).getTime();
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}
