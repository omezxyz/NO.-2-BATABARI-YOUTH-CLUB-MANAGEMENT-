// import { useState, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { User, Calendar, CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { useQuery } from '@tanstack/react-query';
// import { Member, MonthlyCollection, Loan, mapDbMember, mapDbLoan, mapDbCollection } from '@/types';
// import { generateMonthsFromStart, calculateInterest, formatCurrency, formatDate } from '@/lib/data';

// const MemberPortal = () => {
//   const [selectedMemberId, setSelectedMemberId] = useState<string>('');

//   // Fetch members for dropdown
//   const { data: members = [] } = useQuery({
//     queryKey: ['members-public'],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from('members')
//         .select('*')
//         .eq('status', 'active')
//         .order('name');
//       if (error) throw error;
//       return data.map(mapDbMember);
//     }
//   });

//   // Fetch collections for selected member
//   const { data: collections = [] } = useQuery({
//     queryKey: ['collections-public', selectedMemberId],
//     queryFn: async () => {
//       if (!selectedMemberId) return [];
//       const { data, error } = await supabase
//         .from('monthly_collections')
//         .select('*, members(name)')
//         .eq('member_id', selectedMemberId)
//         .order('year', { ascending: false })
//         .order('month', { ascending: false });
//       if (error) throw error;
//       return data.map(mapDbCollection);
//     },
//     enabled: !!selectedMemberId
//   });

//   // Fetch loans for selected member
//   const { data: loans = [] } = useQuery({
//     queryKey: ['loans-public', selectedMemberId],
//     queryFn: async () => {
//       if (!selectedMemberId) return [];
//       const { data, error } = await supabase
//         .from('loans')
//         .select('*')
//         .eq('member_id', selectedMemberId)
//         .order('created_at', { ascending: false });
//       if (error) throw error;
//       return data.map(mapDbLoan);
//     },
//     enabled: !!selectedMemberId
//   });

//   const selectedMember = members.find(m => m.id === selectedMemberId);
//   const allMonths = generateMonthsFromStart();

//   // Calculate pending months
//   const pendingMonths = useMemo(() => {
//     if (!selectedMemberId) return [];
//     const paidMonths = new Set(
//       collections.map(c => `${c.year}-${c.month}`)
//     );
//     return allMonths.filter(m => !paidMonths.has(`${m.year}-${m.month}`));
//   }, [selectedMemberId, collections, allMonths]);

//   // Calculate loan details
//   const activeLoans = useMemo(() => {
//     return loans
//       .filter(loan => loan.status === 'active')
//       .map(loan => {
//         const remainingPrincipal = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
//         const pendingInterest = calculateInterest(
//           Math.max(0, remainingPrincipal),
//           loan.interestRate,
//           loan.startDate
//         );
//         const startDate = new Date(loan.startDate);
//         const today = new Date();
//         const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
//         return {
//           ...loan,
//           remainingPrincipal: Math.max(0, remainingPrincipal),
//           pendingInterest,
//           totalDue: Math.max(0, remainingPrincipal) + pendingInterest,
//           daysElapsed
//         };
//       });
//   }, [loans]);

//   const totalPendingCollection = pendingMonths.length * 100;
//   const totalLoanDue = activeLoans.reduce((sum, loan) => sum + loan.totalDue, 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
//       {/* Header */}
//       <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
//         <div className="container mx-auto px-4 py-4 sm:py-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-foreground">No. 2 Batabari Youth Club </h1>
//               <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Member Portal</h2>
//               <p className="text-sm text-muted-foreground mt-1">View your collection status and loan details</p>
//             </div>
//             <div className="w-full sm:w-72">
//               <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
//                 <SelectTrigger className="bg-background">
//                   <SelectValue placeholder="Select your name..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {members.map(member => (
//                     <SelectItem key={member.id} value={member.id}>
//                       {member.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6 sm:py-8">
//         {!selectedMemberId ? (
//           <Card className="max-w-md mx-auto mt-12">
//             <CardContent className="py-12 text-center">
//               <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
//               <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Member Portal</h2>
//               <p className="text-muted-foreground">Select your name from the dropdown above to view your collection status and loan details.</p>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="space-y-6">
//             {/* Member Info Card */}
//             <Card>
//               <CardContent className="py-4">
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//                   <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
//                     <User className="h-7 w-7 text-primary" />
//                   </div>
//                   <div className="flex-1">
//                     <h2 className="text-xl font-semibold text-foreground">{selectedMember?.name}</h2>
//                     <p className="text-sm text-muted-foreground">Member since {formatDate(selectedMember?.createdAt || '')}</p>
//                   </div>
//                   <div className="flex gap-3 sm:gap-6 text-center">
//                     <div className="bg-destructive/10 rounded-lg p-3 sm:p-4 flex-1 sm:flex-none">
//                       <p className="text-xs text-muted-foreground">Collection Due</p>
//                       <p className="text-lg sm:text-xl font-bold text-destructive">{formatCurrency(totalPendingCollection)}</p>
//                     </div>
//                     <div className="bg-warning/10 rounded-lg p-3 sm:p-4 flex-1 sm:flex-none">
//                       <p className="text-xs text-muted-foreground">Loan Due</p>
//                       <p className="text-lg sm:text-xl font-bold text-warning">{formatCurrency(totalLoanDue)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Two Column Layout for larger screens */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Monthly Collection Status */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="flex items-center gap-2 text-lg">
//                     <Calendar className="h-5 w-5 text-primary" />
//                     Monthly Collection Status
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {/* Pending Months */}
//                   <div>
//                     <div className="flex items-center gap-2 mb-3">
//                       <AlertCircle className="h-4 w-4 text-destructive" />
//                       <span className="font-medium text-sm text-foreground">Pending ({pendingMonths.length})</span>
//                     </div>
//                     {pendingMonths.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {pendingMonths.slice(0, 12).map(m => (
//                           <Badge key={`${m.year}-${m.month}`} variant="destructive" className="text-xs">
//                             {m.label}
//                           </Badge>
//                         ))}
//                         {pendingMonths.length > 12 && (
//                           <Badge variant="outline" className="text-xs">
//                             +{pendingMonths.length - 12} more
//                           </Badge>
//                         )}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-muted-foreground">All collections are up to date!</p>
//                     )}
//                   </div>

