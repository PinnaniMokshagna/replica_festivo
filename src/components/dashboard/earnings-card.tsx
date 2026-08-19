import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, TrendingUp } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function EarningsCard() {
  const { transactions } = useData();
  const [activeTab, setActiveTab] = useState('today');

  const now = new Date();
  
  const getFilteredTransactions = (tabId: string) => {
    return transactions.filter(t => {
      if (t.type !== 'credit') return false;
      const d = t.rawDate ? new Date(t.rawDate) : new Date();
      
      if (tabId === 'pending') {
        return t.status === 'pending';
      }
      
      if (t.status !== 'completed') return false;

      if (tabId === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (tabId === 'week') {
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
      }
      if (tabId === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      
      return false;
    });
  };

  const todayTxs = getFilteredTransactions('today');
  const weekTxs = getFilteredTransactions('week');
  const monthTxs = getFilteredTransactions('month');
  const pendingTxs = getFilteredTransactions('pending');

  const todayAmount = todayTxs.reduce((sum, t) => sum + (t.rawAmount || 0), 0);
  const weekAmount = weekTxs.reduce((sum, t) => sum + (t.rawAmount || 0), 0);
  const monthAmount = monthTxs.reduce((sum, t) => sum + (t.rawAmount || 0), 0);
  const pendingAmount = pendingTxs.reduce((sum, t) => sum + (t.rawAmount || 0), 0);

  const tabs = [
    { id: 'today', label: 'Today', value: `₹${todayAmount.toLocaleString('en-IN')}` },
    { id: 'week', label: 'Weekly', value: `₹${weekAmount.toLocaleString('en-IN')}` },
    { id: 'month', label: 'Monthly', value: `₹${monthAmount.toLocaleString('en-IN')}` },
    { id: 'pending', label: 'Pending', value: `₹${pendingAmount.toLocaleString('en-IN')}` },
  ];

  const activeTransactions = getFilteredTransactions(activeTab);

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
            onClick={() => setActiveTab(tab.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`cursor-pointer rounded-xl p-3.5 transition-all ${activeTab === tab.id ? 'bg-gradient-brand text-white shadow-md' : 'border border-border bg-cream-50/50 hover:bg-sage-50'}`}
          >
            <p className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'}`}>{tab.label}</p>
            <p className={`mt-1 text-lg font-bold ${activeTab === tab.id ? 'text-white' : 'text-dark-900'}`}>{tab.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-dark-900">{tabs.find(t => t.id === activeTab)?.label} Breakdown</p>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Event Type</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeTransactions.length > 0 ? (
                activeTransactions.map(tx => (
                  <tr key={tx.id} className="group transition-colors hover:bg-cream-50/50">
                    <td className="py-3 font-medium text-dark-900">{tx.customer}</td>
                    <td className="py-3 text-dark-600">{tx.service}</td>
                    <td className="py-3 text-dark-600">{new Date(tx.rawDate || tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'bg-sage-100 text-sage-700' : 'bg-gold-100 text-gold-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-dark-900">{tx.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No transactions found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
