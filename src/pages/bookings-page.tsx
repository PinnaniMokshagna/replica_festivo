import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Clock, MapPin, Eye, MessageSquare, Search, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData, type ExtendedBooking } from '@/context/DataContext';
import { type BookingStatus } from '@/lib/dashboard-data';
import { useNavigate } from 'react-router-dom';

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  confirmed: 'bg-sage-50 text-sage-700 border-sage-200',
  completed: 'bg-dark-100 text-dark-700 border-dark-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export function BookingsPage() {
  const { bookings, addBooking, updateBookingStatus, deleteBooking, startNewConversation } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Booking Form State
  const [customer, setCustomer] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !type || !date) return;
    addBooking({
      customer,
      avatar: customer.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU',
      type,
      date,
      time,
      location: location || 'Location to be specified',
      budget: budget.startsWith('₹') ? budget : `₹${budget}`,
      status: 'pending',
    });
    setIsAddModalOpen(false);
    setCustomer('');
    setType('');
    setDate('');
    setLocation('');
    setBudget('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings Management"
        subtitle="View, schedule, and process customer event bookings stored in PostgreSQL"
        icon={CalendarCheck}
      />

      {/* Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer, service, venue..."
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                statusFilter === f
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              {f}
            </button>
          ))}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Booking
          </button>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {filteredBookings.map((event, i) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-premium transition-shadow hover:shadow-premium-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-dark-900">{event.customer}</h4>
                  <p className="text-sm font-medium text-sage-700">{event.type}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
                    statusStyles[event.status],
                  )}
                >
                  {event.status}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> {event.date} · {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {event.location}
                </p>
                <p className="flex items-center gap-2 font-bold text-gold-700">
                  <span>{event.budget}</span>
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBooking(event)}
                    className="flex items-center gap-1.5 rounded-lg bg-sage-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-sage-700"
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </button>
                  <button
                    onClick={() => {
                      startNewConversation(event.customer, event.type);
                      navigate('/messages');
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-dark-700 transition-colors hover:bg-muted"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-sage-600" /> Chat
                  </button>
                </div>

                <button
                  onClick={() => deleteBooking(event.id)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete booking"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredBookings.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-base font-semibold text-dark-900">No bookings match your filter.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing search terms or create a new booking.</p>
          </div>
        )}
      </div>

      {/* Modal: View / Edit Booking */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-dark-900">{selectedBooking.customer}</h3>
                <p className="text-xs text-muted-foreground">Booking Ref: #{selectedBooking.id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-5 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                <div>
                  <span className="text-xs text-muted-foreground">Service</span>
                  <p className="font-semibold text-dark-900">{selectedBooking.type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Budget</span>
                  <p className="font-bold text-gold-700">{selectedBooking.budget}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Date & Time</span>
                  <p className="font-medium text-dark-900">{selectedBooking.date} ({selectedBooking.time})</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Location</span>
                  <p className="font-medium text-dark-900">{selectedBooking.location}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, st);
                        setSelectedBooking(prev => (prev ? { ...prev, status: st } : null));
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                        selectedBooking.status === st
                          ? 'border-sage-600 bg-sage-600 text-white shadow-sm'
                          : 'border-border bg-card text-dark-700 hover:bg-muted',
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-sage-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sage-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Booking */}
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
              <h3 className="text-lg font-bold text-dark-900">Add New Booking</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Customer Name</label>
                <input
                  required
                  placeholder="e.g. Kavya Patel"
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Service Required</label>
                <input
                  required
                  placeholder="e.g. Destination Wedding Decor"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Location / Venue</label>
                <input
                  placeholder="e.g. Grand Hyatt, Goa"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Budget (₹)</label>
                <input
                  placeholder="₹1,50,000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700"
              >
                Save Booking to PostgreSQL
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
