// import { useState, useMemo } from 'react';
// import { HandCoins, Search, Plus, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
// import { Layout } from '@/components/layout/Layout';
// import { PageHeader } from '@/components/ui/page-header';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { StatusBadge } from '@/components/ui/status-badge';
// import { StatCard } from '@/components/ui/stat-card';
// import { useData } from '@/context/DataContext';
// import { formatDate, formatCurrency, calculateInterest } from '@/lib/data';
// import { Loan } from '@/types';
// import { toast } from 'sonner';

// export default function Loans() {
//   const { members, loans, addLoan, isLoading } = useData();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
  
//   const [formData, setFormData] = useState({
//     borrowerName: '',
//     borrowerType: 'member' as 'member' | 'outsider',
//     memberId: '',
//     principalAmount: '',
//     startDate: new Date().toISOString().split('T')[0],
//     notes: '',
//   });

//   const filteredLoans = useMemo(() => {
//     return loans.filter(l => {
//       const matchesSearch = l.borrowerName.toLowerCase().includes(search.toLowerCase());
//       const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [loans, search, statusFilter]);

//   const stats = useMemo(() => {
//     const active = loans.filter(l => l.status === 'active');
//     const completed = loans.filter(l => l.status === 'completed');
    
//     const totalOutstanding = active.reduce((sum, loan) => {
//       const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
//       return sum + Math.max(0, remaining);
//     }, 0);
    
//     const totalInterest = loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
    
//     const pendingInterest = active.reduce((sum, loan) => {
//       const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
//       return sum + calculateInterest(remaining, loan.interestRate, loan.startDate);
//     }, 0);

//     return {
//       activeCount: active.length,
//       completedCount: completed.length,
//       totalOutstanding,
//       totalInterest,
//       pendingInterest,
//     };
//   }, [loans]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.borrowerName || !formData.principalAmount) {
//       toast.error('Please fill in required fields');
//       return;
//     }

//     const rate = formData.borrowerType === 'member' ? 3 : 5;
    
//     addLoan({
//       borrowerName: formData.borrowerName,
//       borrowerType: formData.borrowerType,
//       memberId: formData.borrowerType === 'member' ? formData.memberId : undefined,
//       principalAmount: parseFloat(formData.principalAmount),
//       interestRate: rate,
//       startDate: formData.startDate,
//       status: 'active',
//       notes: formData.notes,
//     });
    
//     setFormData({
//       borrowerName: '',
//       borrowerType: 'member',
//       memberId: '',
//       principalAmount: '',
//       startDate: new Date().toISOString().split('T')[0],
//       notes: '',
//     });
//     setIsDialogOpen(false);
//   };

//   const getLoanDetails = (loan: Loan) => {
//     const remainingPrincipal = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
//     const pendingInterest = calculateInterest(Math.max(0, remainingPrincipal), loan.interestRate, loan.startDate);
//     const totalDue = Math.max(0, remainingPrincipal) + pendingInterest;
    
//     const startDate = new Date(loan.startDate);
//     const today = new Date();
//     const months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    
//     return { remainingPrincipal: Math.max(0, remainingPrincipal), pendingInterest, totalDue, months };
//   };

//   if (isLoading) {
//     return (
//       <Layout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="my-6">
//       <PageHeader
//         title="Loan Management"
//         description="Manage member and outsider loans"
//         actions={
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="btn-gradient">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add Loan
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Add New Loan</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Borrower Type</Label>
//                   <Select 
//                     value={formData.borrowerType} 
//                     onValueChange={(v: 'member' | 'outsider') => setFormData({ ...formData, borrowerType: v, memberId: '', borrowerName: '' })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="member">Member (3% interest)</SelectItem>
//                       <SelectItem value="outsider">Outsider (5% interest)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {formData.borrowerType === 'member' ? (
//                   <div className="space-y-2">
//                     <Label>Select Member</Label>
//                     <Select 
//                       value={formData.memberId} 
//                       onValueChange={(v) => {
//                         const member = members.find(m => m.id === v);
//                         setFormData({ ...formData, memberId: v, borrowerName: member?.name || '' });
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select member" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {members.map(m => (
//                           <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <Label>Borrower Name</Label>
//                     <Input
//                       value={formData.borrowerName}
//                       onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
//                       placeholder="Enter borrower name"
//                     />
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <Label>Principal Amount (₹)</Label>
//                   <Input
//                     type="number"
//                     value={formData.principalAmount}
//                     onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
//                     placeholder="Enter amount"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Loan Date</Label>
//                   <Input
//                     type="date"
//                     value={formData.startDate}
//                     onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Notes</Label>
//                   <Textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                     placeholder="Optional notes about the loan"
//                   />
//                 </div>

