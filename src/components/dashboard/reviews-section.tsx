import { motion } from 'framer-motion';
import { Star, MessageCircle } from 'lucide-react';
import { reviews } from '@/lib/dashboard-data';

export function ReviewsSection() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Recent Reviews</h3>
          <p className="text-sm text-muted-foreground">What clients are saying</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">View all</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col rounded-xl border border-border bg-cream-50/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                {review.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark-900">{review.customer}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-dark-700">"{review.text}"</p>

            <button className="mt-3 flex items-center gap-1.5 self-start rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              Reply
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
