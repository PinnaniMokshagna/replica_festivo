import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, CheckCircle2, Sparkles,
  Search, CalendarCheck, Handshake, PartyPopper, Award,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useInView } from '../hooks/useInView';
import { CATEGORIES } from '../lib/categories';
import { MOCK_VENDORS, getVendorImageAndGallery } from '../lib/vendors';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);
  const [videoDimmed, setVideoDimmed] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const heroRef = useInView<HTMLDivElement>();
  const categoriesRef = useInView<HTMLDivElement>();
  const featuredRef = useInView<HTMLDivElement>();
  const howItWorksRef = useInView<HTMLDivElement>();
  const ctaRef = useInView<HTMLDivElement>();

  useEffect(() => {
    // Show image first for 1 second, then reveal text content smoothly
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadFeaturedVendors = () => {
      // Start with top 6 mock vendors
      let baseList = [...MOCK_VENDORS];

      // Merge in any admin-approved registered vendors (same logic as VendorsPage)
      const approvedRaw = localStorage.getItem('festivo_approved_vendors');
      if (approvedRaw) {
        try {
          const parsed = JSON.parse(approvedRaw);
          const seenIds = new Set(baseList.map(v => v.id));
          parsed.forEach((item: any) => {
            if (!item.id || seenIds.has(item.id)) return;
            seenIds.add(item.id);
            baseList.unshift({
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
              slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
              description: item.details?.bio || 'Verified Event Partner offering premium services.',
              tags: item.tags || [item.category || 'Event', 'Verified', 'Festivo Partner'],
              gallery: item.gallery || ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'],
            } as any);
          });
        } catch (e) {}
      }

      setVendors(baseList.slice(0, 6));
      setLoading(false);
    };

    loadFeaturedVendors();
    window.addEventListener('storage', loadFeaturedVendors);
    window.addEventListener('focus', loadFeaturedVendors);
    return () => {
      window.removeEventListener('storage', loadFeaturedVendors);
      window.removeEventListener('focus', loadFeaturedVendors);
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        {/* Explore Hero Section with Background Image & 1s Delay Text Animation */}
        <section ref={heroRef.ref} className="py-24 md:py-32 relative overflow-hidden bg-sage-950">
          {/* Background Alpine Vows Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/Alpine-Vows-Evergreen-Dream-Green-Wedding.webp" 
              alt="Explore Services Background" 
              className="w-full h-full object-cover scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sage-950/75 via-sage-950/60 to-sage-950/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-sage-950/50 via-transparent to-sage-950/50" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Top Pill - Animates after 1 sec */}
            <div className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-5 py-2 mb-6 shadow-md transition-all duration-700 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
              <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest">Explore Services</span>
            </div>

            {/* Headline - Animates after 1 sec */}
            <h1 className={`font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-xl transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
              Discover Everything You Need <br /> for Your <span className="text-gradient-gold bg-clip-text text-transparent bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500">Perfect Event</span>
            </h1>

            {/* Subtitle - Animates after 1 sec */}
            <p className={`text-sage-200 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed transition-all duration-1000 delay-300 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              From photographers to pandits, DJs to decorators — browse all 14 event service categories in one place.
            </p>
          </div>
        </section>

        {/* Categories Grid — Glossy Animated Cards */}
        <section className="py-16 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={categoriesRef.ref} className={`text-center mb-12 transition-all duration-700 ${categoriesRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block text-sage-600 text-sm font-bold tracking-widest uppercase mb-3">Browse by Category</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-sage-900 mb-3">Explore Our Services</h2>
              <p className="text-dark-500 text-lg font-medium">14 categories, 2,500+ verified vendors — find the perfect match for your event</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => navigate(`/category/${encodeURIComponent(cat.label)}`)}
                  onMouseEnter={() => setHoveredCat(i)}
                  onMouseLeave={() => setHoveredCat(null)}
                  className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden flex flex-col h-44 sm:h-48 ${
                    hoveredCat === i
                      ? 'border-sage-600 ring-4 ring-sage-600/10 shadow-lg scale-[1.03] -translate-y-1'
                      : 'border-sage-100/80 hover:border-sage-300 shadow-xs'
                  } ${categoriesRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  {/* Top Image Section (80%) */}
                  <div className="relative h-[80%] w-full overflow-hidden flex-shrink-0 bg-cream-100">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Bottom Category Label Section (20%) */}
                  <div className="h-[20%] w-full flex items-center justify-between px-4 bg-white border-t border-sage-50">
                    <p className="font-display font-bold text-sage-950 text-sm truncate group-hover:text-sage-700 transition-colors">{cat.label}</p>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      hoveredCat === i ? 'bg-sage-600 text-white shadow-xs' : 'bg-sage-50 text-sage-500'
                    }`}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vendors */}
        <section className="py-16 bg-cream-50/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={featuredRef.ref} className={`flex items-end justify-between mb-10 transition-all duration-700 ${featuredRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div>
                <span className="inline-block text-sage-600 text-sm font-bold tracking-widest uppercase mb-2">Top Rated</span>
                <h2 className="font-display text-3xl font-bold text-sage-900">Featured Vendors</h2>
              </div>
              <button onClick={() => navigate('/vendors')} className="text-sage-600 font-bold text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-card p-4 animate-pulse">
                    <div className="w-full h-48 bg-sage-100 rounded-xl mb-4" />
                    <div className="h-4 bg-sage-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-sage-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, i) => {
                  const { image: vendorImage } = getVendorImageAndGallery(vendor);
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => navigate(`/vendors/${vendor.slug}`)}
                      className={`group bg-white rounded-2xl shadow-card overflow-hidden cursor-pointer card-hover transition-all duration-700 ${featuredRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img src={vendorImage} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
                      {vendor.badge && (
                        <span className={`absolute top-3 left-3 ${vendor.badge_color} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>{vendor.badge}</span>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1">
                        <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                        <span className="text-white font-bold text-sm">{vendor.rating}</span>
                        <span className="text-white/70 text-xs">({vendor.reviews})</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sage-900 text-lg mb-1">{vendor.name}</h3>
                      <div className="flex items-center gap-2 text-dark-500 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" /> {vendor.location}
                        <span className="text-dark-300">·</span>
                        <span>{vendor.category}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-sage-50">
                        <div>
                          <span className="text-dark-400 text-xs">Starting from</span>
                          <p className="font-display font-bold text-sage-900">{vendor.price_unit || '₹'}{(Number(vendor.price_amount) || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-sage-50 group-hover:bg-sage-100 flex items-center justify-center transition-colors">
                          <ArrowRight className="w-4 h-4 text-sage-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section ref={howItWorksRef.ref} className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-14 transition-all duration-700 ${howItWorksRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="inline-block text-sage-600 text-sm font-bold tracking-widest uppercase mb-3">Simple Process</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-sage-900 mb-3">
                How Festivo <span className="text-gradient">Works</span>
              </h2>
              <p className="text-dark-500 text-lg max-w-xl mx-auto font-medium">
                From discovery to celebration — we make event planning effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', icon: Search, title: 'Discover', desc: 'Browse 2,500+ verified vendors across India. Filter by category, budget, rating, and location.', color: 'from-sage-500 to-sage-700' },
                { step: '02', icon: CalendarCheck, title: 'Plan', desc: 'Select your event type, date, and guest count. Compare packages side-by-side to build your ideal event.', color: 'from-cream-500 to-cream-700' },
                { step: '03', icon: Handshake, title: 'Book', desc: 'Reserve your vendor with secure online payment. Get instant confirmation and connect directly.', color: 'from-sage-600 to-sage-800' },
                { step: '04', icon: PartyPopper, title: 'Celebrate', desc: 'Enjoy your event while our vendors deliver excellence. Track everything with post-event support.', color: 'from-gold-500 to-gold-700' },
              ].map(({ step, icon: Icon, title, desc, color }, i) => (
                <div
                  key={step}
                  className={`text-center transition-all duration-700 ${howItWorksRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="relative inline-flex mb-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-glow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-sage-200 flex items-center justify-center shadow-soft">
                      <span className="text-[10px] font-bold text-sage-700">{step}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-sage-900 font-bold text-xl mb-2">{title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed font-medium">{desc}</p>
                </div>
              ))}
            </div>

            <div className={`text-center mt-14 transition-all duration-700 ${howItWorksRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <button
                onClick={() => navigate('/vendors')}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-brand text-white font-bold text-lg rounded-2xl hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Start Planning Your Event
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-dark-400 text-sm mt-4 font-medium">No upfront payment required. Free to browse.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section ref={ctaRef.ref} className="py-20 bg-gradient-to-br from-sage-900 to-sage-800 relative overflow-hidden">
          <div className="orb w-96 h-96 bg-gold-500/10 -top-20 -right-20" />
          <div className="orb w-72 h-72 bg-sage-600/20 -bottom-20 -left-20" style={{ animationDelay: '2s' }} />
          <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${ctaRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-5">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-white text-sm font-bold">Trusted by 50,000+ customers</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Plan Your <span className="text-gradient-gold">Perfect Event?</span>
            </h2>
            <p className="text-sage-200 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Join thousands of happy customers who found their dream vendors on Festivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/vendors')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-105 transition-all"
              >
                Browse All Vendors <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/vendors')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
              >
                Find Vendors
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
