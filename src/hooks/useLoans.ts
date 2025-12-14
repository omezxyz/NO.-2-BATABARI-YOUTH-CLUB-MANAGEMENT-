import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan, mapDbLoan } from '@/types';
import { toast } from 'sonner';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbLoan);
    },
  });
}

export function useAddLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loan: Omit<Loan, 'id' | 'createdAt' | 'totalPaid' | 'totalInterestPaid'>) => {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          borrower_name: loan.borrowerName,
          borrower_type: loan.borrowerType,
          member_id: loan.memberId || null,
          principal_amount: loan.principalAmount,
          interest_rate: loan.interestRate,
          start_date: loan.startDate,
          status: loan.status,
          notes: loan.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbLoan(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Loan added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add loan: ' + error.message);
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Loan> }) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.totalPaid !== undefined) dbUpdates.total_paid = updates.totalPaid;
      if (updates.totalInterestPaid !== undefined) dbUpdates.total_interest_paid = updates.totalInterestPaid;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      
      const { error } = await supabase
        .from('loans')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
    onError: (error) => {
      toast.error('Failed to update loan: ' + error.message);
    },
  });
}
