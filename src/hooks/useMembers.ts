import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Member, mapDbMember } from '@/types';
import { toast } from 'sonner';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data.map(mapDbMember);
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (member: Omit<Member, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert({
          name: member.name,
          phone: member.phone,
          email: member.email,
          address: member.address,
          status: member.status,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbMember(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add member: ' + error.message);
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Member> }) => {
      const { error } = await supabase
        .from('members')
        .update({
          name: updates.name,
          phone: updates.phone,
          email: updates.email,
          address: updates.address,
          status: updates.status,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update member: ' + error.message);
    },
  });
}
