import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, CreditCard, CalendarCheck, Star, Package, Check, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const typeConfig = {
  payment: { icon: CreditCard, bg: 'bg-sage-100', color: 'text-sage-700' },
  booking: { icon: CalendarCheck, bg: 'bg-gold-100', color: 'text-gold-700' },
  review: { icon: Star, bg: 'bg-gold-100', color: 'text-gold-700' },
  package: { icon: Package, bg: 'bg-dark-100', color: 'text-dark-700' },
  system: { icon: BellRing, bg: 'bg-sage-100', color: 'text-sage-700' },
};

const filters = ['All', 'Unread', 'Payments', 'Bookings', 'Reviews'];

export function NotificationsPage() {
  const { notificationsList, markNotificationRead, markAllNotificationsRead, clearNotifications } = useData();

  const [filter, setFilter] = useState('All');

  const filtered = notificationsList.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return n.unread;
    if (filter === 'Payments') return n.type === 'payment';
    if (filter === 'Bookings') return n.type === 'booking';
    if (filter === 'Reviews') return n.type === 'review';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Center" subtitle="Real-time activity alerts, booking updates, and review notifications" icon={BellRing} />

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                filter === f
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 rounded-xl border border-sage-200 bg-sage-50 px-3.5 py-2 text-xs font-semibold text-sage-800 hover:bg-sage-100 transition-colors"
          >
            <Check className="h-3.5 w-3.5" /> Mark All Read
          </button>
          <button
            onClick={clearNotifications}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-dark-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-premium sm:p-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Showing {filtered.length} alert(s)
          </p>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence>
            {filtered.map((notif, i) => {
              const cfg = typeConfig[notif.type] || typeConfig.system;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markNotificationRead(notif.id)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3.5 rounded-xl p-3.5 transition-colors border',
                    notif.unread
                      ? 'border-sage-200 bg-sage-50/40 shadow-sm'
                      : 'border-transparent hover:bg-cream-50',
                  )}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                    <Icon className={cn('h-5 w-5', cfg.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-dark-900">{notif.title}</p>
                        {notif.unread && (
                          <span className="h-2 w-2 rounded-full bg-sage-600 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-dark-700">{notif.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No notifications to display in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
