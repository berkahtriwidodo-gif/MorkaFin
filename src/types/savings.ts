export type TransactionType = 'Setoran' | 'Penarikan';

export interface Transaction {
  id: string;
  no: number;
  date: string; // YYYY-MM-DD
  description: string;
  type: TransactionType;
  source: string;
  category?: string; // e.g. "Darurat" | "Liburan" | "Pendidikan"
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  notes: string;
}

export interface SavingsCategory {
  id: string;
  name: string; // e.g. "Darurat", "Liburan", "Pendidikan"
  targetAmount: number;
  description: string;
  icon?: string;
  color?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  monthlyDepositTarget?: number;
  notes?: string;
}

export interface MonthlyRecapData {
  monthKey: string; // e.g. "2026-01"
  monthName: string; // e.g. "Januari 2026"
  year: number;
  monthIndex: number;
  targetDeposit: number;
  totalDeposit: number;
  totalWithdrawal: number;
  netDiff: number;
  closingBalance: number;
  achievementPercentage: number;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'target' | 'recap' | 'guide';

export type ProgressStatus = 'Belum Mulai' | 'Berjalan' | 'Hampir Tercapai' | 'Target Tercapai';
