import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Building2, Bell, Shield, Database, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '@/lib/data';

export default function Settings() {
  const [exporting, setExporting] = useState(false);
  const [backing, setBacking] = useState(false);

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all data
      const [membersRes, collectionsRes, loansRes, paymentsRes] = await Promise.all([
        supabase.from('members').select('*').order('name'),
        supabase.from('monthly_collections').select('*, members(name)').order('year', { ascending: false }),
        supabase.from('loans').select('*').order('created_at', { ascending: false }),
        supabase.from('loan_payments').select('*').order('payment_date', { ascending: false }),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (loansRes.error) throw loansRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      // Export Members
      const membersCSV = [
        'Name,Phone,Email,Address,Status,Created At',
        ...membersRes.data.map(m => 
          `"${m.name}","${m.phone || ''}","${m.email || ''}","${m.address || ''}","${m.status}","${formatDate(m.created_at)}"`
        )
      ].join('\n');
      downloadCSV('members.csv', membersCSV);

      // Export Collections
      const collectionsCSV = [
        'Member Name,Month,Year,Amount,Paid At',
        ...collectionsRes.data.map(c => 
          `"${c.members?.name || 'Unknown'}","${c.month}","${c.year}","${c.amount}","${formatDate(c.paid_at)}"`
        )
      ].join('\n');
      downloadCSV('collections.csv', collectionsCSV);

      // Export Loans
      const loansCSV = [
        'Borrower Name,Type,Principal,Interest Rate,Start Date,Status,Total Paid,Interest Paid,Notes',
        ...loansRes.data.map(l => 
          `"${l.borrower_name}","${l.borrower_type}","${l.principal_amount}","${l.interest_rate}%","${formatDate(l.start_date)}","${l.status}","${l.total_paid}","${l.total_interest_paid}","${l.notes || ''}"`
        )
      ].join('\n');
      downloadCSV('loans.csv', loansCSV);

      // Export Loan Payments
      const paymentsCSV = [
        'Loan ID,Amount,Principal Paid,Interest Paid,Payment Date,Notes',
        ...paymentsRes.data.map(p => 
          `"${p.loan_id}","${p.amount}","${p.principal_paid}","${p.interest_paid}","${formatDate(p.payment_date)}","${p.notes || ''}"`
        )
      ].join('\n');
      downloadCSV('loan_payments.csv', paymentsCSV);

      toast.success('All data exported successfully!');
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleBackup = async () => {
    setBacking(true);
    try {
      // Fetch all data
      const [membersRes, collectionsRes, loansRes, paymentsRes] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('monthly_collections').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('loan_payments').select('*'),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (loansRes.error) throw loansRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      const backupData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          members: membersRes.data,
          collections: collectionsRes.data,
          loans: loansRes.data,
          loanPayments: paymentsRes.data,
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `youth-club-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('Backup created successfully!');
    } catch (error: any) {
      toast.error('Backup failed: ' + error.message);
    } finally {
      setBacking(false);
    }
  };

  return (
    <Layout>
      <div className="my-6">
      <PageHeader
        title="Settings"
        description="Manage your club settings"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Club Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Club Information</CardTitle>
            </div>
            <CardDescription>Basic information about your club</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Club Name</Label>
              <Input defaultValue="No. 2 Batabari Youth Club" />
            </div>
            <div className="space-y-2">
              <Label>Monthly Contribution</Label>
              <Input type="number" defaultValue="100" disabled />
              <p className="text-xs text-muted-foreground">Fixed at ₹100 per member per month</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Member Interest Rate</Label>
                <Input type="number" defaultValue="3" disabled />
                <p className="text-xs text-muted-foreground">3% per ₹1000/month</p>
              </div>
              <div className="space-y-2">
                <Label>Outsider Interest Rate</Label>
                <Input type="number" defaultValue="5" disabled />
                <p className="text-xs text-muted-foreground">5% per ₹1000/month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">Send reminders for pending payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Loan Due Alerts</p>
                <p className="text-sm text-muted-foreground">Alert when loan payments are due</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Reports</p>
                <p className="text-sm text-muted-foreground">Receive monthly summary reports</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Export and backup your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download all data as CSV</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup</p>
                <p className="text-sm text-muted-foreground">Create a full backup</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBackup} disabled={backing}>
                {backing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>About</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>No. 2 Batabari Youth Club</strong></p>
              <p>Collection Management System v1.0</p>
              <p>Collections started from January 2023</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}
