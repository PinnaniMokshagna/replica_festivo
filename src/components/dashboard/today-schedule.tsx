import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { scheduleItems } from '@/lib/dashboard-data';

export function TodaySchedule() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <h3 className="text-base font-bold text-dark-900">Today's Schedule</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Your events for today</p>

      <div className="relative mt-4">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-4">
          {scheduleItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative flex gap-4"
            >
              <div className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-card bg-sage-500 shadow-sm" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-sage-700">{item.time}</p>
                <p className="text-sm font-semibold text-dark-900">{item.title}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
