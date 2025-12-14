import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  PiggyBank,
  UserPlus,
  Receipt,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { formatCurrency, calculateInterest } from '@/lib/data';

export default function Dashboard() {
  const navigate = useNavigate();
  const { members, collections, loans, loanPayments, isLoading } = useData();

  const stats = useMemo(() => {
    const totalMembers = members.filter(m => m.status === 'active').length;
    
    const totalMonthlyCollection = collections.reduce((sum, c) => sum + c.amount, 0);
    
    const activeLoans = loans.filter(l => l.status === 'active');
    const totalOutstandingLoans = activeLoans.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + Math.max(0, remaining);
    }, 0);
    
    const totalInterestEarned = loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
    
    // Calculate pending interest from active loans
    const pendingInterest = activeLoans.reduce((sum, loan) => {
      const remaining = loan.principalAmount - (loan.totalPaid - loan.totalInterestPaid);
      return sum + calculateInterest(remaining, loan.interestRate, loan.startDate);
    }, 0);
    
    const totalClubBalance = totalMonthlyCollection + totalInterestEarned - totalOutstandingLoans;

    return {
      totalMembers,
      totalMonthlyCollection,
      totalOutstandingLoans,
      totalInterestEarned,
      totalClubBalance,
      activeLoans: activeLoans.length,
      pendingInterest,
    };
  }, [members, collections, loans]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months: Record<string, { name: string; collections: number; loans: number }> = {};
    
    collections.forEach(c => {
      const key = `${c.year}-${String(c.month).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (!months[key]) {
        months[key] = { name: `${monthNames[c.month - 1]} ${c.year}`, collections: 0, loans: 0 };
      }
      months[key].collections += c.amount;
    });
    
    loanPayments.forEach(p => {
      const date = new Date(p.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].loans += p.interestPaid;
      }
    });
    
    return Object.values(months).slice(-12);
  }, [collections, loanPayments]);

  const quickActions = [
    { label: 'Add Member', icon: UserPlus, onClick: () => navigate('/members'), color: 'primary' },
    { label: 'Add Collection', icon: Receipt, onClick: () => navigate('/collections'), color: 'success' },
    { label: 'Add Loan', icon: HandCoins, onClick: () => navigate('/loans'), color: 'warning' },
    { label: 'Add Payment', icon: CreditCard, onClick: () => navigate('/payments'), color: 'accent' },
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
        title="Dashboard"
        description="Welcome to No. 2 Batabari Youth Club Management"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          variant="primary"
          subtitle="Active members"
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(stats.totalMonthlyCollection)}
          icon={Wallet}
          variant="success"
          subtitle="Total collected"
        />
        <StatCard
          title="Outstanding Loans"
          value={formatCurrency(stats.totalOutstandingLoans)}
          icon={HandCoins}
          variant="warning"
          subtitle={`${stats.activeLoans} active loans`}
        />
        <StatCard
          title="Interest Earned"
          value={formatCurrency(stats.totalInterestEarned)}
          icon={TrendingUp}
          variant="accent"
          subtitle="From all loans"
        />
        <StatCard
          title="Club Balance"
          value={formatCurrency(stats.totalClubBalance)}
          icon={PiggyBank}
          variant="primary"
          subtitle="Net balance"
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                onClick={action.onClick}
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-sm text-black hover:text-red-700 font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Monthly Collection Trend</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collections" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorCollections)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Interest Earned</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="loans" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loans.slice(0, 5).map((loan) => (
              <div 
                key={loan.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/loans`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    loan.borrowerType === 'member' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                  }`}>
                    <HandCoins className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{loan.borrowerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {loan.borrowerType === 'member' ? 'Member' : 'Outsider'} • {loan.interestRate}% interest
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(loan.principalAmount)}</p>
                  <p className={`text-sm ${loan.status === 'active' ? 'text-warning' : 'text-success'}`}>
                    {loan.status === 'active' ? 'Active' : 'Completed'}
                  </p>
                </div>
              </div>
            ))}
            {loans.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No loans yet</p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
