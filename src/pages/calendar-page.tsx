import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Trash2, X } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useData();

  const [currentMonth, setCurrentMonth] = useState('August 2026');
  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [dateStr, setDateStr] = useState('2026-08-12');
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateStr) return;
    addCalendarEvent({
      title,
      customer: customer || 'Client',
      date: dateStr,
      time,
      location: location || 'TBD',
    });
    setIsAddModalOpen(false);
    setTitle('');
    setCustomer('');
    setLocation('');
  };

  // Find events for selected day
  const eventsForSelectedDay = calendarEvents.filter(e => {
    const dayNum = parseInt(e.date.split('-')[2] || '0', 10);
    return dayNum === selectedDay;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Interactive Calendar" subtitle="Schedule shoots, venue tours, and client consultations" icon={CalendarDays} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Calendar Grid Container */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-dark-900">{currentMonth}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth('July 2026')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 transition-colors hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonth('September 2026')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-dark-600 transition-colors hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-sage-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sage-700 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="pb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }).map((_, i) => {
              const dateNum = i + 1;
              const hasEvents = calendarEvents.some(e => {
                const d = parseInt(e.date.split('-')[2] || '0', 10);
                return d === dateNum;
              });

              const isSelected = selectedDay === dateNum;

              return (
                <motion.div
                  key={dateNum}
                  onClick={() => setSelectedDay(dateNum)}
                  whileHover={{ scale: 1.04 }}
                  className={cn(
                    'flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border p-1 text-sm font-semibold transition-all',
                    isSelected
                      ? 'border-sage-600 bg-sage-600 text-white shadow-md'
                      : hasEvents
                      ? 'border-sage-300 bg-sage-50 text-sage-900 font-bold'
                      : 'border-border bg-cream-50/50 text-dark-700 hover:bg-cream-100',
                  )}
                >
                  <span>{dateNum}</span>
                  {hasEvents && (
                    <span
                      className={cn(
                        'mt-1 h-1.5 w-1.5 rounded-full',
                        isSelected ? 'bg-white' : 'bg-gold-500',
                      )}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-dark-900">Agenda for Aug {selectedDay}</h3>
              <p className="text-xs text-muted-foreground">{eventsForSelectedDay.length} event(s) scheduled</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-lg p-1.5 text-sage-700 hover:bg-sage-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {eventsForSelectedDay.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-sage-200 bg-sage-50/40 p-3.5 space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-dark-900 text-sm">{ev.title}</h4>
                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-sage-600" /> {ev.time}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-sage-600" /> {ev.location}
                  </p>
                  {ev.customer && (
                    <p className="text-xs font-semibold text-gold-700 pt-1">Client: {ev.customer}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {eventsForSelectedDay.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No events scheduled for August {selectedDay}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Event */}
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
              <h3 className="text-lg font-bold text-dark-900">Add Calendar Event</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Event Title</label>
                <input
                  required
                  placeholder="e.g. Pre-Wedding Shoot at Beach"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Client Name</label>
                <input
                  placeholder="e.g. Divya Rao"
                  value={customer}
                  onChange={e => setCustomer(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Date</label>
                  <input
                    required
                    type="date"
                    value={dateStr}
                    onChange={e => setDateStr(e.target.value)}
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
                <label className="block text-xs font-semibold text-dark-700 mb-1">Location</label>
                <input
                  placeholder="e.g. JW Marriott, Mumbai"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700"
              >
                Schedule Event
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
