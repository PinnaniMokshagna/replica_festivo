import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Star, CalendarCheck, Clock, Repeat, Download } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const bookingTrend = [
  { month: 'Jan', bookings: 12 },
  { month: 'Feb', bookings: 18 },
  { month: 'Mar', bookings: 15 },
  { month: 'Apr', bookings: 22 },
  { month: 'May', bookings: 25 },
  { month: 'Jun', bookings: 28 },
  { month: 'Jul', bookings: 32 },
  { month: 'Aug', bookings: 38 },
];

const weeklyRevenue = [
  { day: 'Mon', value: 32000 },
  { day: 'Tue', value: 41000 },
  { day: 'Wed', value: 38000 },
  { day: 'Thu', value: 52000 },
  { day: 'Fri', value: 48000 },
  { day: 'Sat', value: 65000 },
  { day: 'Sun', value: 42000 },
];

const serviceBreakdown = [
  { name: 'Photography & Media', percentage: 40, count: '16 events' },
  { name: 'Venue & Banquets', percentage: 30, count: '12 events' },
  { name: 'Catering & Dining', percentage: 20, count: '8 events' },
  { name: 'Decor & Planning', percentage: 10, count: '4 events' },
];

export function AnalyticsPage() {
  const { bookings, reviewsList, showToast } = useData();
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const avgRatingScore = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Live Avg Rating', value: avgRatingScore, icon: Star, accent: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Completed Events', value: String(completedCount), icon: CalendarCheck, accent: 'text-sage-600', bg: 'bg-sage-50' },
    { label: 'Avg Inquiry Response', value: bookings.length ? '15 mins' : '—', icon: Clock, accent: 'text-dark-700', bg: 'bg-dark-100' },
    { label: 'Repeat Clients', value: completedCount ? '10%' : '0%', icon: Repeat, accent: 'text-sage-600', bg: 'bg-sage-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Business Intelligence & Analytics" subtitle="Comprehensive view of conversion rates, booking velocity, and popular tiers" icon={BarChart3} />

      {/* Control bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-border bg-muted p-1">
          {(['7D', '30D', '90D', '1Y'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                range === r ? 'bg-card text-dark-900 shadow-sm' : 'text-muted-foreground hover:text-dark-900',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={() => showToast('Analytics CSV report exported successfully')}
          className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
        >
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <p className="mt-4 text-2xl font-bold text-dark-900">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Monthly Booking Growth</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px' }} />
                <Bar dataKey="bookings" fill="#4a5d4e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Revenue Velocity ({range})</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4a5d4e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4a5d4e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 15% 88%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(150 8% 45%)' }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(40 15% 88%)', fontSize: '12px' }} formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="value" stroke="#4a5d4e" strokeWidth={2.5} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <h3 className="mb-4 text-lg font-bold text-dark-900">Category Demand Share</h3>
        <div className="space-y-3.5">
          {serviceBreakdown.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4"
            >
              <p className="w-28 text-sm font-medium text-dark-700">{s.name}</p>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.percentage}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-brand"
                />
              </div>
              <p className="w-10 text-right text-sm font-bold text-dark-900">{s.percentage}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
