/**
 * Categories and directions. The API's Prisma enums must list exactly these
 * values (spendly-api tests/unit/constants.test.ts checks it).
 */

export const DIRECTION = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const;
export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
export const DIRECTIONS = [DIRECTION.EXPENSE, DIRECTION.INCOME] as const;

export const EXPENSE_CATEGORIES = [
  'GROCERIES',
  'DINING',
  'SHOPPING',
  'TRAVEL',
  'TRANSPORT',
  'BILLS',
  'HOUSING',
  'ENTERTAINMENT',
  'HEALTH',
  'OTHER',
] as const;
export const INCOME_CATEGORIES = ['SALARY', 'INTEREST', 'REFUND', 'OTHER_INCOME'] as const;
export const TRANSFER_CATEGORY = 'TRANSFER' as const;

export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, TRANSFER_CATEGORY] as const;
export type Category = (typeof CATEGORIES)[number];

/** Which categories a direction may use. TRANSFER is valid both ways. */
export const CATEGORIES_BY_DIRECTION: Record<Direction, readonly Category[]> = {
  EXPENSE: [...EXPENSE_CATEGORIES, TRANSFER_CATEGORY],
  INCOME: [...INCOME_CATEGORIES, TRANSFER_CATEGORY],
};

/** Not income or spending: excluded from every total. */
export const EXCLUDED_FROM_TOTALS: readonly Category[] = [TRANSFER_CATEGORY];

export const isCategoryAllowed = (category: Category, direction: Direction): boolean =>
  CATEGORIES_BY_DIRECTION[direction].includes(category);

export const CATEGORY_LABEL: Record<Category, string> = {
  GROCERIES: 'Groceries',
  DINING: 'Dining out',
  SHOPPING: 'Shopping',
  TRAVEL: 'Travel',
  TRANSPORT: 'Transport',
  BILLS: 'Bills & utilities',
  HOUSING: 'Housing',
  ENTERTAINMENT: 'Entertainment',
  HEALTH: 'Health',
  OTHER: 'Other spending',
  SALARY: 'Salary',
  INTEREST: 'Interest',
  REFUND: 'Refunds',
  OTHER_INCOME: 'Other income',
  TRANSFER: 'Transfer',
};

export const DIRECTION_LABEL: Record<Direction, string> = {
  INCOME: 'Money in',
  EXPENSE: 'Money out',
};
