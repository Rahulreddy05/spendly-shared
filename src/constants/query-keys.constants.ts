/** TanStack Query keys, shared so web and mobile invalidate identically. */
export const QUERY_KEYS = {
  me: ['me'] as const,
  clientConfig: ['client-config'] as const,
  mfaStatus: ['security', 'mfa'] as const,
  sessions: ['security', 'sessions'] as const,
  securityEvents: ['security', 'events'] as const,
  securityRoot: ['security'] as const,
  accounts: ['accounts'] as const,
  providers: ['providers'] as const,
  connections: ['connections'] as const,
  budgetsRoot: ['budgets'] as const,
  budgets: (month: string) => ['budgets', month] as const,
  notifications: ['notifications'] as const,
  notificationSettings: ['notification-settings'] as const,
  transactionsRoot: ['transactions'] as const,
  transactions: (filters: object) => ['transactions', filters] as const,
  analyticsRoot: ['analytics'] as const,
  summary: (year: number) => ['analytics', 'summary', year] as const,
  merchants: (year: number, direction: string) => ['analytics', 'merchants', year, direction] as const,
};

/** Queries to invalidate after anything that changes money data. */
export const MONEY_DATA_QUERY_ROOTS = [
  QUERY_KEYS.accounts,
  QUERY_KEYS.connections,
  QUERY_KEYS.transactionsRoot,
  // Spending changes budgets, and can create budget alerts.
  QUERY_KEYS.budgetsRoot,
  QUERY_KEYS.notifications,
  QUERY_KEYS.analyticsRoot,
] as const;
