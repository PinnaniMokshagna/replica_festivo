import { motion } from 'framer-motion';
import { MapPin, Clock, Eye, MessageSquare, Calendar } from 'lucide-react';
import { upcomingEvents, type BookingStatus } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  confirmed: 'bg-sage-50 text-sage-700 border-sage-200',
  completed: 'bg-dark-100 text-dark-700 border-dark-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export function UpcomingEvents() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Upcoming Events</h3>
          <p className="text-sm text-muted-foreground">Your next scheduled bookings</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">View all</button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {upcomingEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="relative flex gap-4"
            >
              {/* Dot */}
              <div className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-card bg-sage-100 shadow-sm">
                <Calendar className="h-4 w-4 text-sage-700" />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border border-border bg-cream-50/50 p-4 transition-colors hover:border-sage-200 hover:bg-cream-50">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-dark-900">{event.customer}</h4>
                    <p className="text-sm text-muted-foreground">{event.type}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
                      statusStyles[event.status],
                    )}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date} · {event.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-gold-700">
                    <Clock className="h-3.5 w-3.5" />
                    {event.budget}
                  </span>
                </div>

                <div className="mt-3.5 flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg bg-sage-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sage-700">
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
