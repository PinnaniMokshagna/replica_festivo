import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, TrendingUp, Clock, Percent, Plus, Trash2, X, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

export function DealsPage() {
  const { dealsList, addDealItem, toggleDealStatus, deleteDealItem } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(15);
  const [validTill, setValidTill] = useState('2026-09-30');
  const [packageName, setPackageName] = useState('Wedding Premium');

  const activeCount = dealsList.filter(d => d.status === 'active').length;

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    addDealItem({
      code: code.toUpperCase().replace(/\s+/g, ''),
      discount: Number(discount),
      validTill,
      packageName,
      status: 'active',
    });
    setIsAddModalOpen(false);
    setCode('');
    setDiscount(15);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Deals & Promotional Discounts" subtitle="Launch coupon codes, limited-time offers, and seasonal event bundles" icon={Tag} />

      {/* Stats header */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active Deals', value: String(activeCount), icon: Tag, color: 'text-sage-600', bg: 'bg-sage-50' },
          { label: 'Redemptions', value: '0', icon: TrendingUp, color: 'text-gold-600', bg: 'bg-gold-50' },
          { label: 'Avg. Savings', value: activeCount ? '15%' : '0%', icon: Percent, color: 'text-dark-700', bg: 'bg-dark-100' },
          { label: 'Expiring Soon', value: '0', icon: Clock, color: 'text-gold-600', bg: 'bg-gold-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-4 shadow-premium"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-3 text-xl font-bold text-dark-900">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Promo Offer
        </button>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {dealsList.map((deal, i) => (
            <motion.div
              key={deal.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-dark-900 text-lg">{deal.code}</h4>
                    <button
                      onClick={() => toggleDealStatus(deal.id)}
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize transition-colors',
                        deal.status === 'active'
                          ? 'bg-sage-100 text-sage-800 border border-sage-300'
                          : 'bg-dark-100 text-dark-500 border border-border',
                      )}
                    >
                      {deal.status}
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-sage-700">Applies to: {deal.packageName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Valid through {deal.validTill}</p>
                </div>
                <div className="ml-4 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-brand glossy text-white shadow-glow-sage">
                  <span className="text-lg font-extrabold">{deal.discount}%</span>
                  <span className="text-[10px] text-white/90">OFF</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <button
                  onClick={() => toggleDealStatus(deal.id)}
                  className="text-xs font-semibold text-sage-700 hover:underline"
                >
                  {deal.status === 'active' ? 'Deactivate Code' : 'Re-activate Code'}
                </button>

                <button
                  onClick={() => deleteDealItem(deal.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  title="Delete Deal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: Create Deal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sage-600" />
                <h3 className="text-lg font-bold text-dark-900">Create Promo Offer</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Coupon Code</label>
                <input
                  required
                  placeholder="e.g. FESTIVAL20"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Discount Percentage (%)</label>
                <input
                  required
                  type="number"
                  min={1}
                  max={90}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Valid Till Date</label>
                <input
                  required
                  type="date"
                  value={validTill}
                  onChange={e => setValidTill(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Applicable Package</label>
                <select
                  value={packageName}
                  onChange={e => setPackageName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Wedding Premium">Wedding Premium</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Birthday">Birthday</option>
                  <option value="All Packages">All Packages</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                Publish Coupon Code
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
