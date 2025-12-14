import { cn } from '@/lib/utils';

type Status = 'paid' | 'pending' | 'overdue' | 'active' | 'completed' | 'member' | 'outsider';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  active: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  member: 'bg-primary/10 text-primary border-primary/20',
  outsider: 'bg-accent/10 text-accent border-accent/20',
};

const statusLabels: Record<Status, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  active: 'Active',
  completed: 'Completed',
  member: 'Member',
  outsider: 'Outsider',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
