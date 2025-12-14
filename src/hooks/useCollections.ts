import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonthlyCollection, mapDbCollection } from '@/types';
import { toast } from 'sonner';

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_collections')
        .select('*, members(name)')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      return data.map(mapDbCollection);
    },
  });
}

export function useAddCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (collection: { memberId: string; month: number; year: number; paidAt: string }) => {
      const { data, error } = await supabase
        .from('monthly_collections')
        .insert({
          member_id: collection.memberId,
          month: collection.month,
          year: collection.year,
          amount: 100,
          paid_at: collection.paidAt,
        })
        .select('*, members(name)')
        .single();
      
      if (error) throw error;
      return mapDbCollection(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection recorded successfully');
    },
    onError: (error) => {
      if (error.message.includes('duplicate')) {
        toast.error('Payment already recorded for this month');
      } else {
        toast.error('Failed to record collection: ' + error.message);
      }
    },
  });
}
