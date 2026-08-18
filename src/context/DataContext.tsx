import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  upcomingEvents,
  bookingRequests,
  scheduleItems,
  reviews as initialReviews,
  packages as initialPackages,
  notifications as initialNotifications,
  portfolioImages,
  profileTasks as initialProfileTasks,
  type BookingStatus,
  type NotificationItem,
  type Package,
  type Review,
} from '@/lib/dashboard-data';

export interface ExtendedBooking {
  id: string;
  customer: string;
  avatar?: string;
  type: string;
  date: string;
  time: string;
  location: string;
  budget: string;
  status: BookingStatus;
  notes?: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  customer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'vendor' | 'customer';
  text: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  customerName: string;
  avatar: string;
  service: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  views: number;
  likes: number;
  date: string;
}

export interface DealItem {
  id: string;
  code: string;
  discount: number;
  validTill: string;
  packageName: string;
  status: 'active' | 'expired';
}

export interface TransactionItem {
  id: string;
  amount: string;
  rawAmount: number;
  customer: string;
  service: string;
  type: 'credit' | 'payout';
  date: string;
  status: 'completed' | 'pending';
}

export interface SupportTicketItem {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  message: string;
  response?: string;
  date: string;
}

interface DataContextType {
  // Bookings
  bookings: ExtendedBooking[];
  addBooking: (booking: Omit<ExtendedBooking, 'id'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;

  // Calendar Events
  calendarEvents: CalendarEventItem[];
  addCalendarEvent: (event: Omit<CalendarEventItem, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Messages
  conversations: ChatConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startNewConversation: (customerName: string, service: string) => void;

  // Portfolio
  portfolioItems: PortfolioProject[];
  addPortfolioItem: (item: Omit<PortfolioProject, 'id' | 'views' | 'likes'>) => void;
  deletePortfolioItem: (id: string) => void;

  // Packages
  packagesList: Package[];
  addPackageItem: (pkg: Omit<Package, 'id'>) => void;
  editPackageItem: (id: string, pkg: Partial<Package>) => void;
  deletePackageItem: (id: string) => void;
  togglePackagePopular: (id: string) => void;

  // Reviews
  reviewsList: Review[];
  addReviewReply: (id: string, replyText: string) => void;
  addReviewItem: (rev: Omit<Review, 'id'>) => void;

  // Earnings & Transactions
  transactions: TransactionItem[];
  addTransactionItem: (tx: Omit<TransactionItem, 'id'>) => void;
  timeframe: 'weekly' | 'monthly' | 'yearly';
  setTimeframe: (tf: 'weekly' | 'monthly' | 'yearly') => void;

  // Deals
  dealsList: DealItem[];
  addDealItem: (deal: Omit<DealItem, 'id'>) => void;
  toggleDealStatus: (id: string) => void;
  deleteDealItem: (id: string) => void;

  // Support
  supportTickets: SupportTicketItem[];
  addSupportTicket: (ticket: Omit<SupportTicketItem, 'id' | 'status' | 'date'>) => void;

  // Notifications
  notificationsList: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'unread'>) => void;

  // Onboarding & Settings
  profileTasksList: typeof initialProfileTasks;
  toggleProfileTaskItem: (id: string) => void;
  isAvailable: boolean;
  toggleAvailability: () => void;

  // Toast System
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEMO_NAMES = [
  'ananya sharma', 'rohan mehta', 'priya iyer', 'karthik reddy',
  'meera nair', 'arjun kapoor', 'sneha gupta', 'vikram singh', 'divya rao'
];

const isDemoItem = (item: any) => {
  if (!item) return true;
  const idStr = String(item.id || '');
  // Only filter explicitly known demo IDs — never filter real bk_ or FEST- bookings
  if (['c1', 'c2', 'c3', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'tx1', 'tx2', 'tx3', 'tx4', 'req_1', 'req_2', 'req_3'].includes(idStr)) return true;
  if (idStr.startsWith('bk_') || idStr.startsWith('FEST-')) return false; // Always keep real bookings
  const nameStr = String(item.customer || item.customerName || item.name || '').toLowerCase().trim();
  return DEMO_NAMES.some(demo => nameStr === demo); // exact match only, not includes
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  // --- Toast State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Bookings ---
  const [bookings, setBookings] = useState<ExtendedBooking[]>(() => {
    const saved = localStorage.getItem('vendor_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((b: any) => !isDemoItem(b));
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    // Merge-save: don't wipe real customer bookings written by BookingPage.tsx
    // Only save if there are real bookings to write (prevents wiping on initial empty load)
    if (bookings.length > 0) {
      try {
        const existing = JSON.parse(localStorage.getItem('vendor_bookings') || '[]');
        // Merge: keep all existing, add new ones not already present
        const existingIds = new Set(existing.map((b: any) => b.id));
        const toAdd = bookings.filter(b => !existingIds.has(b.id));
        const merged = [...existing, ...toAdd];
        localStorage.setItem('vendor_bookings', JSON.stringify(merged));
      } catch (e) {
        localStorage.setItem('vendor_bookings', JSON.stringify(bookings));
      }
    }
  }, [bookings]);

  useEffect(() => {
    const handleSync = () => {
      const savedB = localStorage.getItem('vendor_bookings');
      if (savedB) {
        try {
          const parsed = JSON.parse(savedB);
          // Keep all real bookings (bk_*, FEST-*), filter only known demo IDs
          const real = parsed.filter((b: any) => b && !isDemoItem(b));
          setBookings(real);
        } catch (e) {}
      }

      const savedCal = localStorage.getItem('vendor_calendar_events');
      if (savedCal) setCalendarEvents(JSON.parse(savedCal).filter((e: any) => e && !['1', '2', '3', '4'].includes(String(e.id))));

      const savedTx = localStorage.getItem('vendor_transactions');
      if (savedTx) setTransactions(JSON.parse(savedTx).filter((t: any) => t && !['tx1', 'tx2', 'tx3', 'tx4'].includes(String(t.id))));

      const savedNotif = localStorage.getItem('vendor_notifications');
      if (savedNotif) setNotificationsList(JSON.parse(savedNotif).filter((n: any) => n && !['1', '2', '3', '4'].includes(String(n.id))));
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const addBooking = (booking: Omit<ExtendedBooking, 'id'>) => {
    const newB: ExtendedBooking = { ...booking, id: 'bk_' + Date.now() };
    setBookings(prev => [newB, ...prev]);
    showToast(`Booking for ${booking.customer} created successfully!`);
    addNotification({
      type: 'booking',
      title: 'New Booking Created',
      message: `${booking.customer} - ${booking.type} on ${booking.date}`,
      time: 'Just now',
    });
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status } : b))
    );
    showToast(`Booking status updated to ${status.toUpperCase()}`);
    addNotification({
      type: 'booking',
      title: `Booking ${status}`,
      message: `Status updated for booking #${id.slice(-4)}`,
      time: 'Just now',
    });
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast('Booking removed', 'info');
  };

  // --- Calendar Events ---
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('vendor_calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((e: any) => e && !['1', '2', '3', '4'].includes(String(e.id)));
      } catch (err) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const addCalendarEvent = (event: Omit<CalendarEventItem, 'id'>) => {
    const newE: CalendarEventItem = { ...event, id: 'ev_' + Date.now() };
    setCalendarEvents(prev => [...prev, newE]);
    showToast(`Event "${event.title}" added to calendar!`);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    showToast('Event deleted from calendar', 'info');
  };

  // --- Messages & Conversations ---
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('vendor_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((c: any) => c && !['c1', 'c2', 'c3'].includes(String(c.id)));
      } catch (err) {}
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('vendor_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      sender: 'vendor',
      text,
      timestamp: nowTime,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            time: nowTime,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
    showToast('Message sent!');
  };

  const startNewConversation = (customerName: string, service: string) => {
    const existing = conversations.find(c => c.customerName.toLowerCase() === customerName.toLowerCase());
    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }
    const newId = 'c_' + Date.now();
    const newConv: ChatConversation = {
      id: newId,
      customerName,
      avatar: customerName.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU',
      service,
      lastMessage: 'Chat started',
      time: 'Just now',
      unread: false,
      messages: [
        { id: 'm_init_' + Date.now(), sender: 'vendor', text: `Hello ${customerName}, how can I assist you today?`, timestamp: 'Just now' },
      ],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    showToast(`Conversation started with ${customerName}`);
  };

  // --- Portfolio Items ---
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem('vendor_portfolio_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((p: any) => p && !['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].includes(String(p.id)));
      } catch (err) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_portfolio_items', JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  const addPortfolioItem = (item: Omit<PortfolioProject, 'id' | 'views' | 'likes'>) => {
    const newItem: PortfolioProject = {
      ...item,
      id: 'p_' + Date.now(),
      views: 1,
      likes: 0,
    };
    setPortfolioItems(prev => {
      const updated = [newItem, ...prev];
      // Sync portfolio image URLs into the vendor's public gallery
      try {
        const activeUserRaw = localStorage.getItem('vendor_user_profile');
        if (activeUserRaw) {
          const u = JSON.parse(activeUserRaw);
          const uEmail = (u.email || '').toLowerCase().trim();
          const uName = (u.businessName || u.fullName || '').toLowerCase().trim();
          if (uEmail || uName) {
            const galleryUrls = updated.map(p => p.imageUrl).filter(Boolean);
            const syncGallery = (listKey: string) => {
              const raw = localStorage.getItem(listKey);
              if (!raw) return;
              const list = JSON.parse(raw);
              let changed = false;
              const synced = list.map((v: any) => {
                const vEmail = (v.details?.email || v.email || '').toLowerCase().trim();
                const vName = (v.name || '').toLowerCase().trim();
                if ((uEmail && vEmail === uEmail) || (uName && vName === uName)) {
                  changed = true;
                  return { ...v, gallery: galleryUrls };
                }
                return v;
              });
              if (changed) localStorage.setItem(listKey, JSON.stringify(synced));
            };
            syncGallery('festivo_approved_vendors');
            syncGallery('festivo_pending_vendors');
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch (e) {}
      return updated;
    });
    showToast('New project added to portfolio!');
  };

  const deletePortfolioItem = (id: string) => {
    setPortfolioItems(prev => prev.filter(p => p.id !== id));
    showToast('Portfolio item deleted', 'info');
  };

  // --- Packages ---
  const [packagesList, setPackagesList] = useState<Package[]>(() => {
    const saved = localStorage.getItem('vendor_packages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((pkg: any) => pkg && !['1', '2', '3'].includes(String(pkg.id)));
      } catch (err) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_packages', JSON.stringify(packagesList));

    const activeUserRaw = localStorage.getItem('vendor_user_profile');
    if (activeUserRaw) {
      try {
        const u = JSON.parse(activeUserRaw);
        const uEmail = (u.email || '').toLowerCase().trim();
        const uName = (u.businessName || u.fullName || '').toLowerCase().trim();

        // Only sync if we have a real email or name to match against (prevent updating all vendors)
        if (!uEmail && !uName) return;

        const syncVendorList = (listKey: string) => {
          const raw = localStorage.getItem(listKey);
          if (!raw) return;
          const list = JSON.parse(raw);
          let changed = false;
          const updated = list.map((v: any) => {
            const vEmail = (v.details?.email || v.email || '').toLowerCase().trim();
            const vName = (v.name || '').toLowerCase().trim();
            const isMatch = (uEmail && vEmail === uEmail) || (uName && vName === uName);
            if (isMatch) {
              changed = true;
              return { ...v, custom_packages: packagesList };
            }
            return v;
          });
          if (changed) localStorage.setItem(listKey, JSON.stringify(updated));
        };

        syncVendorList('festivo_approved_vendors');
        syncVendorList('festivo_pending_vendors');
        syncVendorList('festivo_custom_vendors');
      } catch (e) {}
    }
    window.dispatchEvent(new Event('storage'));
  }, [packagesList]);

  const addPackageItem = (pkg: Omit<Package, 'id'>) => {
    const newPkg: Package = { ...pkg, id: 'pkg_' + Date.now() };
    setPackagesList(prev => [...prev, newPkg]);
    showToast(`Package "${pkg.name}" added!`);
  };

  const editPackageItem = (id: string, updated: Partial<Package>) => {
    setPackagesList(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    showToast('Package updated successfully!');
  };

  const deletePackageItem = (id: string) => {
    setPackagesList(prev => prev.filter(p => p.id !== id));
    showToast('Package removed', 'info');
  };

  const togglePackagePopular = (id: string) => {
    setPackagesList(prev => prev.map(p => (p.id === id ? { ...p, popular: !p.popular } : p)));
    showToast('Popular tag updated');
  };

  // --- Reviews ---
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    const saved = localStorage.getItem('vendor_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((r: any) => r && !['1', '2', '3'].includes(String(r.id)));
      } catch (err) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_reviews', JSON.stringify(reviewsList));
  }, [reviewsList]);

  const addReviewReply = (id: string, replyText: string) => {
    setReviewsList(prev =>
      prev.map(r => (r.id === id ? { ...r, reply: replyText, reply_date: 'Just now' } : r))
    );
    showToast('Response sent to customer review!');
  };

  const addReviewItem = (rev: Omit<Review, 'id'>) => {
    const newR: Review = { ...rev, id: 'rev_' + Date.now() };
    setReviewsList(prev => [newR, ...prev]);
    showToast('Review submitted');
  };

  // --- Earnings & Transactions ---
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('vendor_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((t: any) => t && !['tx1', 'tx2', 'tx3', 'tx4'].includes(String(t.id)));
      } catch (err) {}
    }
    return [];
  });

  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    localStorage.setItem('vendor_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransactionItem = (tx: Omit<TransactionItem, 'id'>) => {
    const newTx: TransactionItem = { ...tx, id: 'tx_' + Date.now() };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Transaction of ${tx.amount} logged!`);
  };

  // --- Deals ---
  const [dealsList, setDealsList] = useState<DealItem[]>(() => {
    const saved = localStorage.getItem('vendor_deals');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_deals', JSON.stringify(dealsList));
  }, [dealsList]);

  const addDealItem = (deal: Omit<DealItem, 'id'>) => {
    const newD: DealItem = { ...deal, id: 'd_' + Date.now() };
    setDealsList(prev => [newD, ...prev]);
    showToast(`Promo Deal "${deal.code}" created!`);
  };

  const toggleDealStatus = (id: string) => {
    setDealsList(prev =>
      prev.map(d => (d.id === id ? { ...d, status: d.status === 'active' ? 'expired' : 'active' } : d))
    );
    showToast('Deal status updated!');
  };

  const deleteDealItem = (id: string) => {
    setDealsList(prev => prev.filter(d => d.id !== id));
    showToast('Deal deleted', 'info');
  };

  // --- Support Tickets ---
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>(() => {
    const saved = localStorage.getItem('vendor_support_tickets');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('vendor_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  const addSupportTicket = (ticket: Omit<SupportTicketItem, 'id' | 'status' | 'date'>) => {
    const newT: SupportTicketItem = {
      ...ticket,
      id: 'st_' + Date.now(),
      status: 'open',
      date: 'Just now',
    };
    setSupportTickets(prev => [newT, ...prev]);
    showToast('Support ticket submitted! Ticket #' + newT.id.slice(-4));
  };

  // --- Notifications ---
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('vendor_notifications');
    if (saved) return JSON.parse(saved);
    return initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('vendor_notifications', JSON.stringify(notificationsList));
  }, [notificationsList]);

  const markNotificationRead = (id: string) => {
    setNotificationsList(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
  };

  const clearNotifications = () => {
    setNotificationsList([]);
    showToast('Notifications cleared');
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'unread'>) => {
    const newN: NotificationItem = {
      ...notif,
      id: 'n_' + Date.now(),
      unread: true,
    };
    setNotificationsList(prev => [newN, ...prev]);
  };

  // --- Profile Onboarding Tasks ---
  const [profileTasksList, setProfileTasksList] = useState(() => {
    const saved = localStorage.getItem('vendor_profile_tasks');
    if (saved) return JSON.parse(saved);
    return initialProfileTasks;
  });

  useEffect(() => {
    localStorage.setItem('vendor_profile_tasks', JSON.stringify(profileTasksList));
  }, [profileTasksList]);

  const toggleProfileTaskItem = (id: string) => {
    setProfileTasksList((prev: typeof initialProfileTasks) =>
      prev.map((t: { id: string; label: string; done: boolean }) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // --- Vendor Availability ---
  const [isAvailable, setIsAvailable] = useState<boolean>(() => {
    return localStorage.getItem('vendor_availability') !== 'false';
  });

  const toggleAvailability = () => {
    setIsAvailable(prev => {
      const next = !prev;
      localStorage.setItem('vendor_availability', String(next));
      showToast(next ? 'Status set to Accepting Bookings' : 'Status set to Away / Pause Bookings', next ? 'success' : 'info');
      return next;
    });
  };

  return (
    <DataContext.Provider
      value={{
        bookings,
        addBooking,
        updateBookingStatus,
        deleteBooking,

        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,

        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startNewConversation,

        portfolioItems,
        addPortfolioItem,
        deletePortfolioItem,

        packagesList,
        addPackageItem,
        editPackageItem,
        deletePackageItem,
        togglePackagePopular,

        reviewsList,
        addReviewReply,
        addReviewItem,

        transactions,
        addTransactionItem,
        timeframe,
        setTimeframe,

        dealsList,
        addDealItem,
        toggleDealStatus,
        deleteDealItem,

        supportTickets,
        addSupportTicket,

        notificationsList,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        addNotification,

        profileTasksList,
        toggleProfileTaskItem,

        isAvailable,
        toggleAvailability,

        toast,
        showToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
