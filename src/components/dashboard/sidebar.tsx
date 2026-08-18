import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Images,
  Package,
  Star,
  Wallet,
  BarChart3,
  Tag,
  Settings,
  LifeBuoy,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { navItems } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useAuth as useMainAuth } from '@/lib/auth';
import { useData } from '@/context/DataContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  Images,
  Package,
  Star,
  Wallet,
  BarChart3,
  Tag,
  Settings,
  LifeBuoy,
};

const routeMap: Record<string, string> = {
  Dashboard: '/vendor-dashboard',
  'Verify Documents': '/vendor-dashboard/verify-documents',
  Bookings: '/vendor-dashboard/bookings',
  Calendar: '/vendor-dashboard/calendar',
  Messages: '/vendor-dashboard/messages',
  Portfolio: '/vendor-dashboard/portfolio',
  Packages: '/vendor-dashboard/packages',
  Reviews: '/vendor-dashboard/reviews',
  Earnings: '/vendor-dashboard/earnings',
  Analytics: '/vendor-dashboard/analytics',
  Deals: '/vendor-dashboard/deals',
  Settings: '/vendor-dashboard/settings',
  Support: '/vendor-dashboard/support',
};

// Gated menu items that require KYC verification
const gatedItems = ['Bookings', 'Packages', 'Earnings', 'Deals', 'Messages', 'Analytics'];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout, kycStatus, setAuthModalOpen } = useAuth();
  const { signOut: signOutMain } = useMainAuth();
  const { bookings, conversations } = useData();

  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread ? 1 : 0), 0);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-dark-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed z-40 flex h-full w-[280px] flex-col border-r border-white/40 bg-card/85 backdrop-blur-xl shadow-premium transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between px-6">
          <button
            onClick={async () => {
              logout();
              await signOutMain();
              navigate('/auth?role=vendor');
            }}
            className="flex items-center gap-2.5 text-left group hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sage group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-900">Festivo</h1>
              <p className="text-[11px] font-medium text-muted-foreground">Vendor Studio</p>
            </div>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 py-2">
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard;
              const path = routeMap[item.label] ?? '/';

              const isLocked = kycStatus !== 'verified' && gatedItems.includes(item.label);

              let badgeText: string | number | null = null;
              if (item.label === 'Bookings' && pendingBookingsCount > 0) badgeText = pendingBookingsCount;
              if (item.label === 'Messages' && unreadMessagesCount > 0) badgeText = unreadMessagesCount;

              if (item.label === 'Verify Documents') {
                if (kycStatus === 'verified') badgeText = '✓';
                else if (kycStatus === 'pending') badgeText = 'Review';
                else badgeText = '!';
              }

              return (
                <li key={item.label}>
                  <NavLink
                    to={path}
                    end={path === '/vendor-dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-white font-bold'
                          : isLocked
                          ? 'text-dark-400 hover:bg-muted/50'
                          : 'text-dark-700 hover:bg-muted hover:text-dark-900',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl bg-gradient-brand shadow-sm"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <Icon
                          className={cn(
                            'relative z-10 h-[18px] w-[18px] shrink-0',
                            isActive ? 'text-white' : 'text-dark-700 group-hover:text-dark-900',
                          )}
                        />
                        <span className="relative z-10 flex-1">{item.label}</span>

                        {/* Lock icon for gated items */}
                        {isLocked && !isActive && (
                          <Lock className="relative z-10 h-3.5 w-3.5 text-gold-600" />
                        )}

                        {/* Badges */}
                        {badgeText !== null && (
                          <span
                            className={cn(
                              'relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold',
                              isActive
                                ? 'bg-white text-sage-800'
                                : item.label === 'Verify Documents' && kycStatus === 'verified'
                                ? 'bg-sage-100 text-sage-800'
                                : item.label === 'Verify Documents' && kycStatus === 'pending'
                                ? 'bg-gold-100 text-gold-800'
                                : item.label === 'Verify Documents' && kycStatus === 'unverified'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-sage-100 text-sage-800',
                            )}
                          >
                            {badgeText}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Auth / Logout */}
        <div className="border-t border-border p-4 space-y-1">
          <button
            onClick={() => {
              setAuthModalOpen(true);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-dark-700 transition-colors hover:bg-muted"
          >
            <Settings className="h-[18px] w-[18px] text-muted-foreground" />
            Account & Auth
          </button>
          <button
            onClick={async () => {
              logout();
              await signOutMain();
              navigate('/');
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
}
