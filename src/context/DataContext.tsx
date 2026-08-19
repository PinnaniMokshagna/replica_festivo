import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  type BookingStatus,
  type NotificationItem,
  type Package,
  type Review,
  notifications as initialNotifications,
  profileTasks as initialProfileTasks,
} from '@/lib/dashboard-data';
import { supabase } from '@/lib/supabase';
import {
  fetchPackagesForVendor,
  createVendorPackage,
  updateVendorPackage,
  deleteVendorPackage,
  fetchBookingsForVendor,
  updateBookingStatusInDb,
  fetchVendorCalendar,
  addVendorCalendarEvent,
  deleteVendorCalendarEvent,
  fetchVendorPortfolio,
  addVendorPortfolioItem,
  deleteVendorPortfolioItem,
  fetchVendorDeals,
  addVendorDeal,
  fetchReviewsForVendor,
} from '@/lib/supabase-service';
import { syncVendorToCustomerDirectory } from '@/lib/vendorSync';

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
  bookings: ExtendedBooking[];
  addBooking: (booking: Omit<ExtendedBooking, 'id'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;

  calendarEvents: CalendarEventItem[];
  addCalendarEvent: (event: Omit<CalendarEventItem, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  conversations: ChatConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startNewConversation: (customerName: string, service: string) => void;

  portfolioItems: PortfolioProject[];
  addPortfolioItem: (item: Omit<PortfolioProject, 'id' | 'views' | 'likes'>) => void;
  deletePortfolioItem: (id: string) => void;

  packagesList: Package[];
  addPackageItem: (pkg: Omit<Package, 'id'>) => void;
  editPackageItem: (id: string, pkg: Partial<Package>) => void;
  deletePackageItem: (id: string) => void;
  togglePackagePopular: (id: string) => void;

  reviewsList: Review[];
  addReviewReply: (id: string, replyText: string) => void;
  addReviewItem: (rev: Omit<Review, 'id'>) => void;

  transactions: TransactionItem[];
  addTransactionItem: (tx: Omit<TransactionItem, 'id'>) => void;
  timeframe: 'weekly' | 'monthly' | 'yearly';
  setTimeframe: (tf: 'weekly' | 'monthly' | 'yearly') => void;

  dealsList: DealItem[];
  addDealItem: (deal: Omit<DealItem, 'id'>) => void;
  toggleDealStatus: (id: string) => void;
  deleteDealItem: (id: string) => void;

  supportTickets: SupportTicketItem[];
  addSupportTicket: (ticket: Omit<SupportTicketItem, 'id' | 'status' | 'date'>) => void;

  notificationsList: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'unread'>) => void;

  profileTasksList: { id: string; label: string; done: boolean }[];
  toggleProfileTaskItem: (id: string) => void;

  isAvailable: boolean;
  toggleAvailability: () => void;

  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [vendorEmail, setVendorEmail] = useState<string>('');
  const [vendorSlug, setVendorSlug] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setVendorEmail(user.email);
        setVendorSlug(user.email.split('@')[0]);
      }
    });
  }, []);

  // --- Bookings ---
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);

  useEffect(() => {
    if (!vendorEmail && !vendorSlug) return;
    const loadVendorBookings = async () => {
      const data = await fetchBookingsForVendor(vendorEmail || vendorSlug);
      if (data && data.length > 0) {
        setBookings(
          data.map(b => ({
            id: b.id,
            customer: b.customer_name,
            avatar: b.customer_name.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU',
            type: b.event_type,
            date: b.event_date,
            time: '10:00 AM',
            location: 'Client Location',
            budget: `₹${b.total_amount?.toLocaleString('en-IN')}`,
            status: (b.status as BookingStatus) || 'confirmed',
            notes: b.special_requests || '',
          }))
        );
      }
    };
    loadVendorBookings();
  }, [vendorEmail, vendorSlug]);

  const addBooking = (booking: Omit<ExtendedBooking, 'id'>) => {
    const newB: ExtendedBooking = { ...booking, id: 'bk_' + Date.now() };
    setBookings(prev => [newB, ...prev]);
    showToast(`Booking for ${booking.customer} created successfully!`);
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    await updateBookingStatusInDb(id, status as any);
    showToast(`Booking status updated to ${status.toUpperCase()}`);
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast('Booking removed', 'info');
  };

  // --- Calendar Events ---
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);

  useEffect(() => {
    if (!vendorEmail) return;
    fetchVendorCalendar(vendorEmail).then(data => {
      if (data && data.length > 0) {
        setCalendarEvents(
          data.map(e => ({
            id: e.id,
            title: e.title,
            time: e.time,
            date: e.date,
            location: e.location || '',
            customer: e.customer || '',
          }))
        );
      }
    });
  }, [vendorEmail]);

  const addCalendarEvent = async (event: Omit<CalendarEventItem, 'id'>) => {
    const newE: CalendarEventItem = { ...event, id: 'ev_' + Date.now() };
    setCalendarEvents(prev => [...prev, newE]);
    if (vendorEmail) {
      await addVendorCalendarEvent({ ...event, vendor_email: vendorEmail });
    }
    showToast(`Event "${event.title}" added to calendar!`);
  };

  const deleteCalendarEvent = async (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    await deleteVendorCalendarEvent(id);
    showToast('Event deleted from calendar', 'info');
  };

  // --- Messages & Conversations ---
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');

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
  };

  // --- Portfolio Items ---
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>([]);

  useEffect(() => {
    if (!vendorEmail) return;
    fetchVendorPortfolio(vendorEmail).then(data => {
      if (data && data.length > 0) {
        setPortfolioItems(
          data.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            imageUrl: p.image_url,
            description: p.description,
            views: p.views || 1,
            likes: p.likes || 0,
            date: p.date || 'Recent',
          }))
        );
      }
    });
  }, [vendorEmail]);

  const addPortfolioItem = async (item: Omit<PortfolioProject, 'id' | 'views' | 'likes'>) => {
    const newItem: PortfolioProject = {
      ...item,
      id: 'p_' + Date.now(),
      views: 1,
      likes: 0,
    };
    setPortfolioItems(prev => [newItem, ...prev]);
    if (vendorEmail) {
      await addVendorPortfolioItem({
        vendor_email: vendorEmail,
        title: item.title,
        category: item.category,
        image_url: item.imageUrl,
        description: item.description,
      });
    }
    showToast('New project added to portfolio!');
  };

  const deletePortfolioItem = async (id: string) => {
    setPortfolioItems(prev => prev.filter(p => p.id !== id));
    await deleteVendorPortfolioItem(id);
    showToast('Portfolio item deleted', 'info');
  };

  // --- Packages ---
  const [packagesList, setPackagesList] = useState<Package[]>([]);

  useEffect(() => {
    if (!vendorSlug && !vendorEmail) return;
    fetchPackagesForVendor(vendorSlug, vendorEmail).then(pkgs => {
      if (pkgs && pkgs.length > 0) {
        setPackagesList(
          pkgs.map(p => ({
            id: p.id || 'pkg_' + Date.now(),
            name: p.name,
            category: p.category,
            packageType: p.package_type || 'Standard',
            price: p.price,
            shortDescription: p.short_description,
            detailedDescription: p.detailed_description,
            coverImage: p.cover_image,
            galleryImages: p.gallery_images,
            services: p.services,
            popular: p.popular,
          }))
        );
      }
    });
  }, [vendorSlug, vendorEmail]);

  const addPackageItem = async (pkg: Omit<Package, 'id'>) => {
    const newPkg: Package = { ...pkg, id: 'pkg_' + Date.now() };
    setPackagesList(prev => [...prev, newPkg]);

    await createVendorPackage({
      vendor_email: vendorEmail,
      vendor_slug: vendorSlug,
      name: pkg.name,
      category: pkg.category,
      package_type: pkg.packageType,
      price: pkg.price,
      short_description: pkg.shortDescription,
      detailed_description: pkg.detailedDescription,
      cover_image: pkg.coverImage,
      gallery_images: pkg.galleryImages,
      services: pkg.services,
      popular: pkg.popular,
    });

    syncVendorToCustomerDirectory([...packagesList, newPkg] as any[]);
    showToast(`Package "${pkg.name}" created and published to Supabase!`, 'success');
  };

  const editPackageItem = async (id: string, updated: Partial<Package>) => {
    setPackagesList(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    await updateVendorPackage(id, updated as any);
    showToast('Package updated successfully in Supabase!', 'success');
  };

  const deletePackageItem = async (id: string) => {
    setPackagesList(prev => prev.filter(p => p.id !== id));
    await deleteVendorPackage(id);
    showToast('Package removed from Supabase', 'info');
  };

  const togglePackagePopular = async (id: string) => {
    const pkg = packagesList.find(p => p.id === id);
    if (pkg) {
      const next = !pkg.popular;
      setPackagesList(prev => prev.map(p => (p.id === id ? { ...p, popular: next } : p)));
      await updateVendorPackage(id, { popular: next });
      showToast('Popular tier tag updated');
    }
  };

  // --- Reviews ---
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  useEffect(() => {
    if (!vendorSlug) return;
    fetchReviewsForVendor(vendorSlug).then(data => {
      if (data && data.length > 0) {
        setReviewsList(
          data.map(r => ({
            id: r.id,
            author: r.customer_name,
            customer: r.customer_name,
            rating: r.rating,
            comment: r.comment,
            date: r.date || 'Recent',
            service: 'Event Service',
            avatar: r.customer_name.split(' ').map(n => n[0]).join('').toUpperCase() || 'CU',
            reply: r.vendor_reply,
          }))
        );
      }
    });
  }, [vendorSlug]);

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
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const addTransactionItem = (tx: Omit<TransactionItem, 'id'>) => {
    const newTx: TransactionItem = { ...tx, id: 'tx_' + Date.now() };
    setTransactions(prev => [newTx, ...prev]);
    showToast(`Transaction of ${tx.amount} logged!`);
  };

  // --- Deals ---
  const [dealsList, setDealsList] = useState<DealItem[]>([]);

  useEffect(() => {
    if (!vendorEmail) return;
    fetchVendorDeals(vendorEmail).then(data => {
      if (data && data.length > 0) {
        setDealsList(
          data.map(d => ({
            id: d.id,
            code: d.code,
            discount: d.discount,
            validTill: d.valid_till,
            packageName: d.package_name,
            status: d.status,
          }))
        );
      }
    });
  }, [vendorEmail]);

  const addDealItem = async (deal: Omit<DealItem, 'id'>) => {
    const newD: DealItem = { ...deal, id: 'd_' + Date.now() };
    setDealsList(prev => [newD, ...prev]);
    if (vendorEmail) {
      await addVendorDeal({
        vendor_email: vendorEmail,
        code: deal.code,
        discount: deal.discount,
        valid_till: deal.validTill,
        package_name: deal.packageName,
        status: deal.status,
      });
    }
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
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);

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
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(initialNotifications);

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
  const [profileTasksList, setProfileTasksList] = useState(initialProfileTasks);

  const toggleProfileTaskItem = (id: string) => {
    setProfileTasksList((prev: typeof initialProfileTasks) =>
      prev.map((t: { id: string; label: string; done: boolean }) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // --- Vendor Availability ---
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const toggleAvailability = () => {
    setIsAvailable(prev => {
      const next = !prev;
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
