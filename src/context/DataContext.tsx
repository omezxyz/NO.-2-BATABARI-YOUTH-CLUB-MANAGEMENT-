import { createContext, useContext, ReactNode } from 'react';
import { Member, MonthlyCollection, Loan, LoanPayment } from '@/types';
import { useMembers, useAddMember, useUpdateMember } from '@/hooks/useMembers';
import { useCollections, useAddCollection } from '@/hooks/useCollections';
import { useLoans, useAddLoan, useUpdateLoan } from '@/hooks/useLoans';
import { useLoanPayments, useAddLoanPayment } from '@/hooks/useLoanPayments';

interface DataContextType {
  members: Member[];
  collections: MonthlyCollection[];
  loans: Loan[];
  loanPayments: LoanPayment[];
  isLoading: boolean;
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  addCollection: (collection: { memberId: string; month: number; year: number; paidAt: string }) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'totalPaid' | 'totalInterestPaid'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  addLoanPayment: (payment: Omit<LoanPayment, 'id' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: collections = [], isLoading: collectionsLoading } = useCollections();
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  const { data: loanPayments = [], isLoading: paymentsLoading } = useLoanPayments();

  const addMemberMutation = useAddMember();
  const updateMemberMutation = useUpdateMember();
  const addCollectionMutation = useAddCollection();
  const addLoanMutation = useAddLoan();
  const updateLoanMutation = useUpdateLoan();
  const addLoanPaymentMutation = useAddLoanPayment();

  const isLoading = membersLoading || collectionsLoading || loansLoading || paymentsLoading;

  const addMember = (member: Omit<Member, 'id' | 'createdAt'>) => {
    addMemberMutation.mutate(member);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    updateMemberMutation.mutate({ id, updates });
  };

  const addCollection = (collection: { memberId: string; month: number; year: number; paidAt: string }) => {
    addCollectionMutation.mutate(collection);
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'totalPaid' | 'totalInterestPaid'>) => {
    addLoanMutation.mutate(loan);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    updateLoanMutation.mutate({ id, updates });
  };

  const addLoanPayment = (payment: Omit<LoanPayment, 'id' | 'createdAt'>) => {
    addLoanPaymentMutation.mutate(payment);
  };

  return (
    <DataContext.Provider value={{
      members,
      collections,
      loans,
      loanPayments,
      isLoading,
      addMember,
      updateMember,
      addCollection,
      addLoan,
      updateLoan,
      addLoanPayment,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
