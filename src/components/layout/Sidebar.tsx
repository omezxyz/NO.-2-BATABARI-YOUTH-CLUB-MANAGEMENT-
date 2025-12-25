import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  Building2,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/collections', icon: Wallet, label: 'Collections' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className={cn(
        "fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[90%] px-2 lg:hidden transition-all duration-300",
        isOpen && "opacity-0 pointer-events-none -translate-y-4"
      )}>
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background/70 backdrop-blur-xl border border-border/50 shadow-xl">
          <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow">
          <img src="logo.png" alt="" />
        </div>
            <span className="text-sm font-bold text-foreground">No 2 Batabari</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-8 h-8 flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-foreground rounded-full transition-all duration-300 ease-out" />
            <span className="block h-0.5 w-5 bg-foreground rounded-full transition-all duration-300 ease-out" />
            <span className="block h-0.5 w-5 bg-foreground rounded-full transition-all duration-300 ease-out" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-full lg:w-64 bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow">
              <img src="logo.png" alt="" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">No. 2 Batabari</h1>
                <p className="text-xs text-sidebar-foreground/60">Youth Club</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-6 border-t border-sidebar-border space-y-1">
            <NavLink
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
            
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
