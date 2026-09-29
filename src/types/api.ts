/**
 * Request and response shapes of spendly-api. An API change and the matching
 * change here ship together (ENGINEERING_STANDARDS.md §8).
 */
import type {
  AccountColor,
  AccountStatus,
  AccountType,
  DataSource,
  ProviderId,
  TransactionStatus,
} from '../constants/accounts.constants.js';
import type { Category, Direction } from '../constants/categories.constants.js';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Account {
  id: string;
  name: string;
  institution: string | null;
  type: AccountType;
  last4: string | null;
  color: AccountColor;
  currency: string;
  source: DataSource;
  status: AccountStatus;
  archived: boolean;
  balanceCents: number | null;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amountCents: number;
  direction: Direction;
  currency: string;
  category: Category;
  status: TransactionStatus;
  merchant: string | null;
  note: string | null;
  occurredAt: string;
  source: DataSource;
}

export interface TransactionPage {
  items: Transaction[];
  nextCursor: string | null;
}

export interface CategoryTotal {
  category: Category;
  totalCents: number;
  transactionCount: number;
  share: number;
}

export interface MonthTotal {
  month: number;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
}

export interface AccountTotal {
  accountId: string;
  name: string;
  institution: string | null;
  last4: string | null;
  color: string;
  type: string;
  source: string;
  incomeCents: number;
  expenseCents: number;
}

export interface YearSummary {
  year: number;
  incomeCents: number;
  expenseCents: number;
  netCents: number;
  savingsRate: number | null;
  transactionCount: number;
  topExpenseCategory: CategoryTotal | null;
  topIncomeCategory: CategoryTotal | null;
  expenseByCategory: CategoryTotal[];
  incomeByCategory: CategoryTotal[];
  byMonth: MonthTotal[];
  byAccount: AccountTotal[];
}

export interface MerchantTotal {
  merchant: string;
  totalCents: number;
  transactionCount: number;
}

export interface LinkSession {
  sessionId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface SyncResult {
  upserted: number;
  removed: number;
}

export interface LinkSessionOptions {
  /** https URL or spendly:// deep link to return to after bank-app approval. */
  returnUrl?: string;
}

export interface ClientConfig {
  minAppVersion: { ios: string; android: string };
  providers: ProviderId[];
}

export interface ProvidersResponse {
  providers: ProviderId[];
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateAccountInput {
  name: string;
  institution?: string;
  type: AccountType;
  last4?: string;
  color: AccountColor;
}

export interface CreateTransactionInput {
  accountId: string;
  amountCents: number;
  direction: Direction;
  category: Category;
  merchant?: string;
  note?: string;
  occurredAt: string;
}

export interface TransactionFilters {
  year?: number;
  accountId?: string;
  category?: Category;
  direction?: Direction;
}

export type UpdateAccountInput = Partial<Pick<Account, 'name' | 'color' | 'archived'>>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;
