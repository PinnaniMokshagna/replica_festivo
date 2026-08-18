import { motion } from 'framer-motion';
import { CreditCard, CalendarCheck, Star, Package, BellRing } from 'lucide-react';
import { notifications, type NotificationItem } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';

const typeIcon: Record<NotificationItem['type'], { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  payment: { icon: CreditCard, bg: 'bg-sage-50', color: 'text-sage-600' },
  booking: { icon: CalendarCheck, bg: 'bg-gold-50', color: 'text-gold-600' },
  review: { icon: Star, bg: 'bg-gold-50', color: 'text-gold-600' },
  package: { icon: Package, bg: 'bg-dark-100', color: 'text-dark-700' },
};

export function NotificationsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-dark-900">Notifications</h3>
        </div>
        <button className="text-xs font-semibold text-primary hover:underline">Mark all read</button>
      </div>

      <div className="space-y-1">
        {notifications.map((notif, i) => {
          const { icon: Icon, bg, color } = typeIcon[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-cream-50',
                notif.unread && 'bg-cream-50/60',
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-dark-900">{notif.title}</p>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">{notif.time}</p>
              </div>
              {notif.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
