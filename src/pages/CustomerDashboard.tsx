import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar, Star, Clock, CheckCircle2, XCircle,
  ArrowRight, Sparkles, Heart, Wallet,
  ChevronRight, MapPin, Users, FileText,
  MessageSquare, PhoneCall, Send, X, ZoomIn, User, LifeBuoy, FileQuestion, Search, Camera, Upload, Trash2
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase, type Booking, type Vendor } from '../lib/supabase';
import { fetchBookingsForCustomer, createReviewInDb } from '../lib/supabase-service';
import { MOCK_VENDORS } from '../lib/vendors';
import { useSavedVendors } from '../lib/savedVendors';
import { useUserAvatar } from '../lib/userAvatar';
import Navbar from '../components/Navbar';
import PaymentsTab, { DEFAULT_RECEIPTS } from '../components/PaymentsTab';
import { useInView } from '../hooks/useInView';

type BookingWithVendor = Booking & { vendor?: Vendor };

const DEMO_BOOKINGS: BookingWithVendor[] = DEFAULT_RECEIPTS;

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'saved' | 'invoices' | 'payments'>('overview');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'bookings', 'saved', 'invoices', 'payments'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'bookings' | 'saved' | 'invoices' | 'payments');
    }
  }, [searchParams]);
  const [reviewingBooking, setReviewingBooking] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Live Chat & Vendor Call Modal States
  const [activeChatVendor, setActiveChatVendor] = useState<{ name: string; category: string; image?: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'vendor'; text: string; time: string }>>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [activeCallVendor, setActiveCallVendor] = useState<{ name: string; phone: string; location: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string; slug?: string } | null>(null);
  const { avatarUrl, setAvatar, removeAvatar } = useUserAvatar();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editPhone, setEditPhone] = useState('+91 8618471424');
  const [avatarInput, setAvatarInput] = useState(avatarUrl || '');

  useEffect(() => {
    if (showProfileModal) {
      setAvatarInput(avatarUrl || '');
    }
  }, [showProfileModal, avatarUrl]);
  
  // 🛟 PhonePe 24x7 Customer Support States
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [showPreviousTickets, setShowPreviousTickets] = useState(false);
  const [savedChats, setSavedChats] = useState<Record<string, { name: string; category: string; image?: string; messages: Array<{ text: string; time: string; sender: string }> }>>(() => {
    try {
      const data = localStorage.getItem('festivo_saved_support_chats');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  });

  const { savedIds, toggleSave } = useSavedVendors();
  const savedVendorList = MOCK_VENDORS.filter(v => savedIds.includes(v.id));

  const statsView = useInView<HTMLDivElement>();

  useEffect(() => {
    const handleOpenModal = () => setShowProfileModal(true);
    window.addEventListener('open-profile-modal', handleOpenModal);

    const params = new URLSearchParams(window.location.search);
    if (params.get('editProfile') === 'true') {
      setShowProfileModal(true);
    }

    return () => {
      window.removeEventListener('open-profile-modal', handleOpenModal);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!user) { navigate('/auth'); return; }
    if (profile && profile.role !== 'customer') { navigate('/vendor-dashboard'); return; }
  }, [user, profile, navigate, authLoading]);

  useEffect(() => {
    if (!user) return;
    const loadBookings = async () => {
      setLoading(true);
      const userEmail = (user.email || '').trim().toLowerCase();
      const userBookings = await fetchBookingsForCustomer(userEmail);
      setBookings(userBookings);
      setLoading(false);
    };

    loadBookings();

    // Subscribe to realtime booking updates for this user
    const channel = supabase
      .channel(`customer-bookings-${user.id || user.email}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Interactive Live Chat & Call Handlers
  const handleOpenChat = (vendorName: string, category: string, image?: string) => {
    setActiveChatVendor({ name: vendorName, category, image });
    if (savedChats[vendorName] && savedChats[vendorName].messages.length > 0) {
      setChatMessages(savedChats[vendorName].messages.map((m, idx) => ({
        id: String(idx + 1),
        sender: m.sender as 'user' | 'vendor',
        text: m.text,
        time: m.time
      })));
    } else {
      const initialMsgs = [
        {
          id: '1',
          sender: 'vendor' as const,
          text: `Namaste! Welcome to ${vendorName}. How can we assist you with your ${category} order details?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setChatMessages(initialMsgs);
      const updatedChats = {
        ...savedChats,
        [vendorName]: {
          name: vendorName,
          category,
          image,
          messages: initialMsgs
        }
      };
      setSavedChats(updatedChats);
      try {
        localStorage.setItem('festivo_saved_support_chats', JSON.stringify(updatedChats));
      } catch (e) {}
    }
  };

  const handleSendMessage = () => {
    if (!chatInputText.trim() || !activeChatVendor) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsgs = [...chatMessages, userMsg];
    setChatMessages(newMsgs);
    const currentText = chatInputText;
    setChatInputText('');

    setTimeout(() => {
      const vendorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'vendor' as const,
        text: `Thank you for your message! ${activeChatVendor.name} support has noted your request ("${currentText}"). Our event manager will confirm your requirements shortly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMsgs = [...newMsgs, vendorReply];
      setChatMessages(finalMsgs);
      setSavedChats(prev => {
        const updated = {
          ...prev,
          [activeChatVendor.name]: {
            name: activeChatVendor.name,
            category: activeChatVendor.category,
            image: activeChatVendor.image,
            messages: finalMsgs
          }
        };
        try {
          localStorage.setItem('festivo_saved_support_chats', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }, 800);
  };

  const handleOpenCall = (vendorName: string, location: string) => {
    setActiveCallVendor({
      name: vendorName,
      phone: '+91 98765 43210',
      location: location || 'Hyderabad, India'
    });
  };

  const upcomingBookings = bookings.filter(b => new Date(b.event_date) >= new Date() && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => new Date(b.event_date) < new Date() || b.status === 'cancelled');
  const totalSpent = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);

  const submitReview = async (booking: Booking) => {
    setReviewSubmitting(true);
    try {
      await createReviewInDb({
        vendor_id: booking.vendor_id,
        booking_id: booking.id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        rating: reviewRating,
        comment: reviewComment,
      });
    } catch (e) {
      console.warn('Could not save review to Supabase:', e);
    }
    setReviewSubmitting(false);
    setReviewingBooking(null);
    setReviewComment('');
    setReviewRating(5);
  };

  const statusBadge = (status: string) => {
    if (status === 'confirmed') return <span className="flex items-center gap-1 text-xs font-bold text-sage-700 bg-sage-100 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 text-xs font-bold text-gold-700 bg-gold-100 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    if (status === 'completed') return <span className="flex items-center gap-1 text-xs font-bold text-sage-700 bg-sage-100 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
    if (status === 'cancelled') return <span className="flex items-center gap-1 text-xs font-bold text-cream-800 bg-cream-200 px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" /> Cancelled</span>;
    return <span className="flex items-center gap-1 text-xs font-bold text-sage-700 bg-sage-100 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        {/* Header Banner */}
        <div className="bg-[#243e2b] py-8 relative overflow-hidden text-white">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div 
                onClick={() => setShowProfileModal(true)}
                className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b5942] via-[#2d4733] to-[#1c3222] border-2 border-white/20 overflow-hidden shadow-lg flex items-center justify-center flex-shrink-0 cursor-pointer group hover:border-gold-400 transition-all"
                title="Click to change or upload profile photo"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white font-bold text-xl tracking-wider uppercase">
                    {(profile?.full_name || user?.email || 'PC').slice(0, 2)}
                  </div>
                )}
                {/* Camera overlay hover badge */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-2xs">
                  <Camera className="w-5 h-5 text-gold-300" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-gold-200 mt-0.5">Edit</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 w-full">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide truncate max-w-full">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm hover:scale-105"
                      title="Edit Account & Profile Settings"
                    >
                      <User className="w-3.5 h-3.5 text-gold-400" /> Edit Profile
                    </button>
                    <button
                      onClick={() => setShowHelpCenter(true)}
                      className="px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-400/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm hover:scale-105"
                      title="Open PhonePe-Style 24x7 Customer Support"
                    >
                      <LifeBuoy className="w-3.5 h-3.5 text-gold-400" /> 24x7 Support
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                  <span className="bg-[#47654e] text-white text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold-400 fill-gold-400" /> Customer
                  </span>
                  <span className="text-white/80 text-xs truncate max-w-[200px] sm:max-w-none">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Sub-header Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 mt-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {(['overview', 'bookings', 'saved', 'payments'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all capitalize whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-white text-sage-900 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab === 'payments' ? 'Invoices & Payments' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                {[
                  {
                    label: 'Total Bookings',
                    value: String(bookings.length),
                    icon: Calendar,
                    iconBg: 'bg-[#ebf3ec] text-[#3b5d43]',
                    action: () => setActiveTab('bookings')
                  },
                  {
                    label: 'Upcoming Events',
                    value: String(upcomingBookings.length),
                    icon: Clock,
                    iconBg: 'bg-[#ebf3ec] text-[#3b5d43]',
                    action: () => setActiveTab('bookings')
                  },
                  {
                    label: 'Total Spent',
                    value: `₹${(totalSpent / 1000).toFixed(0)}K`,
                    icon: Wallet,
                    iconBg: 'bg-[#fbf3e6] text-[#866838]',
                    action: () => setActiveTab('payments')
                  },
                  {
                    label: 'Past Events / Reviews',
                    value: String(pastBookings.length),
                    icon: Star,
                    iconBg: 'bg-[#fcf6ec] text-[#866838]',
                    action: () => setActiveTab('saved')
                  },
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    onClick={stat.action} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100/60 card-hover cursor-pointer hover:border-sage-300 transition-all group relative flex flex-col justify-between min-h-[140px]"
                  >
                    <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-serif text-3xl md:text-4xl font-extrabold text-[#1a3020] mb-1 tracking-tight">{stat.value}</p>
                      <p className="text-dark-500 text-xs md:text-sm font-medium flex items-center justify-between">
                        <span>{stat.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-sage-400 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Upcoming Events */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-sage-100/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-serif text-2xl font-bold text-[#1c3323] flex items-center gap-2.5">
                        <Calendar className="w-6 h-6 text-[#3b5d43]" /> Upcoming Events
                      </h2>
                      <button onClick={() => setActiveTab('bookings')} className="text-dark-600 hover:text-sage-900 text-sm font-semibold flex items-center gap-1 transition-colors">
                        View all <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#ebf3ec] rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-[#3b5d43]" />
                        </div>
                        <p className="font-bold text-[#1c3323] text-lg mb-1">No upcoming events</p>
                        <p className="text-dark-500 text-sm mb-5">Start planning your next celebration!</p>
                        <button onClick={() => navigate('/vendors')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#223a27] text-white font-bold rounded-xl hover:shadow-md transition-all text-sm">
                          Browse Vendors <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingBookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex items-center gap-4 p-4 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors">
                            {booking.vendor && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (booking.vendor?.image) {
                                    setPreviewImage({
                                      url: booking.vendor.image,
                                      title: booking.vendor.name,
                                      subtitle: booking.vendor.category,
                                      slug: booking.vendor.slug
                                    });
                                  }
                                }}
                                className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative group/img border border-sage-200 shadow-xs hover:shadow-md transition-all p-0 bg-transparent block focus:outline-none"
                                title="Click to view photo in full size"
                              >
                                {booking.vendor.image && !booking.vendor.image.includes('pexels.com') ? (
                                  <img 
                                    src={booking.vendor.image} 
                                    alt="" 
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300 pointer-events-none" 
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-xs font-bold">{booking.vendor.category[0] || 'V'}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                                  <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                                </div>
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-sage-900 text-sm truncate">{booking.vendor?.name ?? 'Vendor'}</p>
                                {statusBadge(booking.status)}
                              </div>
                              <p className="text-dark-500 text-xs">{booking.event_type} · {new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {booking.guests} guests</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-sage-900 text-sm">₹{booking.total_amount.toLocaleString('en-IN')}</p>
                              <p className="text-dark-400 text-xs font-mono">{booking.booking_ref}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-4">
                  <div className="bg-[#223a27] text-white rounded-2xl p-6 shadow-md border border-[#2d4b33]">
                    <div className="flex items-center gap-2 mb-5">
                      <Sparkles className="w-5 h-5 text-gold-400" />
                      <h3 className="font-serif text-xl font-bold text-white">Quick Actions</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Browse Vendors', icon: ArrowRight, action: () => navigate('/vendors') },
                        { label: 'Explore Services', icon: Sparkles, action: () => navigate('/explore') },
                      ].map(({ label, icon: Icon, action }) => (
                        <button 
                          key={label} 
                          onClick={action} 
                          className="w-full flex items-center justify-between p-3.5 bg-[#34513a] hover:bg-[#406247] rounded-xl text-white text-sm font-bold transition-all group border border-white/5 shadow-sm"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-gold-400" /> {label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sage-500" /> My Bookings ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="font-display text-xl font-bold text-sage-900 mb-2">No bookings yet</p>
                  <p className="text-dark-500 mb-5">Browse vendors and book your first event!</p>
                  <button onClick={() => navigate('/vendors')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-sm">
                    Browse Vendors <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="border border-sage-100 rounded-2xl p-5 hover:shadow-card transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {booking.vendor && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (booking.vendor?.image) {
                                setPreviewImage({
                                  url: booking.vendor.image,
                                  title: booking.vendor.name,
                                  subtitle: booking.vendor.category,
                                  slug: booking.vendor.slug
                                });
                              }
                            }}
                            className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative group/img border border-sage-200 shadow-xs hover:shadow-md transition-all p-0 bg-transparent block focus:outline-none"
                            title="Click to view photo in full size"
                          >
                            {booking.vendor.image && !booking.vendor.image.includes('pexels.com') ? (
                              <img 
                                src={booking.vendor.image} 
                                alt="" 
                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300 pointer-events-none" 
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-sm font-bold">{booking.vendor.category[0] || 'V'}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                              <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          </button>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sage-900">{booking.vendor?.name ?? 'Vendor'}</p>
                            {statusBadge(booking.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {booking.guests} guests</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.event_type}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display text-lg font-bold text-sage-900">₹{booking.total_amount.toLocaleString('en-IN')}</p>
                          <p className="text-dark-400 text-xs font-mono">{booking.booking_ref}</p>
                        </div>
                      </div>

                      {reviewingBooking === booking.id ? (
                        <div className="mt-4 pt-4 border-t border-sage-100">
                          <p className="font-bold text-sage-900 text-sm mb-3">Write a Review</p>
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button key={n} onClick={() => setReviewRating(n)}>
                                <Star className={`w-7 h-7 ${n <= reviewRating ? 'text-gold-500 fill-gold-500' : 'text-sage-200'}`} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={3}
                            className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 resize-none"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => submitReview(booking)}
                              disabled={reviewSubmitting || !reviewComment.trim()}
                              className="px-5 py-2 bg-gradient-brand text-white font-bold rounded-xl text-sm hover:shadow-glow transition-all disabled:opacity-50"
                            >
                              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button onClick={() => setReviewingBooking(null)} className="px-5 py-2 border border-sage-200 text-sage-700 font-bold rounded-xl text-sm hover:bg-sage-50 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-sage-100 items-center justify-between">
                          <div className="flex items-center gap-3">
                            {booking.vendor && (
                              <button onClick={() => navigate(`/vendors/${booking.vendor?.slug}`)} className="text-xs font-bold text-sage-600 hover:underline flex items-center gap-1">
                                View Vendor <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {booking.status === 'confirmed' && new Date(booking.event_date) < new Date() && (
                              <button onClick={() => setReviewingBooking(booking.id)} className="text-xs font-bold text-gold-600 hover:underline flex items-center gap-1">
                                <Star className="w-3 h-3" /> Write Review
                              </button>
                            )}
                            <button onClick={() => navigate(`/confirmation/${booking.booking_ref}`)} className="text-xs font-bold text-sage-600 hover:underline flex items-center gap-1">
                              <FileText className="w-3 h-3" /> View Receipt
                            </button>
                          </div>

                          {booking.status !== 'cancelled' && (booking.payment_status as string) !== 'paid' && (
                            <button
                              onClick={() => setActiveTab('payments')}
                              className="px-4 py-2 bg-[#2d4733] hover:bg-[#1f3323] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:scale-105"
                            >
                              Proceed to Pay <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Vendors */}
          {activeTab === 'saved' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sage-100">
                <div>
                  <h2 className="font-display text-xl font-bold text-sage-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Vendors ({savedVendorList.length})
                  </h2>
                  <p className="text-dark-500 text-xs mt-1">Your favorited venues, caterers, decorators, and photographers</p>
                </div>
                <button
                  onClick={() => navigate('/vendors')}
                  className="px-4 py-2 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  Browse All Vendors <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedVendorList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedVendorList.map(vendor => (
                    <div key={vendor.id} className="group bg-white rounded-2xl overflow-hidden shadow-card border border-sage-100 hover:shadow-card-hover transition-all duration-300 flex flex-col">
                      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/vendors/${vendor.slug}`)}>
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSave(vendor.id);
                          }}
                          className="absolute top-3 right-3 w-8.5 h-8.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                          title="Remove from saved"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {vendor.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-sage-900 text-base group-hover:text-sage-700 transition-colors">{vendor.name}</h3>
                            <div className="flex items-center gap-1 bg-sage-50 px-2 py-0.5 rounded-lg border border-sage-100">
                              <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                              <span className="text-sage-800 text-xs font-bold">{vendor.rating}</span>
                            </div>
                          </div>
                          <p className="text-dark-500 text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sage-500" /> {vendor.location}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                          <div>
                            <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider block">Starting at</span>
                            <span className="text-sage-950 font-bold text-sm font-mono">{vendor.price_label}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/vendors/${vendor.slug}`)}
                            className="px-4 py-2 bg-gradient-brand text-white font-bold rounded-xl text-xs hover:shadow-glow transition-all flex items-center gap-1"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-sage-50/50 rounded-2xl border border-dashed border-sage-200">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 fill-red-500" />
                  </div>
                  <p className="font-bold text-sage-900 mb-1 text-base">No saved vendors yet</p>
                  <p className="text-dark-500 text-xs mb-5 max-w-sm mx-auto">Tap the ❤️ heart icon on any vendor card to save your favorite event partners here.</p>
                  <button onClick={() => navigate('/vendors')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-xs">
                    Browse Vendors <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Invoices & Payments */}
          {(activeTab === 'invoices' || activeTab === 'payments') && (
            <PaymentsTab
              bookings={bookings}
              setBookings={setBookings}
              userEmail={user?.email}
              userName={user?.user_metadata?.full_name}
              navigate={navigate}
            />
          )}
        </div>
      </div>

      {/* 🟢 Live Vendor Chat Modal */}
      {activeChatVendor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[520px] overflow-hidden border border-sage-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-sage-800 to-sage-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-700 flex items-center justify-center font-bold text-white overflow-hidden">
                  {activeChatVendor.image ? <img src={activeChatVendor.image} alt="" className="w-full h-full object-cover" /> : activeChatVendor.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">{activeChatVendor.name}</h3>
                  <p className="text-xs text-sage-200">{activeChatVendor.category} · Online Support</p>
                </div>
              </div>
              <button onClick={() => setActiveChatVendor(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-sage-50/50">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-sage-600 text-white rounded-br-none' : 'bg-white text-sage-900 border border-sage-200 rounded-bl-none'}`}>
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block mt-1 text-right ${msg.sender === 'user' ? 'text-sage-200' : 'text-dark-400'}`}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 bg-white border-t border-sage-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button onClick={handleSendMessage} className="p-2.5 bg-gradient-brand text-white rounded-xl hover:shadow-glow transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📞 Vendor Call Modal */}
      {activeCallVendor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center border border-sage-200 relative">
            <button onClick={() => setActiveCallVendor(null)} className="absolute top-4 right-4 text-dark-400 hover:text-sage-900">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <PhoneCall className="w-8 h-8" />
            </div>

            <h3 className="font-display text-xl font-bold text-sage-900 mb-1">{activeCallVendor.name}</h3>
            <p className="text-dark-500 text-sm mb-4">{activeCallVendor.location}</p>

            <div className="bg-sage-50 p-4 rounded-xl border border-sage-200 mb-5">
              <p className="text-xs text-sage-600 font-bold uppercase tracking-wider mb-1">Direct Support Number</p>
              <p className="font-mono text-lg font-extrabold text-sage-900">{activeCallVendor.phone}</p>
            </div>

            <a
              href={`tel:${activeCallVendor.phone.replace(/\s+/g, '')}`}
              className="w-full block py-3 bg-gradient-brand text-white font-bold rounded-xl shadow-glow hover:shadow-card-hover transition-all text-sm mb-2"
            >
              Call Vendor Now
            </a>
            <button onClick={() => setActiveCallVendor(null)} className="text-xs font-bold text-sage-600 hover:underline">
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🖼️ Full-Screen Image Preview Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-dark-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-scale-up"
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-sage-900 to-dark-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{previewImage.title}</h3>
                {previewImage.subtitle && (
                  <p className="text-xs text-sage-300 font-medium">{previewImage.subtitle} · Festivo Photo Gallery</p>
                )}
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Image Preview Box */}
            <div className="relative bg-dark-950 max-h-[70vh] flex items-center justify-center overflow-hidden p-3">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200';
                }}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-cream-50 flex items-center justify-between gap-3 border-t border-sage-100">
              <span className="text-xs text-dark-500 font-medium hidden sm:inline">✨ Verified High Resolution Photo</span>
              <div className="flex items-center gap-2 ml-auto">
                {previewImage.slug && (
                  <button
                    onClick={() => {
                      navigate(`/vendors/${previewImage.slug}`);
                      setPreviewImage(null);
                    }}
                    className="px-4 py-2 bg-gradient-brand text-white font-bold rounded-xl text-xs hover:shadow-glow transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" /> View Vendor Page
                  </button>
                )}
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-2 bg-white border border-sage-200 text-sage-800 font-bold rounded-xl text-xs hover:bg-sage-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👤 Professional My Account & Profile Settings Modal */}
      {showProfileModal && (
        <div 
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-dark-900/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[88vh] my-auto overflow-hidden flex flex-col border border-sage-100 animate-scale-up text-dark-900"
          >
            {/* Modal Header - Fixed Top */}
            <div className="p-5 bg-gradient-to-r from-sage-950 via-sage-900 to-dark-900 text-white flex items-center justify-between flex-shrink-0 border-b border-sage-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-lg font-bold shadow-glow flex-shrink-0 overflow-hidden border border-white/20">
                  {avatarInput ? (
                    <img src={avatarInput} alt="Avatar" className="w-full h-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">Account & Profile Settings</h3>
                  <p className="text-xs text-sage-200 font-medium mt-0.5">Manage your photo, name, and identity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Profile Photo / Avatar Picker */}
              <div className="bg-sage-50/80 p-4 rounded-2xl border border-sage-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sage-900 uppercase tracking-wider">Profile Photo</label>
                  {avatarInput && (
                    <button
                      type="button"
                      onClick={() => setAvatarInput('')}
                      className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-brand border-2 border-sage-300 overflow-hidden shadow-md flex items-center justify-center flex-shrink-0">
                    {avatarInput ? (
                      <img src={avatarInput} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white font-bold text-xl uppercase">
                        {(editName || user?.email || 'PC').slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-gradient-brand text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload Local Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatarInput(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-dark-400">Select any photo file from your device.</p>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[11px] font-bold text-dark-500 block mb-2">Or Select a Sample Avatar:</span>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
                    ].map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`Preset ${i}`}
                        onClick={() => setAvatarInput(imgUrl)}
                        className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all hover:scale-110 ${
                          avatarInput === imgUrl ? 'border-sage-600 ring-2 ring-sage-400 scale-105' : 'border-white opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 bg-sage-50 border border-sage-200 rounded-xl text-sm font-semibold text-sage-900 outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 8618471424"
                  className="w-full px-4 py-2.5 bg-sage-50 border border-sage-200 rounded-xl text-sm font-mono text-sage-900 outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-cream-100 border border-cream-200 rounded-xl text-sm font-medium text-dark-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-1">
                <label className="block text-xs font-bold text-dark-500 uppercase tracking-wider mb-1">Security & Account</label>
                <button 
                  type="button"
                  onClick={() => alert(`🔒 Password reset link has been sent to ${user?.email}`)}
                  className="w-full px-4 py-2.5 bg-cream-50 hover:bg-cream-100 border border-cream-200 text-sage-900 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  Send Password Reset Link
                </button>
              </div>
            </div>

            {/* Modal Footer - Fixed Bottom */}
            <div className="p-4 bg-cream-50 border-t border-sage-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-dark-400 font-medium">✨ Festivo Account Identity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-white border border-sage-200 text-sage-800 font-bold rounded-xl text-xs hover:bg-sage-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setProfileSaving(true);
                    setAvatar(avatarInput ? avatarInput.trim() : null);
                    try {
                      if (user?.id) {
                        await supabase.from('profiles').upsert({
                          id: user.id,
                          full_name: editName,
                          phone: editPhone,
                          avatar_url: avatarInput ? avatarInput.trim() : null,
                        });
                      }
                    } catch (e) {
                      console.warn('Could not save profile to Supabase:', e);
                    }
                    setProfileSaving(false);
                    setShowProfileModal(false);
                  }}
                  className="px-5 py-2 bg-gradient-brand text-white font-bold rounded-xl text-xs hover:shadow-glow transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-300" /> {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🛟 PhonePe-Style 24x7 Customer Support Modal */}
      {showHelpCenter && (
        <div 
          onClick={() => setShowHelpCenter(false)}
          className="fixed inset-0 z-[99999] bg-dark-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-hidden border border-sage-100 animate-scale-up flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-sage-950 via-sage-900 to-dark-900 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0 text-white">
                    <LifeBuoy className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="bg-gold-500 text-dark-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        PhonePe Style 24x7
                      </span>
                      <span className="text-sage-200 text-xs font-medium">Instant Resolution Desk</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">Festivo Customer Support</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpCenter(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="w-4 h-4 text-sage-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search issue (e.g. Payment deduction, Refund status, Change date)..."
                  value={helpSearchQuery}
                  onChange={(e) => setHelpSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-white placeholder-sage-300 outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-dark-900">
              {/* Quick Contact Helpline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:180020263378"
                  className="p-3.5 bg-sage-50 hover:bg-sage-100 rounded-2xl border border-sage-200 flex items-center gap-3 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sage-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-dark-500 uppercase">24x7 Toll Free</p>
                    <p className="text-xs font-bold text-sage-900 font-mono">1800-2026-HELP</p>
                  </div>
                </a>

                <button
                  onClick={() => {
                    setShowHelpCenter(false);
                    handleOpenChat('Festivo 24x7 Support Assistant', 'Customer Care');
                  }}
                  className="p-3.5 bg-gold-50 hover:bg-gold-100/80 rounded-2xl border border-gold-200 flex items-center gap-3 transition-colors group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-dark-500 uppercase">Live Chat</p>
                    <p className="text-xs font-bold text-sage-900">Instant AI Chat</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowPreviousTickets(prev => !prev)}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all group text-left ${
                    showPreviousTickets ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300' : 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-blue-900 uppercase">Previous Tickets</p>
                    <p className="text-xs font-bold text-sage-900">{Object.keys(savedChats).length} Saved Tickets</p>
                  </div>
                </button>
              </div>

              {/* Previous Tickets Drawer / List */}
              {showPreviousTickets && (
                <div className="bg-sage-50/80 p-4 rounded-2xl border border-sage-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sage-900 text-xs flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" /> Your Previous Support Tickets & Chats ({Object.keys(savedChats).length})
                    </h4>
                    <button onClick={() => setShowPreviousTickets(false)} className="text-[11px] font-bold text-sage-600 hover:underline">Close</button>
                  </div>
                  {Object.keys(savedChats).length === 0 ? (
                    <p className="text-dark-400 text-xs py-2 italic">No previous tickets or chats found.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {Object.values(savedChats).map((chat) => {
                        const lastMsg = chat.messages[chat.messages.length - 1];
                        return (
                          <div
                            key={chat.name}
                            onClick={() => {
                              setShowHelpCenter(false);
                              handleOpenChat(chat.name, chat.category, chat.image);
                            }}
                            className="p-3 bg-white border border-sage-200 hover:border-sage-400 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-gradient-brand text-white font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {chat.image ? <img src={chat.image} alt="" className="w-full h-full object-cover" /> : chat.name[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sage-900 text-xs truncate group-hover:text-sage-700">{chat.name}</p>
                                <p className="text-[11px] text-dark-500 truncate italic">{lastMsg ? lastMsg.text : 'Open ticket...'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-sage-700 font-bold bg-sage-50 hover:bg-sage-100 border border-sage-200 px-2 py-1 rounded-lg ml-2 whitespace-nowrap">View Ticket</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Popular Help Topics (PhonePe Style FAQs) */}
              <div>
                <h4 className="font-bold text-sage-900 text-sm mb-3 flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-sage-600" /> Frequently Asked Support Topics
                </h4>

                <div className="space-y-2">
                  {[
                    {
                      id: 'faq-1',
                      q: 'Money deducted from bank but booking shows unpaid or pending?',
                      a: 'In rare cases of bank network timeouts, payments can take up to 2 hours to reconcile. If confirmed by your bank, your booking status will automatically update to Paid. Otherwise, a full refund is issued within 3-5 working days.'
                    },
                    {
                      id: 'faq-2',
                      q: 'How do I download my Official GST Tax Receipt?',
                      a: 'Go to Invoices & Payments tab on your dashboard. Click the Download Receipt button next to your booking reference number to open and print your itemized GST Tax Invoice.'
                    },
                    {
                      id: 'faq-3',
                      q: 'Can I reschedule or change my event date?',
                      a: 'Yes, event dates can be rescheduled up to 14 days prior to your booked date without additional charges, subject to venue and vendor calendar availability.'
                    }
                  ].map(faq => (
                    <div key={faq.id} className="border border-sage-100 rounded-xl overflow-hidden bg-sage-50/50">
                      <button
                        onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                        className="w-full p-3.5 text-left font-bold text-xs text-sage-900 flex items-center justify-between hover:bg-sage-100/50 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight className={`w-4 h-4 text-sage-500 transition-transform ${activeFaq === faq.id ? 'rotate-90' : ''}`} />
                      </button>
                      {activeFaq === faq.id && (
                        <div className="p-3.5 bg-white border-t border-sage-100 text-xs text-dark-600 leading-relaxed animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raise a Support Ticket Form */}
              <div className="bg-sage-50/60 p-4 rounded-2xl border border-sage-200">
                <h4 className="font-bold text-sage-900 text-sm mb-1 flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-gold-600" /> Need Further Assistance? Raise a Ticket
                </h4>
                <p className="text-dark-500 text-xs mb-3">Our 24x7 Resolution Team responds within 15 minutes.</p>

                {ticketSubmitted ? (
                  <div className="bg-white p-4 rounded-xl border border-sage-300 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-sage-600 mx-auto" />
                    <p className="font-bold text-sage-900 text-xs">Support Ticket Submitted!</p>
                    <p className="text-dark-500 text-[11px]">Ticket ID: #FEST-SUP-{Math.floor(1000 + Math.random() * 9000)}. We have sent a confirmation email to {user?.email}.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Describe your issue or order reference number..."
                      rows={2}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full p-3 bg-white border border-sage-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sage-400"
                    />
                    <button
                      onClick={() => {
                        if (!ticketMessage.trim()) return;
                        setTicketSubmitted(true);
                        setTimeout(() => {
                          setTicketSubmitted(false);
                          setTicketMessage('');
                        }, 5000);
                      }}
                      className="px-4 py-2 bg-gradient-brand text-white font-bold text-xs rounded-xl shadow-sm hover:scale-105 transition-all"
                    >
                      Submit Support Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
