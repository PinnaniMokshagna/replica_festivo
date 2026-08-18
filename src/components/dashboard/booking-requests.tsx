import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, CalendarClock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';

export function BookingRequests() {
  const { bookings, updateBookingStatus } = useData();
  const navigate = useNavigate();

  const pendingRequests = bookings.filter(b => b.status === 'pending');

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Recent Booking Requests</h3>
          <p className="text-sm text-muted-foreground">Accept or reject incoming client requests</p>
        </div>
        <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700">
          {pendingRequests.length} pending
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {pendingRequests.map((req, i) => (
            <motion.div
              key={req.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex flex-col gap-3 rounded-xl border border-border bg-cream-50/50 p-4 transition-colors hover:border-sage-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {req.avatar || req.customer.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-dark-900">{req.customer}</p>
                  <p className="text-sm text-muted-foreground">{req.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-gold-700">{req.budget}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    {req.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateBookingStatus(req.id, 'confirmed')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-600 text-white transition-colors hover:bg-sage-700"
                    title="Accept"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateBookingStatus(req.id, 'cancelled')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/bookings')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 transition-colors hover:bg-muted"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {pendingRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-50">
              <Check className="h-6 w-6 text-sage-600" />
            </div>
            <p className="mt-3 font-semibold text-dark-900">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending booking requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
