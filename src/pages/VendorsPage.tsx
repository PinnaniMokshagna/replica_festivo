import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, CheckCircle2, Heart, ArrowRight, X, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useInView } from '../hooks/useInView';
import { supabase } from '../lib/supabase';
import type { Vendor } from '../lib/supabase';
import { dataCache } from '../lib/cache';
import { MOCK_VENDORS, getVendorImageAndGallery } from '../lib/vendors';

import { CATEGORY_LABELS } from '../lib/categories';
const CATEGORIES = ['All', ...CATEGORY_LABELS];
const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'reviews' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];
const PRICE_RANGES = [
  { label: 'All Budgets', min: 0, max: Infinity },
  { label: 'Under ₹20,000', min: 0, max: 20000 },
  { label: '₹20,000 – ₹60,000', min: 20000, max: 60000 },
  { label: '₹60,000 – ₹1,50,000', min: 60000, max: 150000 },
  { label: 'Above ₹1,50,000', min: 150000, max: Infinity },
];

import { useSavedVendors } from '../lib/savedVendors';

function VendorCard({ vendor }: { vendor: Vendor }) {
  const { isSaved, toggleSave } = useSavedVendors();
  const liked = isSaved(vendor.id);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();

  const { image: vendorImage } = getVendorImageAndGallery(vendor);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-cream-200/60 card-hover flex flex-col h-full">
      <div className="relative h-52 overflow-hidden cursor-pointer flex-shrink-0" onClick={() => navigate(`/vendors/${vendor.slug}`)}>
        <>
          <div className={`absolute inset-0 bg-cream-100 transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
          <img
            src={vendorImage}
            alt={vendor.name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        </>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
        {vendor.badge && (
          <div className="absolute top-3 left-3">
            <span className={`${vendor.badge_color} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg`}>{vendor.badge}</span>
          </div>
        )}
        <button 
          type="button"
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            toggleSave(vendor.id);
          }} 
          className="absolute top-3 right-3 w-8.5 h-8.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md z-10"
          title={liked ? "Saved to your list (Click to remove)" : "Save vendor"}
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-sage-700'}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2.5 py-1 rounded-full">{vendor.category}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1.5 cursor-pointer" onClick={() => navigate(`/vendors/${vendor.slug}`)}>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-dark-900 text-lg leading-tight group-hover:text-sage-600 transition-colors">{vendor.name}</h3>
              {vendor.verified && <CheckCircle2 className="w-4 h-4 text-gold-500 flex-shrink-0" />}
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-dark-400" />
            <span className="text-dark-400 text-xs">{vendor.location}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
              <span className="text-sage-700 text-sm font-bold">{vendor.rating}</span>
            </div>
            <span className="text-dark-400 text-xs">({vendor.reviews} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(vendor.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-dark-600 text-xs bg-cream-50 px-2 py-1 rounded-lg border border-cream-200">{tag}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-cream-200 mt-auto">
          <div>
            <p className="text-dark-900 font-bold text-lg leading-none">{vendor.price_unit || '₹'}{(Number(vendor.price_amount) || 0).toLocaleString('en-IN')}</p>
            <p className="text-dark-400 text-xs mt-0.5">{vendor.price_label || 'onwards'}</p>
          </div>
          <button
            onClick={() => navigate(`/book/${vendor.slug}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:shadow-glow hover:scale-105 transition-all duration-200 active:scale-95"
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('reviews');
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [occasionLabel, setOccasionLabel] = useState('');
  const { ref: gridRef, inView: gridInView } = useInView<HTMLDivElement>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const category = searchParams.get('category');
    const occasion = searchParams.get('occasion');
    if (category) {
      setActiveCategory(category);
      setOccasionLabel('');
    } else if (occasion) {
      setOccasionLabel(occasion);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadMergedVendors = () => {
      let baseList = [...MOCK_VENDORS];

      const approvedRaw = localStorage.getItem('festivo_approved_vendors');
      const pendingRaw = localStorage.getItem('festivo_pending_vendors');
      const customRaw = localStorage.getItem('festivo_custom_vendors');

      const extraVendors: Vendor[] = [];
      const seenIds = new Set<string>();

      // 1. Check festivo_approved_vendors FIRST (admin-approved, highest priority)
      if (approvedRaw) {
        try {
          const parsed = JSON.parse(approvedRaw);
          parsed.forEach((item: any) => {
            if (!item.id || seenIds.has(item.id)) return;
            seenIds.add(item.id);
            extraVendors.push({
              id: item.id,
              name: item.name,
              category: item.category || 'Event Provider',
              location: item.location || 'Hyderabad, India',
              price_amount: item.price_amount || 45000,
              price_label: item.price_label || 'Starting Package',
              price_unit: '₹',
              rating: item.rating || 5.0,
              reviews: item.reviews || 1,
              image: item.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
              verified: true,
              badge: 'Verified Partner',
              badge_color: 'bg-sage-600',
              slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
              description: item.details?.bio || 'Verified Event Partner offering premium services.',
              tags: item.tags || [item.category || 'Event', 'Verified', 'Festivo Partner'],
              gallery: item.gallery || [
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
              ]
            } as Vendor);
          });
        } catch (e) {}
      }

      // 2. Also check festivo_pending_vendors for any additionally approved ones
      if (pendingRaw) {
        try {
          const parsed = JSON.parse(pendingRaw);
          parsed.forEach((item: any) => {
            if (!item.id || seenIds.has(item.id)) return;
            const vEmail = (item.details?.email || '').toLowerCase().trim();
            const specStatus = vEmail ? localStorage.getItem(`festivo_kyc_status_${vEmail}`) : null;
            const isApproved = item.verified === true || item.details?.status === 'Approved' || specStatus === 'Approved';

            if (isApproved) {
              seenIds.add(item.id);
              extraVendors.push({
                id: item.id || 'v_custom_01',
                name: item.name,
                category: item.category || 'Photographer',
                location: item.location || 'Koramangala, Bangalore',
                price_amount: item.price_amount || 45000,
                price_label: item.price_label || 'Starting Package',
                price_unit: '₹',
                rating: item.rating || 5.0,
                reviews: item.reviews || 1,
                image: item.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
                verified: true,
                badge: 'Verified Partner',
                badge_color: 'bg-sage-600',
                slug: item.slug || 'vendor-partner',
                description: item.details?.bio || 'Verified Event Partner offering premium services.',
                tags: item.tags || [item.category || 'Event', 'Verified', 'Festivo Partner'],
                gallery: item.gallery || [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
                  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'
                ]
              } as Vendor);
            }
          });
        } catch (e) {}
      }

      // 3. Check festivo_custom_vendors
      if (customRaw) {
        try {
          const parsed = JSON.parse(customRaw);
          parsed.forEach((item: any) => {
            if (!item.id || seenIds.has(item.id)) return;
            const vEmail = (item.details?.email || '').toLowerCase().trim();
            const specStatus = vEmail ? localStorage.getItem(`festivo_kyc_status_${vEmail}`) : null;
            const isApproved = item.verified === true || item.details?.status === 'Approved' || specStatus === 'Approved';

            if (isApproved) {
              seenIds.add(item.id);
              extraVendors.push({
                id: item.id,
                name: item.name,
                category: item.category || 'Event Provider',
                location: item.location || 'Koramangala, Bangalore',
                price_amount: item.price_amount || 45000,
                price_label: item.price_label || 'Starting Package',
                price_unit: '₹',
                rating: item.rating || 5.0,
                reviews: item.reviews || 1,
                image: item.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
                verified: true,
                badge: 'Verified Partner',
                badge_color: 'bg-sage-600',
                slug: item.slug || 'vendor-partner',
                description: item.bio || 'Verified Event Partner offering premium services.',
                tags: item.tags || [item.category || 'Event', 'Verified'],
                gallery: item.gallery || [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'
                ]
              } as Vendor);
            }
          });
        } catch (e) {}
      }

      extraVendors.forEach(extra => {
        const idx = baseList.findIndex(v => v.id === extra.id || v.name.toLowerCase() === extra.name.toLowerCase() || v.slug === extra.slug);
        if (idx >= 0) {
          baseList[idx] = { ...baseList[idx], ...extra };
        } else {
          baseList.unshift(extra);
        }
      });

      setVendors(baseList);
      setLoading(false);
    };

    loadMergedVendors();
    window.addEventListener('storage', loadMergedVendors);
    window.addEventListener('focus', loadMergedVendors);
    return () => {
      window.removeEventListener('storage', loadMergedVendors);
      window.removeEventListener('focus', loadMergedVendors);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...vendors];
    if (search) list = list.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== 'All') {
      list = list.filter(v => {
        const vCat = (v.category || '').toLowerCase().trim();
        const aCat = activeCategory.toLowerCase().trim();
        if (vCat === aCat) return true;
        if ((aCat.includes('makeup') || aCat.includes('beauty')) && (vCat.includes('makeup') || vCat.includes('beauty'))) return true;
        if ((aCat.includes('photo') || aCat.includes('video')) && (vCat.includes('photo') || vCat.includes('video'))) return true;
        if (aCat.includes('cater') && vCat.includes('cater')) return true;
        if (aCat.includes('decor') && vCat.includes('decor')) return true;
        if (aCat.includes('venue') && vCat.includes('venue')) return true;
        if (aCat.includes('music') && vCat.includes('music')) return true;
        return vCat.includes(aCat) || aCat.includes(vCat);
      });
    }
    const range = PRICE_RANGES[priceRange];
    list = list.filter(v => v.price_amount >= range.min && v.price_amount <= range.max);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') list.sort((a, b) => b.reviews - a.reviews);
    else if (sortBy === 'price_asc') list.sort((a, b) => a.price_amount - b.price_amount);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price_amount - a.price_amount);
    return list;
  }, [vendors, search, activeCategory, sortBy, priceRange]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50">
        <div className="bg-gradient-dark pt-24 pb-16 relative overflow-hidden">
          <div className="orb w-72 h-72 bg-sage-600 -top-20 -left-20 opacity-30" />
          <div className="orb w-96 h-96 bg-sage-500 -bottom-20 -right-20 opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-hero-text">Find Your <span className="text-gradient">Perfect Vendor</span></h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto mb-8">2,500+ verified vendors across India, ready to make your event extraordinary.</p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search vendors, categories, or cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-lg text-dark-800 placeholder:text-dark-400 outline-none text-sm focus:ring-2 focus:ring-sage-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-dark-400 hover:text-dark-700" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Filters Toggle Header */}
          <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3.5 rounded-2xl border border-sage-100 shadow-sm">
            <span className="text-xs font-bold text-sage-900">
              Showing {filtered.length} Vendors
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3.5 py-1.5 bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sage-600" />
              {showFilters ? 'Hide Filters ✕' : 'Filter & Sort ⚙️'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h3 className="font-display font-bold text-dark-900 text-lg mb-5">Filters</h3>
                <div className="mb-6">
                  <p className="text-dark-700 font-semibold text-sm mb-3">Category</p>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat ? 'bg-sage-50 text-sage-700 font-bold border border-sage-200' : 'text-dark-600 hover:bg-cream-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-dark-700 font-semibold text-sm mb-3">Budget Range</p>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceRange(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${priceRange === i ? 'bg-sage-50 text-sage-700 font-bold border border-sage-200' : 'text-dark-600 hover:bg-cream-50'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setActiveCategory('All'); setPriceRange(0); setSearch(''); }} className="w-full text-sm text-dark-400 hover:text-sage-600 transition-colors py-2 font-medium">
                  Clear All Filters
                </button>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              {occasionLabel && (
                <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sage-900">Showing vendors for: {occasionLabel}</p>
                      <p className="text-sage-600 text-sm">Browse all vendors below — use filters to narrow down.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOccasionLabel('')}
                    className="text-sage-500 hover:text-sage-700 text-sm font-bold"
                  >
                    Clear
                  </button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <p className="text-dark-600 text-sm font-medium">
                  <span className="text-dark-900 font-bold">{filtered.length}</span> vendors found
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-cream-300 rounded-xl text-sm font-medium text-dark-700 hover:border-sage-400 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-white border border-cream-300 rounded-xl text-sm text-dark-700 focus:outline-none focus:border-sage-400 appearance-none cursor-pointer"
                    >
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
                      <div className="h-52 bg-cream-100 shimmer-bg animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-cream-100 rounded-lg w-3/4" />
                        <div className="h-4 bg-cream-100 rounded-lg w-1/2" />
                        <div className="h-4 bg-cream-100 rounded-lg w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-dark-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-dark-900 mb-2">No vendors found</h3>
                  <p className="text-dark-500 mb-4">Try adjusting your search or filters.</p>
                  <button onClick={() => { setActiveCategory('All'); setPriceRange(0); setSearch(''); }} className="px-6 py-2.5 bg-gradient-brand text-white rounded-xl text-sm font-bold">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filtered.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
