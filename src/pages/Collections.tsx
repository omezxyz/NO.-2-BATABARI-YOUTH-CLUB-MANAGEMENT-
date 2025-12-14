import { useState, useMemo } from 'react';
import { Receipt, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { useData } from '@/context/DataContext';
import { formatDate, formatCurrency, generateMonthsFromStart } from '@/lib/data';
import { MonthlyCollection } from '@/types';
import { toast } from 'sonner';
import { Wallet, Clock, CheckCircle } from 'lucide-react';

export default function Collections() {
  const { members, collections, addCollection, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const months = generateMonthsFromStart();
  const years = [...new Set(months.map(m => m.year))];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

  const [formData, setFormData] = useState({
    memberId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paidAt: new Date().toISOString().split('T')[0],
  });

  const filteredCollections = useMemo(() => {
    return collections.filter(c => {
      const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase());
      const matchesYear = yearFilter === 'all' || c.year === parseInt(yearFilter);
      const matchesMonth = monthFilter === 'all' || c.month === parseInt(monthFilter);
      return matchesSearch && matchesYear && matchesMonth;
    });
  }, [collections, search, yearFilter, monthFilter]);

  const stats = useMemo(() => {
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalExpected = members.length * months.length * 100;
    const pendingAmount = totalExpected - totalCollected;
    
    return {
      totalCollected,
      totalPayments: collections.length,
      pendingAmount: Math.max(0, pendingAmount),
    };
  }, [collections, members, months]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === formData.memberId);
    if (!member) {
      toast.error('Please select a member');
      return;
    }
    
    // Check if already paid
    const existing = collections.find(
      c => c.memberId === formData.memberId && 
           c.month === formData.month && 
           c.year === formData.year
    );
    
    if (existing) {
      toast.error('Payment already recorded for this month');
      return;
    }

    addCollection({
      memberId: formData.memberId,
      month: formData.month,
      year: formData.year,
      paidAt: formData.paidAt,
    });
    
    setIsDialogOpen(false);
  };

  const columns: Column<MonthlyCollection>[] = [
    { header: 'Member', accessor: 'memberName' },
    { 
      header: 'Month', 
      accessor: (row) => `${monthNames[row.month - 1]} ${row.year}` 
    },
    { 
      header: 'Amount', 
      accessor: (row) => formatCurrency(row.amount),
      className: 'text-right'
    },
    { 
      header: 'Paid Date', 
      accessor: (row) => formatDate(row.paidAt)
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
        title="Monthly Collections"
        description="Track and manage monthly member contributions (₹100/month)"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Receipt className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Monthly Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Member</Label>
                  <Select value={formData.memberId} onValueChange={(v) => setFormData({ ...formData, memberId: v })}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select 
                      value={String(formData.month)} 
                      onValueChange={(v) => setFormData({ ...formData, month: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((name, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select 
                      value={String(formData.year)} 
                      onValueChange={(v) => setFormData({ ...formData, year: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={formData.paidAt}
                    onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">₹100</p>
                </div>
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
          title="Total Collected"
          value={formatCurrency(stats.totalCollected)}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={CheckCircle}
          variant="primary"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthNames.map((name, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCollections}
        emptyMessage="No collections found"
      />
      </div>
    </Layout>
  );
}
