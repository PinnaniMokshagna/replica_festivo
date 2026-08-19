import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Users, Wallet, TrendingUp, CheckCircle2,
  XCircle, Clock, Store, Star, Sparkles, ArrowRight, LogOut,
  AlertCircle, Download, Eye, Search, Filter, DollarSign, X, FileText, ExternalLink, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Vendor, Booking } from '../lib/supabase';
import { useInView } from '../hooks/useInView';

type VendorWithProfile = Vendor & {
  approval_status?: string;
  commission_rate?: number;
  subscription_tier?: string;
};

const MOCK_VENDORS: VendorWithProfile[] = [
  {
    id: 'v1',
    name: 'Royal Heritage Palace',
    category: 'Venue',
    location: 'Udaipur, Rajasthan',
    price_amount: 250000,
    price_label: 'per day',
    price_unit: '₹',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    tags: ['Palace', 'Destination', 'Heritage'],
    description: 'A 400-year-old restored heritage palace offering majestic courtyards and royal banquet halls.',
    verified: true,
    badge: 'Heritage Verified',
    badge_color: 'bg-gold-500',
    capacity: '1,500 guests',
    experience_years: 15,
    slug: 'royal-heritage-palace-udaipur',
    created_at: new Date().toISOString(),
  },
  {
    id: 'v2',
    name: 'Aarav Photography & Films',
    category: 'Photographer',
    location: 'Mumbai, Maharashtra',
    price_amount: 85000,
    price_label: 'per day',
    price_unit: '₹',
    rating: 4.8,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800',
    gallery: [],
    tags: ['Candid', 'Cinematic', 'Drone'],
    description: 'Award-winning wedding cinematographer and candid photography team.',
    verified: true,
    badge: 'Top Rated',
    badge_color: 'bg-sage-600',
    capacity: null,
    experience_years: 8,
    slug: 'aarav-photography-mumbai',
    created_at: new Date().toISOString(),
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // Admin Guard: Strict role check
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const isAuth = localStorage.getItem('festivo_admin_authenticated') === 'true';
    return isAuth;
  });

  const [vendors, setVendors] = useState<VendorWithProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'overview' | 'vendors' | 'bookings'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Document Inspection Preview Modal
  const [selectedDocPreview, setSelectedDocPreview] = useState<{
    title: string;
    docType: string;
    fileUrl: string;
    idNumber?: string;
    app?: any;
  } | null>(null);

  const statsView = useInView<HTMLDivElement>();

  // Redirect non-admins immediately
  useEffect(() => {
    const isAuth = localStorage.getItem('festivo_admin_authenticated') === 'true';
    if (!isAuth) {
      navigate('/auth?admin=true');
    }
  }, [navigate]);

  // Load Vendor Applications directly from Supabase
  const loadApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase vendor_applications query error:', error.message);
        return;
      }

      if (data) {
        const formatted = data.map((row: any) => {
          const isApproved = row.status === 'approved';
          const isKycSubmitted = row.status === 'kyc_submitted';
          const isRejected = row.status === 'rejected';

          return {
            id: row.id,
            name: row.business_name || row.owner_name || 'Vendor Partner',
            category: row.category || 'Event Provider',
            location: row.location || 'India',
            email: row.email,
            phone: row.phone || '',
            verified: isApproved,
            status: row.status || 'pending',
            badge: isApproved ? 'Approved' : (isKycSubmitted ? 'KYC Submitted' : (isRejected ? 'Rejected' : 'Pending Review')),
            badge_color: isApproved ? 'bg-sage-600' : (isRejected ? 'bg-red-500' : 'bg-gold-500'),
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
            logo: (row.owner_name || row.business_name || 'V').slice(0, 2).toUpperCase(),
            created_at: row.created_at,
            details: {
              email: row.email,
              phone: row.phone || '',
              owner: row.owner_name || 'Vendor Owner',
              address: row.location || 'India',
              registrationDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : '',
              status: isApproved ? 'Approved' : (isKycSubmitted ? 'Pending Verification' : (isRejected ? 'Rejected' : 'Pending Review')),
              kyc: {
                idNumber: row.govt_id_number || 'Not provided',
                govtIdType: row.govt_id_type || 'Aadhaar Card',
                aadhaarFront: row.govt_id_file_url || '',
                cancelledCheque: row.bank_proof_file_url || '',
                businessRegFile: row.business_reg_file_url || undefined,
                businessRegNumber: row.business_reg_number || undefined,
              }
            }
          };
        });
        setApplications(formatted);
      }
    } catch (e) {
      console.warn('Failed to load applications from Supabase:', e);
    }
  }, []);

  // Live polling & Realtime subscription
  useEffect(() => {
    loadApplications();

    // 1. Polling fallback every 3s
    const pollInterval = setInterval(loadApplications, 3000);

    // 2. Supabase Realtime channel
    const channel = supabase
      .channel('admin_vendor_applications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_applications' }, () => {
        loadApplications();
      })
      .subscribe();

    const onFocus = () => loadApplications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadApplications]);

  // Load Bookings and Vendors for other tabs
  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [vRes, bRes] = await Promise.all([
          supabase.from('vendors').select('*').order('rating', { ascending: false }),
          supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(50)
        ]);

        let vendorList: VendorWithProfile[] = [...MOCK_VENDORS];
        if (vRes?.data && vRes.data.length > 0) {
          const seenIds = new Set(vRes.data.map((v: any) => v.id));
          const mergedMocks = MOCK_VENDORS.filter(m => !seenIds.has(m.id));
          vendorList = [...vRes.data, ...mergedMocks];
        }

        setVendors(vendorList);
        if (bRes?.data) setBookings(bRes.data);
      } catch (e) {
        console.warn('Error loading overview data:', e);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  // APPROVE Action: Updates Supabase status to 'approved' and upserts into public vendors table
  const handleApproveApplication = async (app: any) => {
    const vEmail = (app.email || app.details?.email || '').toLowerCase().trim();
    const vName = app.name || app.details?.owner || 'Vendor';
    setActionLoadingId(app.id);

    // 1. Optimistic UI update
    setApplications(prev => prev.map(a => {
      if (a.id === app.id || a.email === vEmail) {
        return {
          ...a,
          verified: true,
          status: 'approved',
          badge: 'Approved',
          badge_color: 'bg-sage-600',
          details: { ...a.details, status: 'Approved' }
        };
      }
      return a;
    }));

    try {
      // 2. Update Supabase vendor_applications
      await supabase
        .from('vendor_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('email', vEmail);

      // 3. Upsert to public vendors directory
      const slug = (vName || 'vendor').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await supabase.from('vendors').upsert({
        name: vName,
        category: app.category || 'Event Provider',
        location: app.location || app.details?.address || 'Hyderabad, India',
        price_amount: 25000,
        price_label: 'per event',
        price_unit: '₹',
        rating: 5.0,
        reviews: 1,
        image: app.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        description: `${vName} is a verified event service partner on Festivo.`,
        verified: true,
        badge: 'Verified Partner',
        badge_color: 'bg-sage-600',
        slug: slug,
      }, { onConflict: 'slug' });

      // Refresh applications from database
      await loadApplications();
    } catch (e) {
      console.warn('Approve error in Supabase:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // REJECT Action: Updates Supabase status to 'rejected'
  const handleRejectApplication = async (app: any) => {
    const vEmail = (app.email || app.details?.email || '').toLowerCase().trim();
    setActionLoadingId(app.id);

    setApplications(prev => prev.map(a => {
      if (a.id === app.id || a.email === vEmail) {
        return {
          ...a,
          verified: false,
          status: 'rejected',
          badge: 'Rejected',
          badge_color: 'bg-red-500',
          details: { ...a.details, status: 'Rejected' }
        };
      }
      return a;
    }));

    try {
      await supabase
        .from('vendor_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('email', vEmail);

      await loadApplications();
    } catch (e) {
      console.warn('Reject error in Supabase:', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // DELETE single application from Supabase
  const handleDeleteApplication = async (app: any) => {
    if (!window.confirm(`Delete application for "${app.name}"?`)) return;
    const vEmail = (app.email || app.details?.email || '').toLowerCase().trim();

    setApplications(prev => prev.filter(a => a.id !== app.id && a.email !== vEmail));

    try {
      await supabase.from('vendor_applications').delete().eq('email', vEmail);
      await loadApplications();
    } catch (e) {
      console.warn('Delete error:', e);
    }
  };

  // CLEAR ALL applications from Supabase
  const handleClearAllApplications = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL vendor applications?')) return;
    setApplications([]);
    try {
      await supabase.from('vendor_applications').delete().neq('email', '');
      await loadApplications();
    } catch (e) {
      console.warn('Clear all error:', e);
    }
  };

  const handleAdminSignOut = async () => {
    localStorage.removeItem('festivo_admin_authenticated');
    await signOut();
    navigate('/auth?admin=true');
  };

  const pendingCount = applications.filter(a => a.status !== 'approved').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50/50 pt-16">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-sage-900 to-sage-800 py-8 relative overflow-hidden">
        <div className="orb w-72 h-72 bg-sage-600/20 -top-20 -left-20 opacity-30" />
        <div className="orb w-72 h-72 bg-gold-500/10 -bottom-20 -right-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Festivo Platform Admin</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-gold-500 text-sage-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Administrator
                  </span>
                  <span className="text-sage-200 text-sm font-mono">admin@festivo.com</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleAdminSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="flex gap-1 mt-6 overflow-x-auto">
            {(['applications', 'overview', 'vendors', 'bookings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap cursor-pointer ${
                  activeTab === tab ? 'bg-white text-sage-600 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'applications' ? `Applications (${pendingCount} Pending)` : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-sage-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-sage-600" /> Vendor Applications & KYC Inspection
                </h2>
                <p className="text-dark-500 text-sm mt-1 font-medium">
                  Review submitted vendor government identity proofs and banking documents. Clicking Accept instantly unlocks their Vendor Dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-gold-100 text-gold-800 text-xs font-extrabold px-3 py-1.5 rounded-full border border-gold-300">
                  {pendingCount} Pending Review
                </span>
                {applications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllApplications}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 bg-cream-50/50 rounded-2xl border border-dashed border-sage-200">
                <CheckCircle2 className="w-12 h-12 text-sage-500 mx-auto mb-3" />
                <p className="font-bold text-sage-900 text-base">No Applications Found</p>
                <p className="text-dark-500 text-sm mt-1">When vendors register or upload KYC documents, they will appear here live.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id || app.email} className="bg-cream-50/60 rounded-2xl border border-sage-100 p-6 space-y-4 transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sage-800 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                          {app.logo || 'V'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sage-900 text-lg">{app.name}</h3>
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${app.verified || app.status === 'approved' ? 'bg-sage-100 text-sage-800 border-sage-300' : (app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gold-100 text-gold-800 border-gold-300')}`}>
                              {app.badge}
                            </span>
                          </div>
                          <p className="text-dark-500 text-xs font-semibold">
                            Owner: {app.details?.owner} · {app.category} · {app.location}
                          </p>
                          <p className="text-sage-700 text-xs font-mono">{app.email} {app.phone ? `· ${app.phone}` : ''}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {app.status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 px-4 py-2 bg-sage-100 text-sage-800 border border-sage-300 font-extrabold text-xs rounded-xl shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-sage-600" /> Approved & Unlocked
                            </span>
                            <button
                              onClick={() => handleRejectApplication(app)}
                              disabled={actionLoadingId === app.id}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : app.status === 'rejected' ? (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-800 border border-red-300 font-extrabold text-xs rounded-xl">
                              <XCircle className="w-4 h-4 text-red-600" /> Rejected
                            </span>
                            <button
                              onClick={() => handleApproveApplication(app)}
                              disabled={actionLoadingId === app.id}
                              className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl shadow-glow-sage transition-all cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveApplication(app)}
                              disabled={actionLoadingId === app.id}
                              className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl shadow-glow-sage transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                              {actionLoadingId === app.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Accept & Unlock Dashboard
                            </button>
                            <button
                              onClick={() => handleRejectApplication(app)}
                              disabled={actionLoadingId === app.id}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app)}
                          className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Submitted Documents Inspection */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-sage-800 mb-2.5 flex items-center justify-between">
                        <span>Submitted KYC Proofs</span>
                        <span className="text-[11px] text-sage-600 font-semibold normal-case">Click "View Document" to inspect uploaded proofs</span>
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Card 1: Govt Photo ID */}
                        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-sage-100 shadow-sm hover:border-sage-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            {app.details?.kyc?.aadhaarFront ? (
                              <div
                                onClick={() => setSelectedDocPreview({ title: `Government Photo ID (${app.details.kyc.govtIdType || 'Aadhaar'})`, docType: 'Govt Photo ID', fileUrl: app.details.kyc.aadhaarFront, idNumber: app.details.kyc.idNumber, app })}
                                className="w-12 h-10 rounded-lg bg-sage-100 border border-sage-200 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                              >
                                {app.details.kyc.aadhaarFront.startsWith('data:image') || app.details.kyc.aadhaarFront.startsWith('http') ? (
                                  <img src={app.details.kyc.aadhaarFront} alt="ID" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText className="w-5 h-5 text-sage-600" />
                                )}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center flex-shrink-0 text-sage-700">
                                <Shield className="w-5 h-5 text-sage-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-sage-900 text-xs truncate">Govt Photo ID ({app.details?.kyc?.govtIdType || 'Aadhaar'})</p>
                              <p className="text-dark-400 font-mono text-[11px] truncate">ID No: {app.details?.kyc?.idNumber || 'Attached'}</p>
                            </div>
                          </div>

                          {app.details?.kyc?.aadhaarFront ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDocPreview({ title: `Government Photo ID (${app.details.kyc.govtIdType || 'Aadhaar'})`, docType: 'Govt Photo ID', fileUrl: app.details.kyc.aadhaarFront, idNumber: app.details.kyc.idNumber, app })}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-50 hover:bg-sage-100 text-sage-800 font-extrabold text-xs rounded-xl border border-sage-200 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-sage-600" /> View Document
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-dark-400">Not Uploaded</span>
                          )}
                        </div>

                        {/* Card 2: Banking Proof */}
                        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-sage-100 shadow-sm hover:border-sage-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            {app.details?.kyc?.cancelledCheque ? (
                              <div
                                onClick={() => setSelectedDocPreview({ title: 'Banking Proof (Passbook / Cheque / Bank Statement)', docType: 'Banking Proof', fileUrl: app.details.kyc.cancelledCheque, app })}
                                className="w-12 h-10 rounded-lg bg-gold-100 border border-gold-200 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden"
                              >
                                {app.details.kyc.cancelledCheque.startsWith('data:image') || app.details.kyc.cancelledCheque.startsWith('http') ? (
                                  <img src={app.details.kyc.cancelledCheque} alt="Cheque" className="w-full h-full object-cover" />
                                ) : (
                                  <CreditCard className="w-5 h-5 text-gold-600" />
                                )}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center flex-shrink-0 text-gold-700">
                                <Wallet className="w-5 h-5 text-gold-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-sage-900 text-xs truncate">Banking Proof (Passbook / Cheque / Statement)</p>
                              <p className="text-dark-400 font-mono text-[11px] truncate">Payout Verification</p>
                            </div>
                          </div>

                          {app.details?.kyc?.cancelledCheque ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDocPreview({ title: 'Banking Proof (Passbook / Cheque / Bank Statement)', docType: 'Banking Proof', fileUrl: app.details.kyc.cancelledCheque, app })}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 hover:bg-gold-100 text-gold-900 font-extrabold text-xs rounded-xl border border-gold-200 transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-gold-600" /> View Document
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-dark-400">Not Uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div ref={statsView.ref} className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-on-scroll ${statsView.inView ? 'in-view' : ''}`}>
              {[
                { label: 'Total Vendors', value: String(vendors.length), icon: Store, color: 'bg-sage-100 text-sage-700' },
                { label: 'Total Bookings', value: String(bookings.length), icon: BarChart3, color: 'bg-cream-50 text-cream-900' },
                { label: 'Pending Applications', value: String(pendingCount), icon: Clock, color: 'bg-gold-100 text-gold-800' },
                { label: 'Platform Rating', value: '4.9 ★', icon: Star, color: 'bg-sage-50 text-sage-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-card p-5">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-display text-2xl font-bold text-sage-900">{stat.value}</p>
                  <p className="text-dark-500 text-sm mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sage-500" /> Recent Bookings
                </h2>
                {bookings.length === 0 ? (
                  <p className="text-dark-500 text-sm text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 6).map(b => (
                      <div key={b.id} className="flex items-center gap-3 p-3 bg-sage-50/60 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sage-900 text-sm truncate">{b.customer_name}</p>
                          <p className="text-dark-400 text-xs">{b.event_type} · {new Date(b.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sage-900 text-sm">₹{b.total_amount.toLocaleString('en-IN')}</p>
                          <p className="text-xs font-bold text-sage-600">{b.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Vendors */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold-500" /> Top Rated Vendors
                </h2>
                <div className="space-y-3">
                  {vendors.slice(0, 6).map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-3 bg-sage-50/60 rounded-xl hover:bg-sage-100/60 transition-colors cursor-pointer" onClick={() => navigate(`/vendors/${v.slug}`)}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={v.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sage-900 text-sm truncate">{v.name}</p>
                        <p className="text-dark-400 text-xs">{v.category} · {v.location}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        <span className="font-bold text-sage-900 text-sm">{v.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-6">
            <h2 className="font-display text-2xl font-bold text-sage-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-sage-600" /> All Platform Vendors ({vendors.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vendors.map(v => (
                <div key={v.id} className="p-4 rounded-2xl border border-sage-100 bg-cream-50/50 space-y-3 hover:shadow-md transition-shadow">
                  <img src={v.image} alt={v.name} className="w-full h-40 object-cover rounded-xl" />
                  <div>
                    <h3 className="font-bold text-sage-900 text-base">{v.name}</h3>
                    <p className="text-xs text-dark-500">{v.category} · {v.location}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-sage-100 text-xs">
                    <span className="font-bold text-sage-800">₹{v.price_amount.toLocaleString('en-IN')} {v.price_label}</span>
                    <span className="font-bold text-gold-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" /> {v.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-6">
            <h2 className="font-display text-2xl font-bold text-sage-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-sage-600" /> All Platform Bookings ({bookings.length})
            </h2>
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center justify-between p-4 bg-sage-50/60 rounded-xl border border-sage-100">
                  <div>
                    <p className="font-bold text-sage-900 text-sm">{b.customer_name} ({b.customer_email})</p>
                    <p className="text-dark-400 text-xs">{b.event_type} · Date: {new Date(b.event_date).toLocaleDateString('en-IN')} · Ref: {b.booking_ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sage-900 text-sm">₹{b.total_amount.toLocaleString('en-IN')}</p>
                    <span className="text-xs font-bold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full capitalize">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Full-Screen Document Inspection Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-sage-100 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 border-sage-100">
              <div>
                <h3 className="font-bold text-sage-900 text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sage-600" /> {selectedDocPreview.title}
                </h3>
                {selectedDocPreview.idNumber && (
                  <p className="text-xs text-dark-500 font-mono mt-0.5">Document ID No: {selectedDocPreview.idNumber}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-2 rounded-full text-dark-400 hover:bg-cream-100 hover:text-dark-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-cream-50/70 rounded-2xl p-4 min-h-[350px] border border-sage-100">
              {selectedDocPreview.fileUrl.startsWith('data:application/pdf') ? (
                <iframe src={selectedDocPreview.fileUrl} className="w-full h-96 rounded-xl border" title="Document Preview" />
              ) : (
                <img
                  src={selectedDocPreview.fileUrl}
                  alt="Document Inspection"
                  className="max-h-[500px] max-w-full rounded-xl object-contain shadow-sm"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-sage-100">
              <p className="text-xs text-dark-500">Inspecting submitted proof for: <strong>{selectedDocPreview.app?.name || 'Vendor'}</strong></p>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-6 py-2.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
