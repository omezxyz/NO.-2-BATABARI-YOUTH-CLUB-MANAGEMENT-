import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoanPayment, mapDbLoanPayment } from '@/types';
import { toast } from 'sonner';

export function useLoanPayments() {
  return useQuery({
    queryKey: ['loanPayments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbLoanPayment);
    },
  });
}

export function useAddLoanPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: Omit<LoanPayment, 'id' | 'createdAt'>) => {
      // Insert the payment
      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: payment.loanId,
          amount: payment.amount,
          payment_date: payment.paymentDate,
          principal_paid: payment.principalPaid,
          interest_paid: payment.interestPaid,
          notes: payment.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the loan totals
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', payment.loanId)
        .single();
      
      if (loan) {
        const newTotalPaid = loan.total_paid + payment.amount;
        const newInterestPaid = loan.total_interest_paid + payment.interestPaid;
        const remainingPrincipal = loan.principal_amount - (newTotalPaid - newInterestPaid);
        
        await supabase
          .from('loans')
          .update({
            total_paid: newTotalPaid,
            total_interest_paid: newInterestPaid,
            status: remainingPrincipal <= 0 ? 'completed' : 'active',
          })
          .eq('id', payment.loanId);
      }
      
      return mapDbLoanPayment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanPayments'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });
}