//                   <Separator />

//                   {/* Paid Months */}
//                   <div>
//                     <div className="flex items-center gap-2 mb-3">
//                       <CheckCircle className="h-4 w-4 text-success" />
//                       <span className="font-medium text-sm text-foreground">Paid ({collections.length})</span>
//                     </div>
//                     {collections.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {collections.slice(0, 12).map(c => (
//                           <Badge key={c.id} variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
//                             {allMonths.find(m => m.month === c.month && m.year === c.year)?.label || `${c.month}/${c.year}`}
//                           </Badge>
//                         ))}
//                         {collections.length > 12 && (
//                           <Badge variant="outline" className="text-xs">
//                             +{collections.length - 12} more
//                           </Badge>
//                         )}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-muted-foreground">No collections recorded yet.</p>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Active Loans */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="flex items-center gap-2 text-lg">
//                     <CreditCard className="h-5 w-5 text-primary" />
//                     Active Loans ({activeLoans.length})
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   {activeLoans.length > 0 ? (
//                     <div className="space-y-4">
//                       {activeLoans.map(loan => (
//                         <div key={loan.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <p className="font-semibold text-foreground">{formatCurrency(loan.principalAmount)}</p>
//                               <p className="text-xs text-muted-foreground">Principal Amount</p>
//                             </div>
//                             <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
//                               {loan.interestRate}% / month
//                             </Badge>
//                           </div>
                          
//                           <Separator />
                          
//                           <div className="grid grid-cols-2 gap-3 text-sm">
//                             <div>
//                               <p className="text-muted-foreground">Start Date</p>
//                               <p className="font-medium">{formatDate(loan.startDate)}</p>
//                             </div>
//                             <div>
//                               <p className="text-muted-foreground">Days Elapsed</p>
//                               <p className="font-medium">{loan.daysElapsed} days</p>
//                             </div>
//                             <div>
//                               <p className="text-muted-foreground">Total Paid</p>
//                               <p className="font-medium text-success">{formatCurrency(loan.totalPaid)}</p>
//                             </div>
//                             <div>
//                               <p className="text-muted-foreground">Remaining Principal</p>
//                               <p className="font-medium">{formatCurrency(loan.remainingPrincipal)}</p>
//                             </div>
//                           </div>
                          
//                           <Separator />
                          
//                           <div className="flex items-center justify-between bg-card rounded-md p-3">
//                             <div className="flex items-center gap-2">
//                               <TrendingUp className="h-4 w-4 text-warning" />
//                               <span className="text-sm text-muted-foreground">Pending Interest</span>
//                             </div>
//                             <span className="font-semibold text-warning">{formatCurrency(loan.pendingInterest)}</span>
//                           </div>
                          
//                           <div className="flex items-center justify-between bg-destructive/10 rounded-md p-3">
//                             <span className="font-medium text-foreground">Total Amount Due</span>
//                             <span className="font-bold text-lg text-destructive">{formatCurrency(loan.totalDue)}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="py-8 text-center">
//                       <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
//                       <p className="text-muted-foreground">No active loans</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="border-t border-border mt-auto py-4 text-center text-sm text-muted-foreground">
//         <p>© 2025 No. 2 Batabari Youth Club Management System</p><br />
//         <p>Developed by Omesh Rabha</p>
//       </footer>
//     </div>
//   );
// };

// export default MemberPortal;
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
