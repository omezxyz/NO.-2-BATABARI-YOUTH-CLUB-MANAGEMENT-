// import { useState, useMemo } from 'react';
// import { Search, Plus } from 'lucide-react';
// import { Layout } from '@/components/layout/Layout';
// import { PageHeader } from '@/components/ui/page-header';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { DataTable, Column } from '@/components/ui/data-table';
// import { StatCard } from '@/components/ui/stat-card';
// import { useData } from '@/context/DataContext';
// import { formatDate, formatCurrency, calculateInterest } from '@/lib/data';
// import { toast } from 'sonner';
// import { Wallet, TrendingUp, Receipt } from 'lucide-react';

// export default function Payments() {
//   const { loans, loanPayments, addLoanPayment, isLoading } = useData();
//   const [search, setSearch] = useState('');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
  
//   const activeLoans = loans.filter(l => l.status === 'active');

//   const [formData, setFormData] = useState({
//     loanId: '',
//     amount: '',
//     paymentDate: new Date().toISOString().split('T')[0],
//     notes: '',
//   });

//   const selectedLoan = useMemo(() => {
//     return loans.find(l => l.id === formData.loanId);
//   }, [formData.loanId, loans]);

//   const paymentBreakdown = useMemo(() => {
//     if (!selectedLoan || !formData.amount) return null;
    
//     const amount = parseFloat(formData.amount);
//     const remainingPrincipal = selectedLoan.principalAmount - (selectedLoan.totalPaid - selectedLoan.totalInterestPaid);
//     const pendingInterest = calculateInterest(remainingPrincipal, selectedLoan.interestRate, selectedLoan.startDate, formData.paymentDate);
    
//     // Interest is paid first, then principal
//     const interestPaid = Math.min(amount, pendingInterest);
//     const principalPaid = amount - interestPaid;
    
//     return {
//       interestPaid,
//       principalPaid,
//       newRemainingPrincipal: Math.max(0, remainingPrincipal - principalPaid),
//     };
//   }, [selectedLoan, formData.amount, formData.paymentDate]);

//   const paymentsWithLoanInfo = useMemo(() => {
//     return loanPayments.map(p => {
//       const loan = loans.find(l => l.id === p.loanId);
//       return {
//         ...p,
//         borrowerName: loan?.borrowerName || 'Unknown',
//       };
//     });
//   }, [loanPayments, loans]);

//   const filteredPayments = useMemo(() => {
//     return paymentsWithLoanInfo.filter(p =>
//       p.borrowerName.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [paymentsWithLoanInfo, search]);

//   const stats = useMemo(() => {
//     const totalPayments = loanPayments.reduce((sum, p) => sum + p.amount, 0);
//     const totalPrincipalPaid = loanPayments.reduce((sum, p) => sum + p.principalPaid, 0);
//     const totalInterestPaid = loanPayments.reduce((sum, p) => sum + p.interestPaid, 0);
    
//     return { totalPayments, totalPrincipalPaid, totalInterestPaid };
//   }, [loanPayments]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.loanId || !formData.amount || !paymentBreakdown) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     addLoanPayment({
//       loanId: formData.loanId,
//       amount: parseFloat(formData.amount),
//       paymentDate: formData.paymentDate,
//       principalPaid: paymentBreakdown.principalPaid,
//       interestPaid: paymentBreakdown.interestPaid,
//       notes: formData.notes,
//     });
    
//     setFormData({
//       loanId: '',
//       amount: '',
//       paymentDate: new Date().toISOString().split('T')[0],
//       notes: '',
//     });
//     setIsDialogOpen(false);
//   };

