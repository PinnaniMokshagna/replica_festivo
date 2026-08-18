import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, MessageSquare, Mail, Phone, BookOpen, ChevronRight, Plus, Search, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const initialFaqs = [
  { id: '1', q: 'How do I receive instant client payments?', a: 'Payments are automatically processed to your linked bank account or UPI address within 24 hours of booking completion.' },
  { id: '2', q: 'How do I manage multi-day wedding bookings?', a: 'Use the Interactive Calendar or Bookings page to schedule multi-day shoots and assign team members.' },
  { id: '3', q: 'Can I offer custom seasonal packages?', a: 'Yes! Visit the Packages section to create customized tiers or use the Deals tab for promotional coupons.' },
  { id: '4', q: 'How do I boost my vendor ranking?', a: 'Complete all profile onboarding tasks, reply quickly to client messages, and collect verified 5-star reviews.' },
];

export function SupportPage() {
  const { supportTickets, addSupportTicket } = useData();

  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('1');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payments');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [message, setMessage] = useState('');

  const filteredFaqs = initialFaqs.filter(f =>
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    addSupportTicket({
      subject,
      category,
      priority,
      message,
    });
    setIsAddModalOpen(false);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Support & Helpdesk" subtitle="Get priority support, submit helpdesk tickets, or search FAQs" icon={LifeBuoy} />

      {/* Support options */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100">
            <MessageSquare className="h-6 w-6 text-sage-700" />
          </div>
          <h4 className="mt-3 font-bold text-dark-900">Priority Support Ticket</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Direct ticket to vendor helpdesk</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-3 w-full rounded-xl bg-sage-600 py-2.5 text-xs font-semibold text-white hover:bg-sage-700 shadow-sm"
          >
            Submit New Ticket
          </button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100">
            <Mail className="h-6 w-6 text-sage-700" />
          </div>
          <h4 className="mt-3 font-bold text-dark-900">Email Support</h4>
          <p className="text-xs text-muted-foreground mt-0.5">support@festivo.com</p>
          <a href="mailto:support@festivo.com" className="mt-3 block w-full text-center rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-dark-700 hover:bg-muted">
            Send Email
          </a>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-border bg-card p-5 shadow-premium">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100">
            <Phone className="h-6 w-6 text-sage-700" />
          </div>
          <h4 className="mt-3 font-bold text-dark-900">Dedicated Helpline</h4>
          <p className="text-xs text-muted-foreground mt-0.5">+91 1800 123 4567 (Toll-Free)</p>
          <a href="tel:+9118001234567" className="mt-3 block w-full text-center rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-dark-700 hover:bg-muted">
            Call Desk
          </a>
        </motion.div>
      </div>

      {/* Submitted Support Tickets Log */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark-900">Your Support Tickets</h3>
          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-800">
            {supportTickets.length} Active
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {supportTickets.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-cream-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark-900 text-sm">{t.subject}</span>
                    <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-bold text-sage-800 uppercase">
                      {t.category}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize',
                      t.status === 'resolved'
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-gold-100 text-gold-800',
                    )}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-dark-700">{t.message}</p>

                {t.response && (
                  <div className="mt-2 rounded-lg border border-sage-200 bg-sage-50/60 p-2.5 text-xs text-sage-900 space-y-1">
                    <p className="font-bold text-sage-800 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Support Response:
                    </p>
                    <p>{t.response}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sage-600" />
            <h3 className="text-lg font-bold text-dark-900">Knowledge Base & FAQ</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={faqSearch}
              onChange={e => setFaqSearch(e.target.value)}
              placeholder="Search help topics..."
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredFaqs.map((faq) => {
            const isExp = expandedFaq === faq.id;
            return (
              <div key={faq.id} className="rounded-xl border border-border bg-cream-50/50 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(isExp ? null : faq.id)}
                  className="flex w-full items-center justify-between p-4 text-left font-semibold text-dark-900 text-sm hover:bg-cream-100"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={cn('h-4 w-4 transition-transform', isExp ? 'rotate-90 text-sage-600' : 'text-muted-foreground')} />
                </button>
                {isExp && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground border-t border-border/50 pt-2 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Submit Ticket */}
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
              <h3 className="text-lg font-bold text-dark-900">Submit Support Ticket</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Subject</label>
                <input
                  required
                  placeholder="e.g. Issue with payout transfer"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Payments">Payments</option>
                    <option value="Bookings">Bookings</option>
                    <option value="Account">Account</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your request or issue in detail..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                Submit Ticket
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
