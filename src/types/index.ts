import { Tables } from '@/integrations/supabase/types';

// Database row types
export type DbMember = Tables<'members'>;
export type DbMonthlyCollection = Tables<'monthly_collections'>;
export type DbLoan = Tables<'loans'>;
export type DbLoanPayment = Tables<'loan_payments'>;

// Frontend types (with computed fields)
export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MonthlyCollection {
  id: string;
  memberId: string;
  memberName: string;
  month: number;
  year: number;
  amount: number;
  paidAt: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerType: 'member' | 'outsider';
  memberId?: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  status: 'active' | 'completed' | 'defaulted';
  notes?: string;
  totalPaid: number;
  totalInterestPaid: number;
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  totalMonthlyCollection: number;
  totalOutstandingLoans: number;
  totalInterestEarned: number;
  totalClubBalance: number;
  activeLoans: number;
}

export type MonthYear = {
  month: number;
  year: number;
  label: string;
};

// Mappers from DB to frontend types
export const mapDbMember = (db: DbMember): Member => ({
  id: db.id,
  name: db.name,
  phone: db.phone || '',
  email: db.email || undefined,
  address: db.address || undefined,
  status: db.status as 'active' | 'inactive',
  createdAt: db.created_at,
});

export const mapDbLoan = (db: DbLoan): Loan => ({
  id: db.id,
  borrowerName: db.borrower_name,
  borrowerType: db.borrower_type as 'member' | 'outsider',
  memberId: db.member_id || undefined,
  principalAmount: db.principal_amount,
  interestRate: db.interest_rate,
  startDate: db.start_date,
  status: db.status as 'active' | 'completed' | 'defaulted',
  notes: db.notes || undefined,
  totalPaid: db.total_paid,
  totalInterestPaid: db.total_interest_paid,
  createdAt: db.created_at,
});

export const mapDbLoanPayment = (db: DbLoanPayment): LoanPayment => ({
  id: db.id,
  loanId: db.loan_id,
  amount: db.amount,
  paymentDate: db.payment_date,
  principalPaid: db.principal_paid,
  interestPaid: db.interest_paid,
  notes: db.notes || undefined,
  createdAt: db.created_at,
});

export const mapDbCollection = (db: DbMonthlyCollection & { members?: { name: string } | null }): MonthlyCollection => ({
  id: db.id,
  memberId: db.member_id,
  memberName: db.members?.name || 'Unknown',
  month: db.month,
  year: db.year,
  amount: db.amount,
  paidAt: db.paid_at,
});
