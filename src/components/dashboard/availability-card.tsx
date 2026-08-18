import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export function AvailabilityCard() {
  const { isAvailable, toggleAvailability } = useData();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium">
      <h3 className="text-base font-bold text-dark-900">Vendor Availability</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">Toggle your instant booking status</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-3 w-3 rounded-full',
              isAvailable ? 'bg-sage-500 animate-pulse-ring' : 'bg-dark-300',
            )}
          />
          <div>
            <p className="text-sm font-semibold text-dark-900">
              {isAvailable ? 'Available Now' : 'Currently Away'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAvailable ? 'Accepting new client requests' : 'Bookings paused'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleAvailability}
          className={cn(
            'relative h-8 w-14 rounded-full transition-colors',
            isAvailable ? 'bg-sage-600' : 'bg-dark-200',
          )}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute top-1 h-6 w-6 rounded-full bg-white shadow-md',
              isAvailable ? 'left-7' : 'left-1',
            )}
          />
        </button>
      </div>
    </div>
  );
}
