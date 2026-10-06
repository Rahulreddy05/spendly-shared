import { EXPENSE_CATEGORIES } from './categories.constants.js';

/** Mirrors the API: alerts at 80% (heads-up) and 100% (limit reached). */
export const BUDGET = {
  WARNING_PERCENT: 80,
  EXCEEDED_PERCENT: 100,
} as const;

/** Only spending categories can have a budget. */
export const BUDGETABLE_CATEGORIES = EXPENSE_CATEGORIES;

export const BUDGET_STATUS = { OK: 'OK', WARNING: 'WARNING', EXCEEDED: 'EXCEEDED' } as const;
export type BudgetStatus = (typeof BUDGET_STATUS)[keyof typeof BUDGET_STATUS];

export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  OK: 'On track',
  WARNING: 'Almost there',
  EXCEEDED: 'Over budget',
};

export const NOTIFICATION_TYPE = {
  BUDGET_WARNING: 'BUDGET_WARNING',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

/** How often clients check for new notifications while open. */
export const NOTIFICATIONS_POLL_MS = 60_000;
/** How many notifications the bell shows. */
export const NOTIFICATIONS_LIST_LIMIT = 20;
