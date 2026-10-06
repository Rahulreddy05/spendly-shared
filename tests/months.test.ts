import { describe, expect, it } from 'vitest';
import { currentMonth, formatMonth, monthElapsed, shiftMonth } from '../src/index.js';

describe('budget months', () => {
  it("uses the user's local calendar for this month", () => {
    expect(currentMonth(new Date(2026, 9, 31, 23, 59))).toBe('2026-10');
    expect(currentMonth(new Date(2026, 0, 1))).toBe('2026-01');
  });

  it('steps months across year boundaries', () => {
    expect(shiftMonth('2026-10', -1)).toBe('2026-09');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-10', 0)).toBe('2026-10');
  });

  it('names months', () => {
    expect(formatMonth('2026-10')).toBe('October 2026');
  });

  it('measures how much of a month has passed, clamped to 0..1', () => {
    expect(monthElapsed('2026-10', new Date(2026, 9, 1))).toBe(0);
    expect(monthElapsed('2026-10', new Date(2026, 9, 16, 12))).toBeCloseTo(0.5, 2);
    expect(monthElapsed('2026-09', new Date(2026, 9, 16))).toBe(1);
    expect(monthElapsed('2026-11', new Date(2026, 9, 16))).toBe(0);
  });
});
