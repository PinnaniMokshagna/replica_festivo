import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Star, MapPin, CheckCircle2, Sparkles,
  Search, Heart, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useInView } from '../hooks/useInView';
import { supabase } from '../lib/supabase';
import type { Vendor } from '../lib/supabase';
import { getCategory, CATEGORIES } from '../lib/categories';
import { dataCache } from '../lib/cache';
import { MOCK_VENDORS, getVendorImageAndGallery } from '../lib/vendors';
import { useSavedVendors } from '../lib/savedVendors';

export default function CategoryDetailPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const { isSaved, toggleSave } = useSavedVendors();

  const heroRef = useInView<HTMLDivElement>();
  const gridRef = useInView<HTMLDivElement>();

  const cat = category ? getCategory(decodeURIComponent(category)) : undefined;

  useEffect(() => {
    if (!cat) { navigate('/explore'); return; }

    const isCategoryMatch = (vCategory: string, catLabel: string) => {
      const v = (vCategory || '').toLowerCase().trim();
      const c = (catLabel || '').toLowerCase().trim();
      if (v === c) return true;
      if ((c.includes('makeup') || c.includes('beauty')) && (v.includes('makeup') || v.includes('beauty'))) return true;
      if ((c.includes('photo') || c.includes('video')) && (v.includes('photo') || v.includes('video'))) return true;
      if (c.includes('cater') && v.includes('cater')) return true;
      if (c.includes('decor') && v.includes('decor')) return true;
      if (c.includes('venue') && v.includes('venue')) return true;
      if (c.includes('music') && v.includes('music')) return true;
      return v.includes(c) || c.includes(v);
    };

    const approvedRaw = localStorage.getItem('festivo_approved_vendors');
    let approvedList: Vendor[] = [];
    if (approvedRaw) {
      try { approvedList = JSON.parse(approvedRaw); } catch (e) {}
    }

    const pendingRaw = localStorage.getItem('festivo_pending_vendors');
    if (pendingRaw) {
      try {
        const pendingList = JSON.parse(pendingRaw);
        const verifiedPending = pendingList.filter((p: any) => p.verified === true || p.details?.status === 'Approved');
        verifiedPending.forEach((p: any) => {
          if (!approvedList.some(a => a.id === p.id || a.name === p.name || a.slug === p.slug)) {
            approvedList.push(p);
          }
        });
      } catch (e) {}
    }

    const combinedAll = [...approvedList, ...MOCK_VENDORS];
    const deduplicated = combinedAll.filter((v, idx, self) =>
      idx === self.findIndex((t) => t.id === v.id || t.name === v.name || t.slug === v.slug)
    );

    const matchingVendors = deduplicated.filter(v => isCategoryMatch(v.category, cat.label));
    setVendors(matchingVendors.length > 0 ? matchingVendors : deduplicated);
    setLoading(false);
  }, [cat, navigate]);

  if (!cat) return null;

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        {/* Hero */}
        <section ref={heroRef.ref} className="bg-gradient-to-br from-sage-900 to-sage-800 py-16 relative overflow-hidden">
          <div className="orb w-96 h-96 bg-sage-600/20 -top-20 -left-20" />
          <div className="orb w-72 h-72 bg-gold-500/10 bottom-0 right-10" style={{ animationDelay: '2s' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 text-sage-200 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Back to All Categories</span>
            </button>

            <div className={`flex flex-col md:flex-row items-start gap-8 transition-all duration-700 ${heroRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-glow`}>
                    <cat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <span className="text-sage-300 text-sm font-bold tracking-widest uppercase">Category</span>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{cat.label}</h1>
                  </div>
                </div>
                <p className="text-sage-200 text-lg max-w-2xl font-medium leading-relaxed mb-6">{cat.description}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                    <p className="text-sage-300 text-xs font-bold uppercase">Starting from</p>
                    <p className="text-white font-display text-lg font-bold">{cat.startingPrice}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                    <p className="text-sage-300 text-xs font-bold uppercase">Available Vendors</p>
                    <p className="text-white font-display text-lg font-bold">{vendors.length}+</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden shadow-card-hover flex-shrink-0">
                {cat.image ? (
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                    <cat.icon className="w-16 h-16 text-white/35" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What They Do */}
        <section className="py-12 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <span className="inline-block text-sage-600 text-sm font-bold tracking-widest uppercase mb-2">About This Service</span>
                <h2 className="font-display text-2xl font-bold text-sage-900 mb-4">What {cat.label}s Do</h2>
                <p className="text-dark-500 text-sm leading-relaxed font-medium">{cat.longDescription}</p>
              </div>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.whatTheyDo.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-sage-50/60 rounded-xl border border-sage-100 hover:border-sage-300 hover:bg-sage-50 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-dark-700 text-sm font-medium leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vendors in this category */}
        <section className="py-12 bg-cream-50/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-sage-900">Top {cat.label}s</h2>
                <p className="text-dark-500 text-sm font-medium mt-1">Browse verified {cat.label.toLowerCase()}s in your area</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-sage-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage-300 w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="h-48 bg-cream-100 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-cream-100 rounded w-3/4" />
                      <div className="h-4 bg-cream-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-dark-400" />
                </div>
                <p className="font-bold text-sage-900 mb-1">No {cat.label.toLowerCase()}s found</p>
                <p className="text-dark-500 text-sm mb-4">Try a different search or check back soon.</p>
                <button onClick={() => setSearch('')} className="px-5 py-2 bg-gradient-brand text-white font-bold rounded-xl text-sm">
                  Clear Search
                </button>
              </div>
            ) : (
              <div ref={gridRef.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((vendor, i) => (
                  <div
                    key={vendor.id}
                    onMouseEnter={() => setSelectedVendor(vendor.id)}
                    onMouseLeave={() => setSelectedVendor(null)}
                    onClick={() => navigate(`/vendors/${vendor.slug}`)}
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-card cursor-pointer transition-all duration-500 ${
                      selectedVendor === vendor.id
                        ? 'shadow-card-hover scale-[1.02] ring-2 ring-sage-400'
                        : 'hover:shadow-card-hover'
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Glossy overlay effect on hover */}
                    <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ${selectedVendor === vendor.id ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-sage-900/10 via-transparent to-gold-400/10" />
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                    </div>

                    <div className="relative h-52 overflow-hidden">
                      {vendor.image && !vendor.image.includes('pexels.com') ? (
                        <img
                          src={vendor.image}
                          alt={vendor.name}
                          className={`w-full h-full object-cover transition-transform duration-700 ${selectedVendor === vendor.id ? 'scale-110' : 'group-hover:scale-105'}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sage-700 to-sage-900 flex items-center justify-center">
                          <span className="text-white/35 text-5xl font-display font-bold">{vendor.category[0] || 'V'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent" />
                      {vendor.badge && (
                        <span className={`absolute top-3 left-3 ${vendor.badge_color} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>
                          {vendor.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(vendor.id);
                        }}
                        className="absolute top-3 right-3 w-8.5 h-8.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20"
                        title={isSaved(vendor.id) ? "Saved (Click to remove)" : "Save vendor"}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isSaved(vendor.id) ? 'text-red-500 fill-red-500' : 'text-sage-700'}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                          <span className="text-white font-bold text-sm">{vendor.rating}</span>
                        </div>
                        <span className="text-white/70 text-xs">({vendor.reviews})</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="font-display font-bold text-sage-900 text-lg group-hover:text-sage-600 transition-colors">{vendor.name}</h3>
                        {vendor.verified && <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-dark-400" />
                        <span className="text-dark-400 text-sm">{vendor.location}</span>
                      </div>
                      <p className="text-dark-500 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">{vendor.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {vendor.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-dark-600 text-xs bg-cream-50 px-2 py-1 rounded-lg border border-cream-200">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                        <div>
                          <p className="font-display font-bold text-sage-900 text-lg">{vendor.price_unit}{vendor.price_amount.toLocaleString('en-IN')}</p>
                          <p className="text-dark-400 text-xs">{vendor.price_label}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/book/${vendor.slug}`); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-sm font-bold rounded-xl hover:shadow-glow hover:scale-105 transition-all"
                        >
                          Book Now <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Other Categories */}
        <section className="py-12 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold text-sage-900 mb-6">Browse Other Categories</h2>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {CATEGORIES.filter(c => c.label !== cat.label).map(c => (
                <button
                  key={c.label}
                  onClick={() => navigate(`/category/${encodeURIComponent(c.label)}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-cream-50 hover:bg-sage-50 border border-cream-200 hover:border-sage-300 rounded-xl text-sm font-bold text-dark-700 hover:text-sage-700 transition-all whitespace-nowrap flex-shrink-0 group"
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
