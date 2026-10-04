/**
 * Request and response shapes of spendly-api. An API change and the matching
 * change here ship together (ENGINEERING_STANDARDS.md §8).
 */
import type {
  AccountColor,
  AccountStatus,
  AccountType,
  ConnectionStatus,
  DataSource,
  ProviderId,
  TransactionStatus,
} from '../constants/accounts.constants.js';
import type { Category, Direction } from '../constants/categories.constants.js';
import type { SecurityEventType } from '../constants/security.constants.js';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Password was right; a second factor is needed to finish signing in. */
export interface MfaChallenge {
  mfaRequired: true;
  mfaToken: string;
}

export type LoginResult = AuthResponse | MfaChallenge;

/** Exactly one of an authenticator code or a recovery code. */
export type SecondFactor = { code: string; recoveryCode?: never } | { recoveryCode: string; code?: never };

export interface MfaStatus {
  enabled: boolean;
  recoveryCodesRemaining: number;
}

export interface TotpSetup {
  /** Base32 secret for typing into an authenticator by hand. */
  secret: string;
  /** otpauth:// URI: shown as a QR code on web, opened directly on mobile. */
  otpauthUrl: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  platform: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  deviceName: string | null;
  ipAddress: string | null;
  createdAt: string;
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

/** Opens the provider's bank picker (Plaid Link). Single use, expires in hours. */
export interface LinkToken {
  linkToken: string;
  expiration: string;
}

/** One bank login and the accounts the user shared through it. */
export interface BankConnection {
  id: string;
  provider: ProviderId;
  institutionName: string | null;
  status: ConnectionStatus;
  lastSyncedAt: string | null;
  createdAt: string;
  accounts: Account[];
}

export interface SyncResult {
  upserted: number;
  removed: number;
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
