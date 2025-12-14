// import { useState } from 'react';
// import { UserPlus, Search, Phone, Mail, Calendar } from 'lucide-react';
// import { Layout } from '@/components/layout/Layout';
// import { PageHeader } from '@/components/ui/page-header';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { StatusBadge } from '@/components/ui/status-badge';
// import { useData } from '@/context/DataContext';
// import { formatDate, formatCurrency } from '@/lib/data';
// import { toast } from 'sonner';

// export default function Members() {
//   const { members, collections, loans, addMember, isLoading } = useData();
//   const [search, setSearch] = useState('');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     status: 'active' as 'active' | 'inactive',
//   });

//   const filteredMembers = members.filter(m =>
//     m.name.toLowerCase().includes(search.toLowerCase()) ||
//     m.phone.includes(search)
//   );

//   const getMemberStats = (memberId: string) => {
//     const memberCollections = collections.filter(c => c.memberId === memberId);
//     const memberLoans = loans.filter(l => l.memberId === memberId);

//     return {
//       totalPaid: memberCollections.reduce((sum, c) => sum + c.amount, 0),
//       pendingDues: 0, // Will be calculated from expected vs actual collections
//       activeLoans: memberLoans.filter(l => l.status === 'active').length,
//     };
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.name || !formData.phone) {
//       toast.error('Please fill in required fields');
//       return;
//     }
//     addMember(formData);
//     setFormData({
//       name: '',
//       phone: '',
//       email: '',
//       address: '',
//       status: 'active',
//     });
//     setIsDialogOpen(false);
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
//         title="Members"
//         description="Manage club members"
//         actions={
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="btn-gradient">
//                 <UserPlus className="mr-2 h-4 w-4" />
//                 Add Member
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add New Member</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="name">Name *</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     placeholder="Enter member name"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone *</Label>
//                   <Input
//                     id="phone"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     placeholder="Enter email address"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="address">Address</Label>
//                   <Input
//                     id="address"
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     placeholder="Enter address"
//                   />
//                 </div>
//                 <Button type="submit" className="w-full btn-gradient">
//                   Add Member
//                 </Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//         }
//       />

//       {/* Search */}
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           placeholder="Search members by name or phone..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-10"
//         />
//       </div>

//       {/* Members Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredMembers.map((member) => {
//           const stats = getMemberStats(member.id);
//           return (
//             <Card key={member.id} className="hover:shadow-lg transition-shadow">
//               <CardHeader className="pb-2">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <CardTitle className="text-lg">{member.name}</CardTitle>
//                     <StatusBadge status={member.status === 'active' ? 'active' : 'pending'} className="mt-1" />
//                   </div>
//                   <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <span className="text-primary font-semibold">
//                       {member.name.charAt(0)}
//                     </span>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <Phone className="h-4 w-4" />
//                     <span>{member.phone || 'No phone'}</span>
//                   </div>
//                   {member.email && (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <Mail className="h-4 w-4" />
//                       <span>{member.email}</span>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <Calendar className="h-4 w-4" />
//                     <span>Joined {formatDate(member.createdAt)}</span>
//                   </div>
                  
//                   <div className="pt-3 border-t mt-3">
//                     <div className="grid grid-cols-3 gap-2 text-center">
//                       <div>
//                         <p className="text-lg font-semibold text-success">{formatCurrency(stats.totalPaid)}</p>
//                         <p className="text-xs text-muted-foreground">Paid</p>
//                       </div>
//                       <div>
//                         <p className="text-lg font-semibold text-destructive">{formatCurrency(stats.pendingDues)}</p>
//                         <p className="text-xs text-muted-foreground">Pending</p>
//                       </div>
//                       <div>
//                         <p className="text-lg font-semibold text-primary">{stats.activeLoans}</p>
//                         <p className="text-xs text-muted-foreground">Loans</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {filteredMembers.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-muted-foreground">No members found</p>
//         </div>
//       )}
//       </div>
//     </Layout>
//   );
// }
import { useState } from 'react';
import { UserPlus, Search, Phone, Mail, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { useData } from '@/context/DataContext';
import { formatDate, formatCurrency } from '@/lib/data';
import { toast } from 'sonner';

export default function Members() {
  const { members, collections, loans, addMember, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  const getMemberStats = (memberId: string, memberCreatedAt: string) => {
    const memberCollections = collections.filter(c => c.memberId === memberId);
    const memberLoans = loans.filter(l => l.memberId === memberId && l.status === 'active');

    // Calculate monthly pending: months since joining * 100 - total collected
    const joinDate = new Date(memberCreatedAt);
    const now = new Date();
    const monthsSinceJoining = 
      (now.getFullYear() - joinDate.getFullYear()) * 12 + 
      (now.getMonth() - joinDate.getMonth()) + 1; // +1 to include current month
    
    const expectedCollections = Math.max(0, monthsSinceJoining) * 100;
    const totalCollected = memberCollections.reduce((sum, c) => sum + c.amount, 0);
    const monthlyPending = Math.max(0, expectedCollections - totalCollected);

    // Calculate loan pending with interest till date (day-wise calculation)
    const loanPending = memberLoans.reduce((sum, loan) => {
      const principal = loan.principalAmount;
      const totalPaid = loan.totalPaid;
      const interestRate = loan.interestRate; // Rate per ₹1000 per month
      const startDate = new Date(loan.startDate);
      
      // Calculate days since loan started
      const timeDiff = now.getTime() - startDate.getTime();
      const daysElapsed = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
      
      // Daily interest: (Principal × Rate × Days) / (100 × 30)
      // Rate is per month, so divide by 30 to get daily rate
      const accruedInterest = (principal * interestRate * daysElapsed) / (100 * 30);
      const totalDue = principal + accruedInterest;
      const remaining = Math.max(0, totalDue - totalPaid);
      
      return sum + remaining;
    }, 0);

    return {
      totalPaid: totalCollected,
      monthlyPending,
      loanPending,
      activeLoans: memberLoans.length,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in required fields');
      return;
    }
    addMember(formData);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'active',
    });
    setIsDialogOpen(false);
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
        title="Members"
        description="Manage club members"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter member name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <Button type="submit" className="w-full btn-gradient">
                  Add Member
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const stats = getMemberStats(member.id, member.createdAt);
          return (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <StatusBadge status={member.status === 'active' ? 'active' : 'pending'} className="mt-1" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone || 'No phone'}</span>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(member.createdAt)}</span>
                  </div>
                  
                  <div className="pt-3 border-t mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-success/10 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-success">{formatCurrency(stats.totalPaid)}</p>
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-primary">{stats.activeLoans}</p>
                        <p className="text-xs text-muted-foreground">Active Loans</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-warning/10 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-warning">{formatCurrency(stats.monthlyPending)}</p>
                        <p className="text-xs text-muted-foreground">Monthly Pending</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg p-2 text-center">
                        <p className="text-lg font-semibold text-destructive">{formatCurrency(stats.loanPending)}</p>
                        <p className="text-xs text-muted-foreground">Loan + Interest</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No members found</p>
        </div>
      )}
    </Layout>
  );
}
