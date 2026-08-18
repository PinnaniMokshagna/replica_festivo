import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Calendar, Star, TrendingUp, Users, Plus, Settings,
  CheckCircle2, Clock, XCircle, ArrowRight, LogOut, Sparkles,
  BarChart3, Bell, Eye, Wallet, PieChart, Smile, RefreshCw, X, Check,
  Package, MessageSquare, Send, Trash2, Save, Instagram, Facebook, Globe,
  Upload, FileText, CreditCard
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Booking, Vendor } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { useInView } from '../hooks/useInView';

type BookingWithVendor = Booking & { vendor_name?: string };

type VendorService = {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  created_at?: string;
};

type ChatMessage = {
  id: string;
  vendor_id: string;
  customer_email: string;
  customer_name?: string;
  sender_type: 'customer' | 'vendor';
  message: string;
  created_at: string;
};

type VendorProfileData = {
  vendor_id: string;
  business_name: string;
  bio: string;
  gst_number: string;
  pan_number: string;
  bank_account: string;
  ifsc: string;
  instagram: string;
  facebook: string;
  website: string;
};

const QUICK_STATS_EMPTY = [
  { label: 'Total Bookings', value: '0', icon: Calendar, color: 'bg-sage-50 text-sage-600' },
  { label: 'This Month', value: '0', icon: TrendingUp, color: 'bg-sage-100 text-sage-700' },
  { label: 'Avg Rating', value: '—', icon: Star, color: 'bg-cream-100 text-cream-800' },
  { label: 'Total Revenue', value: '₹0', icon: BarChart3, color: 'bg-cream-50 text-cream-900' },
];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bookings, setBookings] = useState<BookingWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'analytics' | 'services' | 'availability' | 'chat' | 'profile'>('overview');
  const [actionMsg, setActionMsg] = useState<{ id: string; text: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Services tab state
  const [services, setServices] = useState<VendorService[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', price: '', duration: '', includes: '' });
  const [serviceLoading, setServiceLoading] = useState(false);

  // Availability tab state
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Chat tab state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Profile tab state
  const [vendorProfile, setVendorProfile] = useState<VendorProfileData | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const statsView = useInView<HTMLDivElement>();
  const listingsView = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (profile && profile.role !== 'vendor') { navigate('/vendors'); return; }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .limit(10);

      const vendorList = vendorData ?? [];
      setVendors(vendorList);

      if (vendorList.length > 0) {
        const ids = vendorList.map(v => v.id);
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*')
          .in('vendor_id', ids)
          .order('created_at', { ascending: false })
          .limit(20);

        if (bookingData) {
          setBookings(bookingData.map(b => ({
            ...b,
            vendor_name: vendorList.find(v => v.id === b.vendor_id)?.name,
          })));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Fetch services when tab opens
  useEffect(() => {
    if (activeTab !== 'services' || vendors.length === 0) return;
    const fetchServices = async () => {
      const { data } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', vendors[0].id);
      if (data) setServices(data as VendorService[]);
    };
    fetchServices();
  }, [activeTab, vendors]);

  // Fetch availability when tab opens
  useEffect(() => {
    if (activeTab !== 'availability' || vendors.length === 0) return;
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      const { data } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', vendors[0].id);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((a: { date: string; is_available: boolean }) => {
          map[a.date] = a.is_available;
        });
        setAvailabilityMap(map);
      }
      setAvailabilityLoading(false);
    };
    fetchAvailability();
  }, [activeTab, vendors]);

  // Fetch chat messages when tab opens
  useEffect(() => {
    if (activeTab !== 'chat' || vendors.length === 0) return;
    const fetchMessages = async () => {
      setChatLoading(true);
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('vendor_id', vendors[0].id)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data as ChatMessage[]);
        if (data.length > 0 && !selectedCustomer) {
          setSelectedCustomer((data[0] as ChatMessage).customer_email);
        }
      }
      setChatLoading(false);
    };
    fetchMessages();
  }, [activeTab, vendors]);

  // Fetch vendor profile when tab opens
  useEffect(() => {
    if (activeTab !== 'profile' || vendors.length === 0) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('vendor_id', vendors[0].id)
        .maybeSingle();
      if (data) {
        setVendorProfile(data as VendorProfileData);
      } else {
        setVendorProfile({
          vendor_id: vendors[0].id,
          business_name: '',
          bio: '',
          gst_number: '',
          pan_number: '',
          bank_account: '',
          ifsc: '',
          instagram: '',
          facebook: '',
          website: '',
        });
      }
    };
    fetchProfile();
  }, [activeTab, vendors]);

  // Services handlers
  const handleAddService = async () => {
    if (!vendors[0] || !serviceForm.title) return;
    setServiceLoading(true);
    const { data, error } = await supabase
      .from('vendor_services')
      .insert({
        vendor_id: vendors[0].id,
        title: serviceForm.title,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        duration: serviceForm.duration,
        includes: serviceForm.includes.split(',').map(s => s.trim()).filter(Boolean),
      })
      .select()
      .single();
    setServiceLoading(false);
    if (!error && data) {
      setServices(prev => [...prev, data as VendorService]);
      setServiceForm({ title: '', description: '', price: '', duration: '', includes: '' });
      setShowServiceForm(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from('vendor_services').delete().eq('id', id);
    if (!error) setServices(prev => prev.filter(s => s.id !== id));
  };

  // Availability handler
  const toggleAvailability = async (date: string) => {
    if (!vendors[0]) return;
    const newStatus = !availabilityMap[date];
    setAvailabilityMap(prev => ({ ...prev, [date]: newStatus }));
    await supabase
      .from('vendor_availability')
      .upsert({ vendor_id: vendors[0].id, date, is_available: newStatus });
  };

  // Chat handler
  const handleSendMessage = async () => {
    if (!vendors[0] || !newMessage.trim() || !selectedCustomer) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      vendor_id: vendors[0].id,
      customer_email: selectedCustomer,
      sender_type: 'vendor',
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    await supabase.from('chat_messages').insert({
      vendor_id: vendors[0].id,
      customer_email: selectedCustomer,
      sender_type: 'vendor',
      message: msg.message,
    });
  };

  // Profile save handler
  const handleSaveProfile = async () => {
    if (!vendorProfile) return;
    setSavingProfile(true);
    await supabase.from('vendor_profiles').upsert(vendorProfile);
    setSavingProfile(false);
  };

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0);
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const avgRating = vendors.length ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1) : '—';

  const stats = [
    { label: 'Total Bookings', value: String(bookings.length), icon: Calendar, color: 'bg-sage-50 text-sage-600' },
    { label: 'This Month', value: String(thisMonth), icon: TrendingUp, color: 'bg-sage-100 text-sage-700' },
    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'bg-cream-100 text-cream-800' },
    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: BarChart3, color: 'bg-cream-50 text-cream-900' },
  ];

  const statusBadge = (status: string) => {
    if (status === 'confirmed') return <span className="flex items-center gap-1 text-xs font-bold text-sage-700 bg-sage-100 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
    if (status === 'pending') return <span className="flex items-center gap-1 text-xs font-bold text-gold-700 bg-gold-100 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    return <span className="flex items-center gap-1 text-xs font-bold text-cream-800 bg-cream-200 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Cancelled</span>;
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    setActionLoading(null);
    if (error) {
      setActionMsg({ id: bookingId, text: `Failed to ${status === 'confirmed' ? 'accept' : 'reject'} booking`, type: 'error' });
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      setActionMsg({ id: bookingId, text: status === 'confirmed' ? 'Booking accepted ✓' : 'Booking rejected', type: 'success' });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Earnings calculations
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const totalEarnings = paidBookings.reduce((s, b) => s + b.total_amount, 0);
  const thisMonthEarnings = paidBookings.filter(b => {
    const d = new Date(b.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, b) => s + b.total_amount, 0);
  const pendingPayout = paidBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_amount, 0);
  const commissionPaid = Math.round(totalEarnings * 0.15);

  // Monthly earnings for last 6 months
  const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthBookings = paidBookings.filter(b => {
      const bd = new Date(b.created_at);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    });
    return {
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      amount: monthBookings.reduce((s, b) => s + b.total_amount, 0),
    };
  });
  const maxEarning = Math.max(...monthlyEarnings.map(m => m.amount), 1);

  // Analytics calculations
  const totalViews = vendors.reduce((s, v) => s + (v.reviews || 0) * 37, 0);
  const conversionRate = bookings.length && totalViews ? ((bookings.length / totalViews) * 100).toFixed(1) : '0.0';
  const avgOrderValue = bookings.length ? Math.round(bookings.reduce((s, b) => s + b.total_amount, 0) / bookings.length) : 0;
  const repeatCustomers = new Set(bookings.map(b => b.customer_email)).size;
  const totalCustomers = bookings.length;
  const repeatRate = totalCustomers ? Math.round(((totalCustomers - repeatCustomers) / totalCustomers) * 100) : 0;

  // Category distribution
  const categoryCounts = vendors.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryEntries = Object.entries(categoryCounts);
  const categoryTotal = categoryEntries.reduce((s, [, c]) => s + c, 0) || 1;
  const categoryColors = ['bg-sage-500', 'bg-gold-500', 'bg-cream-600', 'bg-sage-700', 'bg-gold-600', 'bg-cream-800'];
  const categoryPercents = categoryEntries.map(([cat, count], i) => ({
    cat, count, color: categoryColors[i % categoryColors.length], pct: (count / categoryTotal) * 100,
  }));
  const pieGradient = categoryPercents.map((c, i) => {
    const prev = categoryPercents.slice(0, i).reduce((s, p) => s + p.pct, 0);
    const colorMap = ['#5d8560', '#f59e0b', '#c19350', '#385639', '#d97706', '#846339'];
    return `${colorMap[i % colorMap.length]} ${prev}% ${prev + c.pct}%`;
  }).join(', ');

  // Top listings by reviews (proxy for views/bookings)
  const topListings = [...vendors].sort((a, b) => b.reviews - a.reviews).slice(0, 5).map(v => ({
    name: v.name, category: v.category, views: (v.reviews || 0) * 37, bookings: Math.floor(v.reviews * 0.18), rating: v.rating,
  }));

  // Customer satisfaction gauge
  const avgSatisfaction = vendors.length ? vendors.reduce((s, v) => s + v.rating, 0) / vendors.length : 0;
  const satisfactionPct = (avgSatisfaction / 5) * 100;

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
        <div className="bg-gradient-to-r from-sage-900 to-sage-800 py-8 relative overflow-hidden">
          <div className="orb w-72 h-72 bg-sage-600/20 -top-20 -left-20 opacity-30" />
          <div className="orb w-72 h-72 bg-gold-500/10 -bottom-20 -right-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Vendor'} Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gold-500 text-sage-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Vendor Account
                    </span>
                    <span className="text-sage-200 text-sm">{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            <div className="flex gap-1 mt-6 overflow-x-auto">
              {(['overview', 'bookings', 'services', 'availability', 'earnings', 'analytics', 'chat', 'profile'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${
                    activeTab === tab ? 'bg-white text-sage-600' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <>
              <div
                ref={statsView.ref}
                className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-on-scroll ${statsView.inView ? 'in-view' : ''}`}
              >
                {stats.map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                    <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {vendors.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                  <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Building2 className="w-10 h-10 text-sage-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-sage-900 mb-2">No listings yet</h3>
                  <p className="text-dark-500 max-w-sm mx-auto mb-6">
                    Create your first vendor listing to start receiving bookings from thousands of event planners.
                  </p>
                  <button
                    onClick={() => navigate('/vendors')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all"
                  >
                    <Plus className="w-4 h-4" /> Create Listing
                  </button>
                </div>
              ) : (
                <div
                  ref={listingsView.ref}
                  className={`grid grid-cols-1 lg:grid-cols-3 gap-8 animate-on-scroll ${listingsView.inView ? 'in-view' : ''}`}
                >
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-card p-6">
                      <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-sage-500" /> Recent Bookings
                      </h2>
                      {bookings.length === 0 ? (
                        <div className="text-center py-10">
                          <Clock className="w-10 h-10 text-sage-300 mx-auto mb-3" />
                          <p className="text-dark-500">No bookings yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookings.slice(0, 6).map(booking => (
                            <div key={booking.id} className="flex items-center gap-4 p-4 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-sage-900 text-sm truncate">{booking.customer_name}</p>
                                  {statusBadge(booking.status)}
                                </div>
                                <p className="text-dark-500 text-xs">{booking.event_type} · {new Date(booking.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {booking.guests} guests</p>
                                {booking.vendor_name && <p className="text-dark-400 text-xs mt-0.5">For: {booking.vendor_name}</p>}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sage-900 text-sm">₹{booking.total_amount.toLocaleString('en-IN')}</p>
                                <p className="text-dark-400 text-xs">{booking.booking_ref}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {bookings.length > 6 && (
                        <button onClick={() => setActiveTab('bookings')} className="mt-4 w-full text-sm text-sage-600 font-bold py-2 hover:underline flex items-center justify-center gap-1">
                          View all {bookings.length} bookings <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-card p-6">
                      <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold-500" /> My Listings
                      </h2>
                      <div className="space-y-3">
                        {vendors.slice(0, 4).map(vendor => (
                          <div key={vendor.id} className="flex items-center gap-3 p-3 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors cursor-pointer" onClick={() => navigate(`/vendors/${vendor.slug}`)}>
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                              {vendor.image && !vendor.image.includes('pexels.com') ? (
                                <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">{vendor.category[0] || 'V'}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sage-900 text-sm truncate">{vendor.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                                  <span className="text-dark-700 text-xs font-semibold">{vendor.rating}</span>
                                </div>
                                <span className="text-dark-400 text-xs">· {vendor.category}</span>
                              </div>
                            </div>
                            <Eye className="w-4 h-4 text-sage-500 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-5 h-5 text-gold-400" />
                        <h3 className="font-bold text-white text-sm">Quick Actions</h3>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'View My Listings', action: () => navigate('/vendors') },
                          { label: 'Manage Bookings', action: () => setActiveTab('bookings') },
                          { label: 'Edit Profile', action: () => setActiveTab('profile') },
                        ].map(({ label, action }) => (
                          <button key={label} onClick={action} className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold transition-colors group">
                            {label}
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sage-500" /> All Bookings ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="font-display text-xl font-bold text-sage-900 mb-2">No bookings yet</p>
                  <p className="text-dark-500">Bookings from customers will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sage-100">
                        {['Ref', 'Customer', 'Event', 'Date', 'Guests', 'Amount', 'Status'].map(h => (
                          <th key={h} className="pb-3 text-left text-dark-500 text-xs font-bold uppercase tracking-wider pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-sage-50/50 transition-colors">
                          <td className="py-4 pr-4 font-mono text-xs text-dark-500">{b.booking_ref}</td>
                          <td className="py-4 pr-4">
                            <p className="font-bold text-sage-900 text-sm">{b.customer_name}</p>
                            <p className="text-dark-400 text-xs">{b.customer_email}</p>
                          </td>
                          <td className="py-4 pr-4 text-sm text-dark-700">{b.event_type}</td>
                          <td className="py-4 pr-4 text-sm text-dark-700">{new Date(b.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 pr-4 text-sm text-dark-700">{b.guests}</td>
                          <td className="py-4 pr-4 font-bold text-sage-900 text-sm">₹{b.total_amount.toLocaleString('en-IN')}</td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1.5">
                              {statusBadge(b.status)}
                              {b.status === 'pending' && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                    disabled={actionLoading === b.id}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-gradient-brand rounded-lg hover:shadow-glow transition-all disabled:opacity-50"
                                  >
                                    <Check className="w-3 h-3" /> Accept
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                    disabled={actionLoading === b.id}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-cream-800 bg-cream-200 hover:bg-cream-300 rounded-lg transition-all disabled:opacity-50"
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </button>
                                </div>
                              )}
                              {actionLoading === b.id && (
                                <div className="flex items-center gap-1 text-xs text-dark-400"><RefreshCw className="w-3 h-3 animate-spin" /> Updating...</div>
                              )}
                              {actionMsg?.id === b.id && (
                                <div className={`text-xs font-bold ${actionMsg.type === 'success' ? 'text-sage-600' : 'text-red-600'}`}>{actionMsg.text}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: Wallet, color: 'bg-sage-50 text-sage-600' },
                  { label: 'This Month', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-sage-100 text-sage-700' },
                  { label: 'Pending Payout', value: `₹${pendingPayout.toLocaleString('en-IN')}`, icon: Clock, color: 'bg-gold-100 text-gold-700' },
                  { label: 'Commission Paid', value: `₹${commissionPaid.toLocaleString('en-IN')}`, icon: BarChart3, color: 'bg-cream-100 text-cream-800' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                    <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sage-500" /> Monthly Earnings (Last 6 Months)
                </h2>
                <div className="flex items-end justify-between gap-3 h-56">
                  {monthlyEarnings.map((m, i) => {
                    const barHeight = Math.max((m.amount / maxEarning) * 100, 4);
                    return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '180px' }}>
                        <div
                          className="w-full max-w-[48px] bg-gradient-to-t from-sage-600 to-sage-400 rounded-t-lg transition-all hover:from-sage-700 hover:to-sage-500"
                          style={{ height: barHeight + '%' }}
                          title={'₹' + m.amount.toLocaleString('en-IN')}
                        />
                      </div>
                      <p className="text-xs font-bold text-sage-900">₹{(m.amount / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-dark-400">{m.label}</p>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-sage-500" /> Payout Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sage-100">
                        {['Period', 'Bookings', 'Gross', 'Commission (15%)', 'Net Payout', 'Status'].map(h => (
                          <th key={h} className="pb-3 text-left text-dark-500 text-xs font-bold uppercase tracking-wider pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-50">
                      {monthlyEarnings.map((m, i) => {
                        const monthBookings = paidBookings.filter(b => {
                          const bd = new Date(b.created_at);
                          const md = new Date();
                          md.setMonth(md.getMonth() - (5 - i));
                          return bd.getMonth() === md.getMonth() && bd.getFullYear() === md.getFullYear();
                        });
                        const gross = m.amount;
                        const commission = Math.round(gross * 0.15);
                        const net = gross - commission;
                        return (
                          <tr key={i} className="hover:bg-sage-50/50 transition-colors">
                            <td className="py-4 pr-4 font-bold text-sage-900 text-sm">{m.label}</td>
                            <td className="py-4 pr-4 text-sm text-dark-700">{monthBookings.length}</td>
                            <td className="py-4 pr-4 text-sm text-dark-700">₹{gross.toLocaleString('en-IN')}</td>
                            <td className="py-4 pr-4 text-sm text-cream-800 font-semibold">₹{commission.toLocaleString('en-IN')}</td>
                            <td className="py-4 pr-4 font-bold text-sage-900 text-sm">₹{net.toLocaleString('en-IN')}</td>
                            <td className="py-4">{gross > 0 ? <span className="text-xs font-bold text-sage-700 bg-sage-100 px-2 py-1 rounded-full">Paid</span> : <span className="text-xs font-bold text-dark-400 bg-cream-100 px-2 py-1 rounded-full">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Views', value: totalViews.toLocaleString('en-IN'), icon: Eye, color: 'bg-sage-50 text-sage-600' },
                  { label: 'Conversion Rate', value: conversionRate + '%', icon: TrendingUp, color: 'bg-sage-100 text-sage-700' },
                  { label: 'Avg Order Value', value: '₹' + avgOrderValue.toLocaleString('en-IN'), icon: Wallet, color: 'bg-cream-100 text-cream-800' },
                  { label: 'Repeat Customers', value: repeatRate + '%', icon: Users, color: 'bg-gold-100 text-gold-700' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                    <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-sage-500" /> Category Distribution
                  </h2>
                  {categoryEntries.length === 0 ? (
                    <p className="text-dark-400 text-sm text-center py-8">No listings yet</p>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div
                        className="w-44 h-44 rounded-full shadow-card"
                        style={{ background: 'conic-gradient(' + pieGradient + ')' }}
                      />
                      <div className="w-full space-y-2">
                        {categoryPercents.map(c => (
                          <div key={c.cat} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${c.color}`} />
                            <span className="text-sm font-semibold text-sage-900 flex-1">{c.cat}</span>
                            <span className="text-sm text-dark-500">{c.count} ({c.pct.toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                    <Smile className="w-5 h-5 text-gold-500" /> Customer Satisfaction
                  </h2>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <p className="font-display text-5xl font-bold text-sage-900">{avgSatisfaction.toFixed(1)}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-6 h-6 ${n <= Math.round(avgSatisfaction) ? 'text-gold-500 fill-gold-500' : 'text-cream-200'}`} />
                      ))}
                    </div>
                    <div className="w-full bg-cream-100 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gradient-brand rounded-full transition-all" style={{ width: satisfactionPct + '%' }} />
                    </div>
                    <p className="text-sm text-dark-500">Based on {vendors.reduce((s, v) => s + v.reviews, 0)} reviews</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sage-500" /> Top Performing Listings
                </h2>
                {topListings.length === 0 ? (
                  <p className="text-dark-400 text-sm text-center py-8">No listings yet</p>
                ) : (
                  <div className="space-y-3">
                    {topListings.map((l, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors">
                        <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sage-900 text-sm truncate">{l.name}</p>
                          <p className="text-dark-400 text-xs">{l.category}</p>
                        </div>
                        <div className="flex items-center gap-1 text-dark-500 text-xs">
                          <Eye className="w-3.5 h-3.5" /> {l.views.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 text-dark-500 text-xs w-16">
                          <Calendar className="w-3.5 h-3.5" /> {l.bookings}
                        </div>
                        <div className="flex items-center gap-1 text-gold-600 text-xs font-semibold w-12">
                          <Star className="w-3.5 h-3.5 fill-gold-500" /> {l.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-sage-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-sage-500" /> Services & Packages
                </h2>
                <button
                  onClick={() => setShowServiceForm(s => !s)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Package
                </button>
              </div>

              {showServiceForm && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display text-lg font-bold text-sage-900 mb-4">New Package</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Title</label>
                      <input
                        type="text"
                        value={serviceForm.title}
                        onChange={e => setServiceForm(s => ({ ...s, title: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="e.g. Premium Wedding Photography"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        value={serviceForm.price}
                        onChange={e => setServiceForm(s => ({ ...s, price: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="49999"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Description</label>
                      <textarea
                        value={serviceForm.description}
                        onChange={e => setServiceForm(s => ({ ...s, description: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="What's included in this package..."
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Duration</label>
                      <input
                        type="text"
                        value={serviceForm.duration}
                        onChange={e => setServiceForm(s => ({ ...s, duration: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="e.g. 8 hours"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Includes (comma-separated)</label>
                      <input
                        type="text"
                        value={serviceForm.includes}
                        onChange={e => setServiceForm(s => ({ ...s, includes: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="Album, Drone, Prints"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleAddService}
                      disabled={serviceLoading || !serviceForm.title}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-sm disabled:opacity-50"
                    >
                      {serviceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Package
                    </button>
                    <button
                      onClick={() => setShowServiceForm(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-cream-300 text-cream-800 font-bold rounded-xl hover:bg-cream-100 transition-all text-sm"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {services.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                  <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Package className="w-10 h-10 text-sage-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-sage-900 mb-2">No packages yet</h3>
                  <p className="text-dark-500 max-w-sm mx-auto">Create service packages to showcase what you offer to customers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map(svc => (
                    <div key={svc.id} className="bg-white rounded-2xl shadow-card p-5 card-hover">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-sage-50 text-sage-600 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>
                        <button
                          onClick={() => handleDeleteService(svc.id)}
                          className="w-8 h-8 flex items-center justify-center text-cream-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-display text-lg font-bold text-sage-900 mb-1">{svc.title}</h3>
                      <p className="text-dark-500 text-sm mb-3 line-clamp-2">{svc.description}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-display text-xl font-bold text-sage-900">₹{svc.price?.toLocaleString('en-IN')}</span>
                        <span className="text-dark-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.duration}</span>
                      </div>
                      {svc.includes && svc.includes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {svc.includes.map((inc, i) => (
                            <span key={i} className="text-xs font-semibold text-sage-700 bg-sage-100 px-2 py-1 rounded-full">{inc}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-sage-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sage-500" /> Set Availability
                </h2>
                {availabilityLoading && <RefreshCw className="w-4 h-4 text-sage-500 animate-spin" />}
              </div>
              <p className="text-dark-500 text-sm">Toggle your availability for the next 30 days. Green = Available, Red = Booked.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 30 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const dateKey = d.toISOString().split('T')[0];
                  const isAvailable = availabilityMap[dateKey] ?? true;
                  return (
                    <button
                      key={i}
                      onClick={() => toggleAvailability(dateKey)}
                      className={`rounded-2xl p-4 text-left transition-all card-hover ${
                        isAvailable
                          ? 'bg-sage-50 border-2 border-sage-200 hover:border-sage-500'
                          : 'bg-red-50 border-2 border-red-200 hover:border-red-500'
                      }`}
                    >
                      <p className={`font-display text-2xl font-bold ${isAvailable ? 'text-sage-900' : 'text-red-900'}`}>
                        {d.getDate()}
                      </p>
                      <p className={`text-xs font-semibold mb-2 ${isAvailable ? 'text-sage-700' : 'text-red-700'}`}>
                        {d.toLocaleDateString('en-IN', { month: 'short' })}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                        isAvailable ? 'bg-sage-200 text-sage-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {isAvailable ? <><Check className="w-3 h-3" /> Available</> : <><X className="w-3 h-3" /> Booked</>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sage-500" /> Customer Chat
              </h2>
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="font-display text-xl font-bold text-sage-900 mb-2">No messages yet</p>
                  <p className="text-dark-500">When customers message you, conversations will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
                  {/* Conversation list */}
                  <div className="md:col-span-1 border border-sage-100 rounded-xl overflow-y-auto">
                    {Object.entries(
                      messages.reduce((acc, m) => {
                        (acc[m.customer_email] = acc[m.customer_email] || []).push(m);
                        return acc;
                      }, {} as Record<string, ChatMessage[]>)
                    ).map(([email, msgs]) => (
                      <button
                        key={email}
                        onClick={() => setSelectedCustomer(email)}
                        className={`w-full text-left p-4 border-b border-sage-50 transition-colors ${
                          selectedCustomer === email ? 'bg-sage-100' : 'hover:bg-sage-50/60'
                        }`}
                      >
                        <p className="font-bold text-sage-900 text-sm truncate">{email}</p>
                        <p className="text-dark-400 text-xs truncate">{msgs[msgs.length - 1]?.message}</p>
                      </button>
                    ))}
                  </div>

                  {/* Message panel */}
                  <div className="md:col-span-2 flex flex-col border border-sage-100 rounded-xl">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages
                        .filter(m => m.customer_email === selectedCustomer)
                        .map(m => (
                          <div
                            key={m.id}
                            className={`flex ${m.sender_type === 'vendor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                                m.sender_type === 'vendor'
                                  ? 'bg-gradient-brand text-white rounded-br-sm'
                                  : 'bg-sage-100 text-sage-900 rounded-bl-sm'
                              }`}
                            >
                              {m.message}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-sage-100 flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-sm disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sage-500" /> Account Settings
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">Full Name</label>
                    <div className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 text-sm bg-sage-50/60">
                      {profile?.full_name || user?.email?.split('@')[0] || '—'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">Email Address</label>
                    <div className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sage-900 text-sm bg-sage-50/60">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-dark-700 font-bold text-sm mb-1.5">Account Role</label>
                    <div className="w-full px-4 py-3 border border-gold-200 rounded-xl text-gold-700 text-sm bg-gold-50 flex items-center gap-2 font-semibold">
                      <Star className="w-4 h-4" /> Vendor Account
                    </div>
                  </div>
                </div>
              </div>

              {vendorProfile && (
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sage-500" /> Business Profile
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Business Name</label>
                      <input
                        type="text"
                        value={vendorProfile.business_name}
                        onChange={e => setVendorProfile(p => p ? { ...p, business_name: e.target.value } : p)}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="Your business name"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5">Bio / Description</label>
                      <textarea
                        value={vendorProfile.bio}
                        onChange={e => setVendorProfile(p => p ? { ...p, bio: e.target.value } : p)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="Tell customers about your business..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5">GST Number</label>
                        <input
                          type="text"
                          value={vendorProfile.gst_number}
                          onChange={e => setVendorProfile(p => p ? { ...p, gst_number: e.target.value } : p)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5">PAN Number</label>
                        <input
                          type="text"
                          value={vendorProfile.pan_number}
                          onChange={e => setVendorProfile(p => p ? { ...p, pan_number: e.target.value } : p)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                          placeholder="AAAAA0000A"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Bank Account</label>
                        <input
                          type="text"
                          value={vendorProfile.bank_account}
                          onChange={e => setVendorProfile(p => p ? { ...p, bank_account: e.target.value } : p)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                          placeholder="0000 0000 0000"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5">IFSC Code</label>
                        <input
                          type="text"
                          value={vendorProfile.ifsc}
                          onChange={e => setVendorProfile(p => p ? { ...p, ifsc: e.target.value } : p)}
                          className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                          placeholder="HDFC0000000"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-sage-900 mt-8 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sage-500" /> Social Links
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5 flex items-center gap-1"><Instagram className="w-3.5 h-3.5" /> Instagram</label>
                      <input
                        type="text"
                        value={vendorProfile.instagram}
                        onChange={e => setVendorProfile(p => p ? { ...p, instagram: e.target.value } : p)}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="@yourbusiness"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5 flex items-center gap-1"><Facebook className="w-3.5 h-3.5" /> Facebook</label>
                      <input
                        type="text"
                        value={vendorProfile.facebook}
                        onChange={e => setVendorProfile(p => p ? { ...p, facebook: e.target.value } : p)}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="facebook.com/yourbusiness"
                      />
                    </div>
                    <div>
                      <label className="block text-dark-700 font-bold text-sm mb-1.5 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Website</label>
                      <input
                        type="text"
                        value={vendorProfile.website}
                        onChange={e => setVendorProfile(p => p ? { ...p, website: e.target.value } : p)}
                        className="w-full px-4 py-2.5 border border-sage-200 rounded-xl text-sage-900 text-sm focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none"
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all text-sm disabled:opacity-50"
                    >
                      {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                    </button>
                    <button
                      onClick={async () => { await signOut(); navigate('/'); }}
                      className="flex items-center gap-2 px-5 py-2.5 border border-cream-300 text-cream-800 font-bold rounded-xl hover:bg-cream-100 hover:border-cream-400 transition-all text-sm"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
