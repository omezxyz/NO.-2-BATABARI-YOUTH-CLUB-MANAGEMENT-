import { useMemo, useState } from 'react';
import { FileText, TrendingUp, Wallet, HandCoins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateInterest } from '@/lib/data';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

export default function Reports() {
  const { members, collections, loans, isLoading } = useData();
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));

  const years = [...new Set(collections.map(c => c.year))].sort((a, b) => b - a);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyCollectionData = useMemo(() => {
    const data = monthNames.map((name, i) => ({
      name,
      month: i + 1,
      collected: 0,
    }));

    const year = parseInt(yearFilter);
    const yearCollections = collections.filter(c => c.year === year);
    
    yearCollections.forEach(c => {
      const monthIndex = c.month - 1;
      data[monthIndex].collected += c.amount;
    });

    return data;
  }, [collections, yearFilter]);

  const loanDistribution = useMemo(() => {
    const memberLoans = loans.filter(l => l.borrowerType === 'member');
    const outsiderLoans = loans.filter(l => l.borrowerType === 'outsider');
    
    return [
      { name: 'Member Loans', value: memberLoans.reduce((sum, l) => sum + l.principalAmount, 0), count: memberLoans.length },
      { name: 'Outsider Loans', value: outsiderLoans.reduce((sum, l) => sum + l.principalAmount, 0), count: outsiderLoans.length },
    ];
  }, [loans]);

  const financialSummary = useMemo(() => {
    const totalCollection = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalInterest = loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
    
    const activeLoans = loans.filter(l => l.status === 'active');
    const totalOutstanding = activeLoans.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + Math.max(0, remaining);
    }, 0);
    
    const pendingInterest = activeLoans.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + calculateInterest(remaining, loan.interestRate, loan.startDate);
    }, 0);

    return {
      totalCollection,
      totalInterest,
      totalOutstanding,
      pendingInterest,
      netBalance: totalCollection + totalInterest - totalOutstanding,
    };
  }, [collections, loans]);

  const memberCollectionData = useMemo(() => {
    return members.map(member => {
      const memberCollections = collections.filter(c => c.memberId === member.id);
      const paid = memberCollections.reduce((sum, c) => sum + c.amount, 0);
      
      return {
        name: member.name.split(' ')[0],
        paid,
      };
    }).slice(0, 10);
  }, [members, collections]);

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
      <PageHeader title="Reports & Analytics" description="Financial insights and statistics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collection</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalCollection)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalInterest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/20 flex items-center justify-center">
                <HandCoins className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.netBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Collection Report</CardTitle>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.length > 0 ? years.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  )) : <SelectItem value={String(new Date().getFullYear())}>{new Date().getFullYear()}</SelectItem>}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="collected" name="Collected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Loan Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={loanDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {loanDistribution.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Loan Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {loanDistribution.map((item, index) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">{item.count} loans</span>
                      </div>
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-bold">{formatCurrency(item.value)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending Interest</span>
                      <span className="font-semibold text-accent">{formatCurrency(financialSummary.pendingInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Outstanding</span>
                      <span className="font-semibold text-warning">{formatCurrency(financialSummary.totalOutstanding)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Member-wise Collection</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberCollectionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="paid" name="Paid" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}