//                 <div className="p-4 bg-muted rounded-lg space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-muted-foreground">Interest Rate</span>
//                     <span className="font-medium">{formData.borrowerType === 'member' ? '3%' : '5%'} per ₹1000/month</span>
//                   </div>
//                 </div>

//                 <Button type="submit" className="w-full btn-gradient">
//                   Add Loan
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard
//           title="Active Loans"
//           value={stats.activeCount}
//           icon={HandCoins}
//           variant="primary"
//         />
//         <StatCard
//           title="Outstanding Amount"
//           value={formatCurrency(stats.totalOutstanding)}
//           icon={AlertCircle}
//           variant="warning"
//         />
//         <StatCard
//           title="Pending Interest"
//           value={formatCurrency(stats.pendingInterest)}
//           icon={TrendingUp}
//           variant="accent"
//         />
//         <StatCard
//           title="Completed Loans"
//           value={stats.completedCount}
//           icon={CheckCircle}
//           variant="success"
//         />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by borrower name..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-full sm:w-[180px]">
//             <SelectValue placeholder="Filter by status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Loans</SelectItem>
//             <SelectItem value="active">Active</SelectItem>
//             <SelectItem value="completed">Completed</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Loans List */}
//       <div className="grid gap-4">
//         {filteredLoans.map((loan) => {
//           const details = getLoanDetails(loan);
//           return (
//             <Card key={loan.id} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-6">
//                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                   <div className="flex items-start gap-4">
//                     <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
//                       loan.borrowerType === 'member' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
//                     }`}>
//                       <HandCoins className="h-6 w-6" />
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <h3 className="font-semibold text-lg">{loan.borrowerName}</h3>
//                         <StatusBadge status={loan.borrowerType} />
//                         <StatusBadge status={loan.status as 'active' | 'completed'} />
//                       </div>
//                       <p className="text-sm text-muted-foreground mt-1">
//                         {loan.interestRate}% interest/₹1000/month • Started {formatDate(loan.startDate)} • {details.months} months
//                       </p>
//                       {loan.notes && (
//                         <p className="text-sm text-muted-foreground mt-1 italic">"{loan.notes}"</p>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-center lg:text-right">
//                     <div>
//                       <p className="text-sm text-muted-foreground">Principal</p>
//                       <p className="text-lg font-semibold">{formatCurrency(loan.principalAmount)}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Remaining</p>
//                       <p className="text-lg font-semibold text-warning">{formatCurrency(details.remainingPrincipal)}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Interest Due</p>
//                       <p className="text-lg font-semibold text-accent">{formatCurrency(details.pendingInterest)}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Total Due</p>
//                       <p className="text-lg font-semibold text-destructive">{formatCurrency(details.totalDue)}</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {filteredLoans.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">No loans found</p>
//         </div>
//       )}
//       </div>
//     </Layout>
//   );
// }
import { useState, useMemo } from 'react';
import { HandCoins, Search, Plus, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/ui/stat-card';
import { useData } from '@/context/DataContext';
import { formatDate, formatCurrency, calculateInterest } from '@/lib/data';
import { Loan } from '@/types';
import { toast } from 'sonner';

export default function Loans() {
  const { members, loans, addLoan, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerType: 'member' as 'member' | 'outsider',
    memberId: '',
    principalAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchesSearch = l.borrowerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  const stats = useMemo(() => {
    const active = loans.filter(l => l.status === 'active');
    const completed = loans.filter(l => l.status === 'completed');
    
    const totalOutstanding = active.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + Math.max(0, remaining);
    }, 0);
    
    const totalInterest = loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
    
    const pendingInterest = active.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + calculateInterest(remaining, loan.interestRate, loan.startDate);
    }, 0);

    return {
      activeCount: active.length,
      completedCount: completed.length,
      totalOutstanding,
      totalInterest,
      pendingInterest,
    };
  }, [loans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.borrowerName || !formData.principalAmount) {
      toast.error('Please fill in required fields');
      return;
    }

    const rate = formData.borrowerType === 'member' ? 3 : 5;
    
    addLoan({
      borrowerName: formData.borrowerName,
      borrowerType: formData.borrowerType,
      memberId: formData.borrowerType === 'member' ? formData.memberId : undefined,
      principalAmount: parseFloat(formData.principalAmount),
      interestRate: rate,
      startDate: formData.startDate,
      status: 'active',
      notes: formData.notes,
    });
    
    setFormData({
      borrowerName: '',
      borrowerType: 'member',
      memberId: '',
      principalAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const getLoanDetails = (loan: Loan) => {
    const remainingPrincipal = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
    const pendingInterest = calculateInterest(Math.max(0, remainingPrincipal), loan.interestRate, loan.startDate);
    const totalDue = Math.max(0, remainingPrincipal) + pendingInterest;
    
    const startDate = new Date(loan.startDate);
    const today = new Date();
    const timeDiff = today.getTime() - startDate.getTime();
    const days = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
    
    return { remainingPrincipal: Math.max(0, remainingPrincipal), pendingInterest, totalDue, days };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Loan Management"
        description="Manage member and outsider loans"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Borrower Type</Label>
                  <Select 
                    value={formData.borrowerType} 
                    onValueChange={(v: 'member' | 'outsider') => setFormData({ ...formData, borrowerType: v, memberId: '', borrowerName: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member (3% interest)</SelectItem>
                      <SelectItem value="outsider">Outsider (5% interest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.borrowerType === 'member' ? (
                  <div className="space-y-2">
                    <Label>Select Member</Label>
                    <Select 
                      value={formData.memberId} 
                      onValueChange={(v) => {
                        const member = members.find(m => m.id === v);
                        setFormData({ ...formData, memberId: v, borrowerName: member?.name || '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Borrower Name</Label>
                    <Input
                      value={formData.borrowerName}
                      onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                      placeholder="Enter borrower name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Principal Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Loan Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes about the loan"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">{formData.borrowerType === 'member' ? '3%' : '5%'} per ₹1000/month</span>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-gradient">
                  Add Loan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Loans"
          value={stats.activeCount}
          icon={HandCoins}
          variant="primary"
        />
        <StatCard
          title="Outstanding Amount"
          value={formatCurrency(stats.totalOutstanding)}
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Pending Interest"
          value={formatCurrency(stats.pendingInterest)}
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Completed Loans"
          value={stats.completedCount}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by borrower name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Loans</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loans List */}
      <div className="grid gap-4">
        {filteredLoans.map((loan) => {
          const details = getLoanDetails(loan);
          return (
            <Card key={loan.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      loan.borrowerType === 'member' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    }`}>
                      <HandCoins className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{loan.borrowerName}</h3>
                        <StatusBadge status={loan.borrowerType} />
                        <StatusBadge status={loan.status as 'active' | 'completed'} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {loan.interestRate}% interest/₹1000/month • Started {formatDate(loan.startDate)} • {details.days} days
                      </p>
                      {loan.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">"{loan.notes}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-center lg:text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="text-lg font-semibold">{formatCurrency(loan.principalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className="text-lg font-semibold text-warning">{formatCurrency(details.remainingPrincipal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Due</p>
                      <p className="text-lg font-semibold text-accent">{formatCurrency(details.pendingInterest)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Due</p>
                      <p className="text-lg font-semibold text-destructive">{formatCurrency(details.totalDue)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No loans found</p>
        </div>
      )}
    </Layout>
  );
}
