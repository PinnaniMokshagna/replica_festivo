import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownToLine, TrendingDown, Plus, X, IndianRupee, Download } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const weeklyChart = [
  { day: 'Mon', value: 32000 },
  { day: 'Tue', value: 41000 },
  { day: 'Wed', value: 38000 },
  { day: 'Thu', value: 52000 },
  { day: 'Fri', value: 48000 },
  { day: 'Sat', value: 65000 },
  { day: 'Sun', value: 42000 },
];

const monthlyChart = [
  { day: 'Jan', value: 420000 },
  { day: 'Feb', value: 510000 },
  { day: 'Mar', value: 480000 },
  { day: 'Apr', value: 620000 },
  { day: 'May', value: 580000 },
  { day: 'Jun', value: 720000 },
  { day: 'Jul', value: 840000 },
  { day: 'Aug', value: 984500 },
];

export function EarningsPage() {
  const { transactions, addTransactionItem, timeframe, setTimeframe, showToast } = useData();

  const [isAddTxModal, setIsAddTxModal] = useState(false);
  const [cust, setCust] = useState('');
  const [serv, setServ] = useState('');
  const [amt, setAmt] = useState('');
  const [txType, setTxType] = useState<'credit' | 'payout'>('credit');

  const totalRevenue = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cust || !amt) return;
    const numAmt = parseFloat(amt.replace(/[^0-9.]/g, '')) || 50000;
    addTransactionItem({
      amount: amt.startsWith('₹') ? amt : `₹${amt}`,
      rawAmount: numAmt,
      customer: cust,
      service: serv || 'Vendor Service Fee',
      type: txType,
      date: 'Aug 2026',
      status: 'completed',
    });
    setIsAddTxModal(false);
    setCust('');
    setServ('');
    setAmt('');
  };

  const handleWithdraw = () => {
    addTransactionItem({
      amount: '₹50,000',
      rawAmount: 50000,
      customer: 'Bank Payout',
      service: 'Instant UPI Transfer to HDFC Bank',
      type: 'payout',
      date: 'Just now',
      status: 'completed',
    });
    showToast('Withdrawal of ₹50,000 initiated to your bank account!');
  };

  const activeChart = timeframe === 'weekly' ? weeklyChart : monthlyChart;

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Ledger & Earnings" subtitle="Track client deposits, view monthly revenue charts, and request bank payouts" icon={Wallet} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: 'Real-time', trend: 'up', bg: 'bg-gradient-brand', text: 'text-white' },
          { label: 'This Week', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: 'Current week', trend: 'up', bg: 'bg-card', text: 'text-dark-900' },
          { label: 'Pending Bookings', value: '₹0', change: '0 pending', trend: 'down', bg: 'bg-card', text: 'text-dark-900' },
          { label: 'Verified Payouts', value: '₹0', change: 'Instant UPI', trend: 'up', bg: 'bg-card', text: 'text-dark-900' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border p-5 shadow-premium ${stat.bg} ${stat.text === 'text-white' ? 'border-transparent glossy' : 'border-border'}`}
          >
            <p className={`text-sm ${stat.text === 'text-white' ? 'text-white/80' : 'text-muted-foreground'}`}>{stat.label}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-sage-600' : 'text-gold-600'} ${stat.text === 'text-white' ? '!text-white/80' : ''}`}>
              {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark-900">Revenue Analytics Chart</h3>
            <p className="text-sm text-muted-foreground">Historical earnings visualization</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-border bg-muted p-1">
              {(['weekly', 'monthly', 'yearly'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                    timeframe === tf ? 'bg-card text-dark-900 shadow-sm' : 'text-muted-foreground hover:text-dark-900',
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              onClick={handleWithdraw}
              className="flex items-center gap-1.5 rounded-xl bg-sage-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sage-700 shadow-sm"
            >
              <ArrowDownToLine className="h-4 w-4" /> Withdraw
            </button>
            <button
              onClick={() => setIsAddTxModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-dark-700 hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> Log Entry
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4a5d4e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4a5d4e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Earnings']}
              />
              <Area type="monotone" dataKey="value" stroke="#4a5d4e" strokeWidth={2.5} fill="url(#earnGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark-900">PostgreSQL Transaction Ledger</h3>
          <button
            onClick={() => showToast('Statement PDF downloaded')}
            className="flex items-center gap-1.5 text-xs font-semibold text-sage-700 hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> Download Statement
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {transactions.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
                      t.type === 'payout' ? 'bg-gold-500' : 'bg-gradient-brand',
                    )}
                  >
                    {t.customer.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900">{t.customer}</p>
                    <p className="text-xs text-muted-foreground">{t.service}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn('text-sm font-bold', t.type === 'payout' ? 'text-gold-700' : 'text-sage-700')}>
                    {t.type === 'payout' ? `-${t.amount}` : `+${t.amount}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal: Add Transaction */}
      {isAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsAddTxModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-dark-900">Log Manual Transaction</h3>
              <button onClick={() => setIsAddTxModal(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddTx} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Payer / Recipient</label>
                <input
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={cust}
                  onChange={e => setCust(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Service / Description</label>
                <input
                  placeholder="e.g. Advance Booking Deposit"
                  value={serv}
                  onChange={e => setServ(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Amount (₹)</label>
                <input
                  required
                  placeholder="₹75,000"
                  value={amt}
                  onChange={e => setAmt(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Type</label>
                <select
                  value={txType}
                  onChange={e => setTxType(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="credit">Income Credit (+)</option>
                  <option value="payout">Bank Payout (-)</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                Log Transaction
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