//   const columns: Column<typeof paymentsWithLoanInfo[0]>[] = [
//     { header: 'Borrower', accessor: 'borrowerName' },
//     { 
//       header: 'Date', 
//       accessor: (row) => formatDate(row.paymentDate) 
//     },
//     { 
//       header: 'Amount', 
//       accessor: (row) => formatCurrency(row.amount),
//       className: 'text-right font-medium'
//     },
//     { 
//       header: 'Principal', 
//       accessor: (row) => formatCurrency(row.principalPaid),
//       className: 'text-right'
//     },
//     { 
//       header: 'Interest', 
//       accessor: (row) => formatCurrency(row.interestPaid),
//       className: 'text-right text-accent'
//     },
//     { 
//       header: 'Notes', 
//       accessor: (row) => row.notes || '-',
//       className: 'text-muted-foreground'
//     },
//   ];

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
//         title="Loan Payments"
//         description="Track and record loan repayments"
//         actions={
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="btn-gradient">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Record Payment
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Record Loan Payment</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Select Loan</Label>
//                   <Select value={formData.loanId} onValueChange={(v) => setFormData({ ...formData, loanId: v })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select active loan" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {activeLoans.map(l => (
//                         <SelectItem key={l.id} value={l.id}>
//                           {l.borrowerName} - {formatCurrency(l.principalAmount)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {selectedLoan && (
//                   <Card className="bg-muted/50">
//                     <CardContent className="p-4 space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Principal Amount</span>
//                         <span className="font-medium">{formatCurrency(selectedLoan.principalAmount)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Total Paid</span>
//                         <span className="font-medium text-success">{formatCurrency(selectedLoan.totalPaid)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Remaining Principal</span>
//                         <span className="font-medium text-warning">
//                           {formatCurrency(selectedLoan.principalAmount - (selectedLoan.totalPaid - selectedLoan.totalInterestPaid))}
//                         </span>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <div className="space-y-2">
//                   <Label>Payment Amount (₹)</Label>
//                   <Input
//                     type="number"
//                     value={formData.amount}
//                     onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                     placeholder="Enter payment amount"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Payment Date</Label>
//                   <Input
//                     type="date"
//                     value={formData.paymentDate}
//                     onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Notes</Label>
//                   <Textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                     placeholder="Optional notes"
//                   />
//                 </div>

//                 {paymentBreakdown && (
//                   <Card className="bg-primary/5 border-primary/20">
//                     <CardContent className="p-4 space-y-2 text-sm">
//                       <p className="font-medium text-primary">Payment Breakdown</p>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Interest Payment</span>
//                         <span className="font-medium text-accent">{formatCurrency(paymentBreakdown.interestPaid)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Principal Payment</span>
//                         <span className="font-medium">{formatCurrency(paymentBreakdown.principalPaid)}</span>
//                       </div>
//                       <div className="flex justify-between pt-2 border-t">
//                         <span className="text-muted-foreground">New Remaining Principal</span>
//                         <span className="font-medium text-warning">{formatCurrency(paymentBreakdown.newRemainingPrincipal)}</span>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <Button type="submit" className="w-full btn-gradient">
//                   Record Payment
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//         <StatCard
//           title="Total Payments"
//           value={formatCurrency(stats.totalPayments)}
//           icon={Wallet}
//           variant="primary"
//         />
//         <StatCard
//           title="Principal Collected"
//           value={formatCurrency(stats.totalPrincipalPaid)}
//           icon={Receipt}
//           variant="success"
//         />
//         <StatCard
//           title="Interest Collected"
//           value={formatCurrency(stats.totalInterestPaid)}
//           icon={TrendingUp}
//           variant="accent"
//         />
//       </div>

//       {/* Search */}
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Search by borrower name..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-10"
//         />
//       </div>

//       {/* Payments Table */}
//       <DataTable
//         columns={columns}
//         data={filteredPayments}
//         emptyMessage="No payments recorded yet"
//       />
//       </div>
//     </Layout>
//   );
// }
import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { useData } from '@/context/DataContext';
import { formatDate, formatCurrency, calculateInterest } from '@/lib/data';
import { toast } from 'sonner';
import { Wallet, TrendingUp, Receipt } from 'lucide-react';

