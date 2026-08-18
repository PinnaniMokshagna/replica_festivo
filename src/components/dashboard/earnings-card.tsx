import { motion } from 'framer-motion';
import { ArrowDownToLine, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { earningsData } from '@/lib/dashboard-data';
import { useData } from '@/context/DataContext';

export function EarningsCard() {
  const { transactions, bookings } = useData();

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + (t.rawAmount || 0), 0);

  const pendingAmount = bookings
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => {
      const raw = parseInt(String(b.budget || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return sum + raw;
    }, 0);

  const tabs = [
    { id: 'today', label: 'Today', value: `₹${totalCredit.toLocaleString('en-IN')}` },
    { id: 'week', label: 'Weekly', value: `₹${totalCredit.toLocaleString('en-IN')}` },
    { id: 'month', label: 'Monthly', value: `₹${totalCredit.toLocaleString('en-IN')}` },
    { id: 'pending', label: 'Pending', value: `₹${pendingAmount.toLocaleString('en-IN')}` },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Earnings</h3>
          <p className="text-sm text-muted-foreground">Your financial overview</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-700">
          <ArrowDownToLine className="h-4 w-4" />
          Withdraw
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tabs.map((tab, i) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-xl p-3.5 ${i === 0 ? 'bg-gradient-brand text-white' : 'border border-border bg-cream-50/50'}`}
          >
            <p className={`text-xs ${i === 0 ? 'text-white/80' : 'text-muted-foreground'}`}>{tab.label}</p>
            <p className={`mt-1 text-lg font-bold ${i === 0 ? 'text-white' : 'text-dark-900'}`}>{tab.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-dark-900">Weekly Trend</p>
          <span className="flex items-center gap-1 text-xs font-semibold text-sage-700">
            <TrendingUp className="h-3.5 w-3.5" />
            +18% growth
          </span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5a855a" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#5a855a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(40 15% 88%)',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Earnings']}
                labelStyle={{ color: 'hsl(150 18% 18%)', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#5a855a"
                strokeWidth={2.5}
                fill="url(#earningsGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
