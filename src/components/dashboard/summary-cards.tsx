import { motion } from 'framer-motion';
import {
  BellRing,
  CalendarCheck,
  IndianRupee,
  Star,
  TrendingUp,
} from 'lucide-react';
import { summaryCards, type SummaryCard } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BellRing,
  CalendarCheck,
  IndianRupee,
  Star,
};

const accentStyles: Record<SummaryCard['accent'], { bg: string; icon: string; text: string }> = {
  sage: { bg: 'bg-sage-50', icon: 'text-sage-600', text: 'text-sage-700' },
  gold: { bg: 'bg-gold-50', icon: 'text-gold-600', text: 'text-gold-700' },
  dark: { bg: 'bg-dark-100', icon: 'text-dark-700', text: 'text-dark-800' },
};

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card, i) => {
        const Icon = iconMap[card.icon] ?? BellRing;
        const styles = accentStyles[card.accent];
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
          >
            <div className="flex items-start justify-between">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', styles.bg)}>
                <Icon className={cn('h-5 w-5', styles.icon)} />
              </div>
              {card.change && (
                <span className="flex items-center gap-1 rounded-full bg-sage-50 px-2 py-1 text-[11px] font-semibold text-sage-700">
                  <TrendingUp className="h-3 w-3" />
                  {card.change}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-dark-900">{card.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