export default function Payments() {
  const { loans, loanPayments, addLoanPayment, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const activeLoans = loans.filter(l => l.status === 'active');

  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const selectedLoan = useMemo(() => {
    return loans.find(l => l.id === formData.loanId);
  }, [formData.loanId, loans]);

  const paymentBreakdown = useMemo(() => {
    if (!selectedLoan || !formData.amount) return null;
    
    const amount = parseFloat(formData.amount);
    const remainingPrincipal = selectedLoan.principalAmount - (selectedLoan.totalPaid - selectedLoan.totalInterestPaid);
    const pendingInterest = calculateInterest(remainingPrincipal, selectedLoan.interestRate, selectedLoan.startDate, formData.paymentDate);
    
    // Interest is paid first, then principal
    const interestPaid = Math.min(amount, pendingInterest);
    const principalPaid = amount - interestPaid;
    
    return {
      interestPaid,
      principalPaid,
      newRemainingPrincipal: Math.max(0, remainingPrincipal - principalPaid),
    };
  }, [selectedLoan, formData.amount, formData.paymentDate]);

  const paymentsWithLoanInfo = useMemo(() => {
    return loanPayments.map(p => {
      const loan = loans.find(l => l.id === p.loanId);
      return {
        ...p,
        borrowerName: loan?.borrowerName || 'Unknown',
      };
    });
  }, [loanPayments, loans]);

  const filteredPayments = useMemo(() => {
    return paymentsWithLoanInfo.filter(p =>
      p.borrowerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [paymentsWithLoanInfo, search]);

  const stats = useMemo(() => {
    const totalPayments = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPrincipalPaid = loanPayments.reduce((sum, p) => sum + p.principalPaid, 0);
    const totalInterestPaid = loanPayments.reduce((sum, p) => sum + p.interestPaid, 0);
    
    return { totalPayments, totalPrincipalPaid, totalInterestPaid };
  }, [loanPayments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loanId || !formData.amount || !paymentBreakdown) {
      toast.error('Please fill in all required fields');
      return;
    }

    addLoanPayment({
      loanId: formData.loanId,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      principalPaid: paymentBreakdown.principalPaid,
      interestPaid: paymentBreakdown.interestPaid,
      notes: formData.notes,
    });
    
    setFormData({
      loanId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsDialogOpen(false);
  };

  const columns: Column<typeof paymentsWithLoanInfo[0]>[] = [
    { header: 'Borrower', accessor: 'borrowerName' },
    { 
      header: 'Date', 
      accessor: (row) => formatDate(row.paymentDate) 
    },
    { 
      header: 'Amount', 
      accessor: (row) => formatCurrency(row.amount),
      className: 'text-right font-medium'
    },
    { 
      header: 'Principal', 
      accessor: (row) => formatCurrency(row.principalPaid),
      className: 'text-right'
    },
    { 
      header: 'Interest', 
      accessor: (row) => formatCurrency(row.interestPaid),
      className: 'text-right text-accent'
    },
    { 
      header: 'Notes', 
      accessor: (row) => row.notes || '-',
      className: 'text-muted-foreground'
    },
  ];

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
       <div className="my-6">
      <PageHeader
        title="Loan Payments"
        description="Track and record loan repayments"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Loan Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Loan</Label>
                  <Select value={formData.loanId} onValueChange={(v) => setFormData({ ...formData, loanId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select active loan" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLoans.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.borrowerName} - {formatCurrency(l.principalAmount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLoan && (() => {
                  const remainingPrincipal = selectedLoan.principalAmount - (selectedLoan.totalPaid - selectedLoan.totalInterestPaid);
                  const pendingInterest = calculateInterest(remainingPrincipal, selectedLoan.interestRate, selectedLoan.startDate, formData.paymentDate);
                  const totalDue = Math.max(0, remainingPrincipal) + pendingInterest;
                  
                  return (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Principal Amount</span>
                          <span className="font-medium">{formatCurrency(selectedLoan.principalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Paid</span>
                          <span className="font-medium text-success">{formatCurrency(selectedLoan.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining Principal</span>
                          <span className="font-medium text-warning">{formatCurrency(Math.max(0, remainingPrincipal))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Interest</span>
                          <span className="font-medium text-accent">{formatCurrency(pendingInterest)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="font-medium">Total Amount Due</span>
                          <span className="font-bold text-destructive">{formatCurrency(totalDue)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                <div className="space-y-2">
                  <Label>Payment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter payment amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>

                {paymentBreakdown && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 space-y-2 text-sm">
                      <p className="font-medium text-primary">Payment Breakdown</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Payment</span>
                        <span className="font-medium text-accent">{formatCurrency(paymentBreakdown.interestPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal Payment</span>
                        <span className="font-medium">{formatCurrency(paymentBreakdown.principalPaid)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">New Remaining Principal</span>
                        <span className="font-medium text-warning">{formatCurrency(paymentBreakdown.newRemainingPrincipal)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button type="submit" className="w-full btn-gradient">
                  Record Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Payments"
          value={formatCurrency(stats.totalPayments)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Principal Collected"
          value={formatCurrency(stats.totalPrincipalPaid)}
          icon={Receipt}
          variant="success"
        />
        <StatCard
          title="Interest Collected"
          value={formatCurrency(stats.totalInterestPaid)}
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by borrower name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        emptyMessage="No payments recorded yet"
      />
      </div>
    </Layout>
  );
}
