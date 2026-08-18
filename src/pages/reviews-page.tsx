import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, ThumbsUp, X, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export function ReviewsPage() {
  const { reviewsList, addReviewReply, addReviewItem } = useData();

  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isAddReviewModal, setIsAddReviewModal] = useState(false);

  // New review state
  const [newCust, setNewCust] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');

  const filteredReviews = reviewsList.filter(r =>
    ratingFilter === 'All' ? true : r.rating === ratingFilter
  );

  const avgRating = (
    reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)
  ).toFixed(1);

  const fiveStarCount = reviewsList.filter(r => r.rating === 5).length;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReviewId || !replyText.trim()) return;
    addReviewReply(replyingReviewId, replyText);
    setReplyingReviewId(null);
    setReplyText('');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust || !newText) return;
    addReviewItem({
      customer: newCust,
      avatar: newCust.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU',
      rating: newRating,
      text: newText,
      date: 'Just now',
    });
    setIsAddReviewModal(false);
    setNewCust('');
    setNewText('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Client Reviews & Ratings" subtitle="Monitor feedback, respond to verified client reviews, and maintain top ratings" icon={Star} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Average Score', value: reviewsList.length ? avgRating : '0.0', accent: 'text-gold-700' },
          { label: 'Total Reviews', value: String(reviewsList.length), accent: 'text-dark-900' },
          { label: '5-Star Ratings', value: String(fiveStarCount), accent: 'text-sage-700' },
          { label: 'Response Rate', value: reviewsList.length ? '100%' : '0%', accent: 'text-sage-700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-premium"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 5, 4, 3].map((f) => (
            <button
              key={String(f)}
              onClick={() => setRatingFilter(f as any)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                ratingFilter === f
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              {f === 'All' ? 'All Reviews' : `${f} Stars`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddReviewModal(true)}
          className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-700 shadow-sm"
        >
          <MessageSquareQuote className="h-4 w-4" />
          Test Client Review
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-cream-50/50 rounded-3xl border border-dashed border-sage-200">
          <Star className="w-12 h-12 text-sage-300 mx-auto mb-3" />
          <h3 className="font-bold text-sage-900 text-lg">No client reviews yet</h3>
          <p className="text-dark-500 text-xs mt-1">Verified reviews from your booked clients will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filteredReviews.map((review, i) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-sm">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-dark-900">{review.customer}</p>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={idx < review.rating ? 'h-4 w-4 fill-gold-400 text-gold-400' : 'h-4 w-4 text-dark-200'}
                      />
                    ))}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-dark-800 font-medium">"{review.text}"</p>

                  {review.reply && (
                    <div className="mt-3 rounded-xl border border-sage-200 bg-sage-50/60 p-3 text-xs text-sage-900 space-y-1">
                      <div className="flex items-center justify-between font-bold text-sage-800">
                        <span>Vendor Official Reply:</span>
                        <span className="text-[10px] text-sage-700">{review.reply_date || 'Recent'}</span>
                      </div>
                      <p>{review.reply}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => setReplyingReviewId(review.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-sage-600" />
                    {review.reply ? 'Edit Reply' : 'Respond'}
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted">
                    <ThumbsUp className="h-3.5 w-3.5 text-sage-600" /> Helpful
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal: Reply to Review */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setReplyingReviewId(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-dark-900">Reply to Review</h3>
              <button onClick={() => setReplyingReviewId(null)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Your Response</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank you so much! It was a delight capturing your special day..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                Publish Vendor Reply
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Test Review */}
      {isAddReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsAddReviewModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-dark-900">Add Test Client Review</h3>
              <button onClick={() => setIsAddReviewModal(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Client Name</label>
                <input
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newCust}
                  onChange={e => setNewCust(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Rating</label>
                <select
                  value={newRating}
                  onChange={e => setNewRating(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value={5}>5 Stars - Outstanding</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Review Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share client feedback..."
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                Submit Review
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
