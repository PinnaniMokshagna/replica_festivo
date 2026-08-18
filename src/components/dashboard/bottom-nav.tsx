import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, MessageSquare, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'Dashboard', path: '/vendor-dashboard', icon: Home },
  { label: 'Bookings', path: '/vendor-dashboard/bookings', icon: CalendarCheck },
  { label: 'Messages', path: '/vendor-dashboard/messages', icon: MessageSquare },
  { label: 'Earnings', path: '/vendor-dashboard/earnings', icon: Wallet },
  { label: 'Profile', path: '/vendor-dashboard/settings', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-premium backdrop-blur-md lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive && 'fill-primary/10')} />
                {item.label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
