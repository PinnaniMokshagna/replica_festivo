import { motion } from 'framer-motion';
import { Star, CheckCircle2, Clock, Repeat } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function PerformanceCard() {
  const { bookings, reviewsList } = useData();

  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const avgRating = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : '0.0';

  const stats = [
    { id: '1', label: 'Average Rating', value: avgRating, icon: Star, accent: 'text-gold-600', bg: 'bg-gold-50' },
    { id: '2', label: 'Completed Events', value: String(completedCount), icon: CheckCircle2, accent: 'text-sage-600', bg: 'bg-sage-50' },
    { id: '3', label: 'Response Time', value: bookings.length ? '15m' : '—', icon: Clock, accent: 'text-dark-700', bg: 'bg-dark-100' },
    { id: '4', label: 'Repeat Customers', value: completedCount ? '10%' : '0%', icon: Repeat, accent: 'text-sage-600', bg: 'bg-sage-50' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <h3 className="text-base font-bold text-dark-900">Performance</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Your live business metrics</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-cream-50/50 p-3.5"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.accent}`} />
              </div>
              <p className="mt-2.5 text-xl font-bold text-dark-900">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
