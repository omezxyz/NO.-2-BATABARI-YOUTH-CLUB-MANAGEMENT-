import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  mapDbMember,
  mapDbLoan,
  mapDbCollection,
} from '@/types';
import {
  generateMonthsFromStart,
  calculateInterest,
  formatCurrency,
  formatDate,
} from '@/lib/data';
import { Link } from 'react-router-dom';

/* ---------------- NAVBAR ---------------- */
const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow">
          <img src="logo.png" alt="" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">No. 2 Batabari Youth Club</p>
          <p className="text-xs text-muted-foreground">Member Portal</p>
        </div>
      </div>

      <Link to="/auth">
  <Badge
    variant="outline"
    className="hidden sm:block cursor-pointer hover:bg-primary/10 transition"
  >
    Admin
  </Badge>
</Link>
    </div>
  </header>
);

/* ---------------- MAIN ---------------- */
const MemberPortal = () => {
  const [selectedMemberId, setSelectedMemberId] = useState('');

  /* MEMBERS */
  const { data: members = [] } = useQuery({
    queryKey: ['members-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data.map(mapDbMember);
    },
  });

  /* COLLECTIONS */
  const { data: collections = [] } = useQuery({
    queryKey: ['collections-public', selectedMemberId],
    queryFn: async () => {
      if (!selectedMemberId) return [];
      const { data, error } = await supabase
        .from('monthly_collections')
        .select('*')
        .eq('member_id', selectedMemberId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) throw error;
      return data.map(mapDbCollection);
    },
    enabled: !!selectedMemberId,
  });

  /* LOANS */
  const { data: loans = [] } = useQuery({
    queryKey: ['loans-public', selectedMemberId],
    queryFn: async () => {
      if (!selectedMemberId) return [];
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('member_id', selectedMemberId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapDbLoan);
    },
    enabled: !!selectedMemberId,
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const allMonths = generateMonthsFromStart();

  /* PENDING MONTHS */
  const pendingMonths = useMemo(() => {
    const paid = new Set(collections.map(c => `${c.year}-${c.month}`));
    return allMonths.filter(m => !paid.has(`${m.year}-${m.month}`));
  }, [collections, allMonths]);

  /* ACTIVE LOANS WITH DETAILS */
  const activeLoans = useMemo(() => {
    return loans
      .filter(l => l.status === 'active')
      .map(l => {
        const remaining =
          l.principalAmount - (l.totalPaid - l.totalInterestPaid);

        const pendingInterest = calculateInterest(
          Math.max(0, remaining),
          l.interestRate,
          l.startDate
        );

        const daysElapsed = Math.floor(
          (Date.now() - new Date(l.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          ...l,
          remainingPrincipal: Math.max(0, remaining),
          pendingInterest,
          totalDue: Math.max(0, remaining) + pendingInterest,
          daysElapsed,
        };
      });
  }, [loans]);

  const totalPendingCollection = pendingMonths.length * 100;
  const totalLoanDue = activeLoans.reduce((s, l) => s + l.totalDue, 0);
  //paid show more
  const [showAllPaid, setShowAllPaid] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* MEMBER SELECT */}
        <div className="max-w-sm">
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Select your name..." />
            </SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedMemberId ? (
          <Card className="max-w-md mx-auto mt-12">
            <CardContent className="py-12 text-center">
              <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Select your name to view collections and loan details
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* MEMBER INFO */}
            <Card className="transition hover:shadow-lg">
              <CardContent className="py-5 flex flex-col sm:flex-row gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="text-primary" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {selectedMember?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(selectedMember?.createdAt || '')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="bg-destructive/10 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Collection Due</p>
                    <p className="font-bold text-destructive">
                      {formatCurrency(totalPendingCollection)}
                    </p>
                  </div>
                  <div className="bg-warning/10 rounded-lg px-4 py-2 text-center">
                    <p className="text-xs text-muted-foreground">Loan Due</p>
                    <p className="font-bold text-warning">
                      {formatCurrency(totalLoanDue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COLLECTION STATUS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Monthly Collection Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* PENDING */}
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Pending ({pendingMonths.length})
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pendingMonths.map(m => (
                        <Badge key={m.label} variant="destructive">
                          {m.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                 {/* PAID */}
<div>
  <div className="flex items-center justify-between">
    <p className="flex items-center gap-2 font-medium">
      <CheckCircle className="h-4 w-4 text-success" />
      Paid ({collections.length})
    </p>

    {collections.length > 12 && (
      <button
        onClick={() => setShowAllPaid(prev => !prev)}
        className="text-xs font-medium text-primary hover:underline"
      >
        {showAllPaid ? 'Show less' : 'Show all'}
      </button>
    )}
  </div>

  <div className="flex flex-wrap gap-2 mt-2">
    {(showAllPaid ? collections : collections.slice(0, 12)).map(c => (
      <Badge
        key={c.id}
        className="bg-success/10 text-success border-success/20"
      >
        {
          allMonths.find(
            m => m.month === c.month && m.year === c.year
          )?.label
        }
      </Badge>
    ))}
  </div>
</div>

                </CardContent>
              </Card>

              {/* LOAN DETAILS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Active Loans ({activeLoans.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeLoans.map(loan => (
                    <div
                      key={loan.id}
                      className="bg-muted/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">
                          {formatCurrency(loan.principalAmount)}
                        </p>
                        <Badge>{loan.interestRate}% / month</Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>{formatDate(loan.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Days Elapsed</p>
                          <p>{loan.daysElapsed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Paid</p>
                          <p className="text-success">
                            {formatCurrency(loan.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Remaining Principal
                          </p>
                          <p>{formatCurrency(loan.remainingPrincipal)}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between bg-card p-3 rounded">
                        <span className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-warning" />
                          Pending Interest
                        </span>
                        <span className="font-semibold text-warning">
                          {formatCurrency(loan.pendingInterest)}
                        </span>
                      </div>

                      <div className="flex justify-between bg-destructive/10 p-3 rounded">
                        <span className="font-medium">Total Due</span>
                        <span className="font-bold text-destructive">
                          {formatCurrency(loan.totalDue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background/60 backdrop-blur-sm py-4 text-center text-xs text-muted-foreground">
        <p>© 2025 No. 2 Batabari Youth Club Management System</p>
        <p className="mt-1">
          Developed by <span className="font-medium">Omesh Rabha</span>
        </p>
      </footer>
    </div>
  );
};

export default MemberPortal;
