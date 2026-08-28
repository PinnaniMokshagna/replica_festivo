import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, CheckCircle2, Heart, Share2, ArrowLeft, ArrowRight, X,
  Users, Sparkles, ChevronLeft, Camera, Calendar, MessageSquare,
  Phone, Mail, ChevronDown, ChevronUp, ShieldCheck, Building2,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { Vendor } from '../lib/supabase';
import { fetchVendorBySlug, fetchAllVendors, fetchReviewsForVendor } from '../lib/supabase-service';
import { MOCK_VENDORS, getVendorImageAndGallery } from '../lib/vendors';

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  vendor_reply: string | null;
  created_at: string;
};

/* ── Lightbox Component ─────────────────────────────────────────── */
function PhotoLightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-xl" />

      <button onClick={onClose} className="absolute top-6 right-6 z-10 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
        <X className="w-5 h-5" />
      </button>

      <div className="absolute top-6 left-6 z-10 glass rounded-xl px-4 py-2">
        <span className="text-white text-sm font-medium">{current + 1} / {images.length}</span>
      </div>

      <div className="relative z-10 max-w-5xl max-h-[85vh] mx-auto px-16" onClick={(e) => e.stopPropagation()}>
        <img
          key={current}
          src={images[current]}
          alt=""
          className="max-h-[80vh] max-w-full object-contain mx-auto block rounded-2xl shadow-2xl transition-all duration-300 cursor-zoom-in"
          onClick={() => setZoom(!zoom)}
          style={{ transform: zoom ? 'scale(1.1)' : 'scale(1)' }}
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
        className="absolute left-4 z-10 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
        className="absolute right-4 z-10 w-11 h-11 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function VendorDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [similarVendors, setSimilarVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'packages' | 'areas' | 'about' | 'reviews' | 'faq'>('projects');
  const [galleryTab, setGalleryTab] = useState<'portfolio' | 'albums' | 'videos'>('portfolio');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSpend, setReviewSpend] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Enquiry Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [functionDate, setFunctionDate] = useState('');
  const [guests, setGuests] = useState('100');
  const [functionType, setFunctionType] = useState('Wedding');
  const [whatsappNotify, setWhatsappNotify] = useState(true);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Modals state
  const [showContactModal, setShowContactModal] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Section Refs for smooth scrolling
  const projectsRef = useRef<HTMLDivElement>(null);
  const packagesRef = useRef<HTMLDivElement>(null);
  const areasRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadVendorDetails = async () => {
      const found = await fetchVendorBySlug(slug);
      const activeVendor = found || MOCK_VENDORS.find(v => v.slug === slug) || MOCK_VENDORS[0];
      setVendor(activeVendor);

      // Load reviews and similar vendors from Supabase
      const [reviewData, allVendorsList] = await Promise.all([
        fetchReviewsForVendor(slug),
        fetchAllVendors(),
      ]);

      setReviews(reviewData as any[]);
      setSimilarVendors((allVendorsList || []).filter(v => v.slug !== activeVendor.slug).slice(0, 4));
      setLoading(false);
    };

    loadVendorDetails();
  }, [slug]);

  const scrollToSection = (tab: 'projects' | 'packages' | 'areas' | 'about' | 'reviews' | 'faq', ref: React.RefObject<HTMLDivElement>) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setEnquiryLoading(true);
    setTimeout(() => {
      setEnquiryLoading(false);
      setEnquirySuccess(true);
    }, 800);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewerName.trim()) return;
    setSubmittingReview(true);

    const newRev: Review = {
      id: Date.now().toString(),
      customer_name: reviewerName,
      rating: userRating,
      comment: reviewComment,
      vendor_reply: null,
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      setReviews([newRev, ...reviews]);
      setReviewComment('');
      setReviewerName('');
      setReviewSpend('');
      setSubmittingReview(false);
    }, 600);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sage-800 font-bold text-sm">Loading vendor details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-sage-900 mb-2">Vendor Not Found</h2>
            <button onClick={() => navigate('/vendors')} className="text-sage-600 hover:underline font-bold">
              Browse All Vendors
            </button>
          </div>
        </div>
      </>
    );
  }

  const { image: vendorImage, gallery: allImages } = getVendorImageAndGallery(vendor);
  const hasImage = true;

  const vegPrice = vendor.price_amount;
  const nonVegPrice = Math.round(vendor.price_amount * 1.25);

  const vendorFaqs = [
    {
      q: `How many guests can ${vendor.name} accommodate?`,
      a: `${vendor.name} can comfortably accommodate up to ${vendor.capacity || '500-1000'} guests for weddings, receptions, and special events.`,
    },
    {
      q: `What is the price per plate/service at ${vendor.name}?`,
      a: `Vegetarian menu pricing starts at ₹${vegPrice.toLocaleString('en-IN')} per plate, and Non-Vegetarian menu pricing starts at ₹${nonVegPrice.toLocaleString('en-IN')} per plate (taxes extra).`,
    },
    {
      q: `What are the catering and decor policies?`,
      a: `Inhouse catering is available, and outside catering is permitted upon request. Outside decorators and outside DJ services are also allowed.`,
    },
    {
      q: `Can we host smaller pre-wedding functions at this venue?`,
      a: `Yes! ${vendor.name} offers flexible event spaces suitable for smaller gatherings like Mehendi, Engagement, Sangeet, Haldi, or Cocktail parties.`,
    },
  ];

  return (
    <>
      <Navbar />

      {lightboxIndex !== null && (
        <PhotoLightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Main Container */}
      <div className="min-h-screen bg-cream-50 pt-20 pb-16">

        {/* ── 1. Top Cover / Hero Header ────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sage-700 hover:text-sage-900 font-bold text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Vendors
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sage-200 rounded-xl text-sage-800 text-sm font-bold shadow-xs hover:bg-sage-50 transition-colors"
              >
                <Heart className={`w-4 h-4 ${liked ? 'text-red-500 fill-red-500' : 'text-sage-600'}`} />
                {liked ? 'Shortlisted' : 'Shortlist'}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sage-200 rounded-xl text-sage-800 text-sm font-bold shadow-xs hover:bg-sage-50 transition-colors">
                <Share2 className="w-4 h-4 text-sage-600" /> Share
              </button>
            </div>
          </div>

          {/* Vendor Cover Image Banner */}
          <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-card border border-sage-100">
            {hasImage ? (
              <img src={vendorImage} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sage-800 via-sage-900 to-dark-950 flex items-center justify-center">
                <span className="text-white/20 text-8xl font-display font-bold">{vendor.name[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-sage-950/90 via-sage-950/30 to-transparent" />

            {/* Banner Overlay info */}
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {vendor.badge && (
                    <span className={`${vendor.badge_color || 'bg-gold-500'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs`}>
                      {vendor.badge}
                    </span>
                  )}
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {vendor.category}
                  </span>
                  {vendor.verified && (
                    <span className="bg-sage-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-2">
                  {vendor.name}
                </h1>
                <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>{vendor.location}</span>
                </div>
              </div>

              {/* Rating Box */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-white">
                <div className="w-12 h-12 rounded-xl bg-sage-600 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  {vendor.rating}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gold-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(vendor.rating) ? 'fill-gold-400' : 'opacity-40'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-white/80 font-medium mt-0.5">{vendor.reviews} Verified Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Sticky Sub-Nav Tabs ───────────────────────────────────── */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-sage-200 shadow-xs mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 text-sm font-bold">
              <button
                onClick={() => scrollToSection('projects', projectsRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'projects' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                Projects & Portfolio ({allImages.length})
              </button>
              <button
                onClick={() => scrollToSection('packages', packagesRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'packages' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                Packages & Pricing
              </button>
              <button
                onClick={() => scrollToSection('areas', areasRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'areas' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                Areas Available
              </button>
              <button
                onClick={() => scrollToSection('about', aboutRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'about' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                About & Policies
              </button>
              <button
                onClick={() => scrollToSection('reviews', reviewsRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'reviews' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => scrollToSection('faq', faqRef)}
                className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'faq' ? 'border-sage-700 text-sage-900' : 'border-transparent text-sage-600 hover:text-sage-900'
                }`}
              >
                FAQs
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. Main Content & Sidebar Layout ─────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column: Main Detail Panels */}
            <div className="lg:col-span-2 space-y-8">

              {/* ── Section A: Projects & Portfolio Gallery ───────────────── */}
              <div ref={projectsRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-sage-900">Portfolio & Work</h2>
                    <p className="text-xs text-sage-600 font-medium mt-0.5">Explore real photos and event showcases</p>
                  </div>
                  <div className="flex gap-2 bg-sage-50 p-1 rounded-xl border border-sage-200">
                    <button
                      onClick={() => setGalleryTab('portfolio')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        galleryTab === 'portfolio' ? 'bg-white text-sage-900 shadow-xs' : 'text-sage-600 hover:text-sage-900'
                      }`}
                    >
                      Portfolio ({allImages.length})
                    </button>
                    <button
                      onClick={() => setGalleryTab('albums')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        galleryTab === 'albums' ? 'bg-white text-sage-900 shadow-xs' : 'text-sage-600 hover:text-sage-900'
                      }`}
                    >
                      Albums (1)
                    </button>
                    <button
                      onClick={() => setGalleryTab('videos')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        galleryTab === 'videos' ? 'bg-white text-sage-900 shadow-xs' : 'text-sage-600 hover:text-sage-900'
                      }`}
                    >
                      Videos (0)
                    </button>
                  </div>
                </div>

                {allImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {allImages.slice(0, 6).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-sage-100"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-sage-900 flex items-center justify-center shadow-md">
                            <Camera className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-cream-50 rounded-2xl border border-dashed border-sage-200">
                    <Camera className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                    <p className="text-sage-700 font-bold text-sm">No photos uploaded yet</p>
                  </div>
                )}

                {allImages.length > 6 && (
                  <button
                    onClick={() => setLightboxIndex(0)}
                    className="mt-6 w-full py-3 bg-sage-50 text-sage-800 font-bold text-sm rounded-xl border border-sage-200 hover:bg-sage-100 transition-colors flex items-center justify-center gap-2"
                  >
                    View All {allImages.length} Photos
                  </button>
                )}
              </div>

              {/* ── Section B: Service Packages & Pricing Tiers ───────────── */}
              <div ref={packagesRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-sage-900 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-gold-500" /> Service Packages & Pricing Tiers
                    </h2>
                    <p className="text-xs text-sage-600 font-medium mt-0.5">Explore official packages offered by {vendor.name}</p>
                  </div>
                  <span className="bg-sage-100 text-sage-800 text-xs font-bold px-3 py-1 rounded-full border border-sage-300">
                    Direct Booking Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {(() => {
                    const activeVendorPackages = (vendor as any).custom_packages && Array.isArray((vendor as any).custom_packages)
                      ? (vendor as any).custom_packages
                      : [];


                    const displayPackages = activeVendorPackages.length > 0
                      ? activeVendorPackages.map((p: any) => ({
                          title: p.name,
                          price: p.price && String(p.price).startsWith('₹') ? p.price : `₹${p.price}`,
                          badge: p.popular ? 'Most Popular' : 'Custom Service',
                          badgeBg: p.popular ? 'bg-gradient-brand text-white shadow-sm' : 'bg-sage-100 text-sage-800',
                          popular: !!p.popular,
                          features: Array.isArray(p.services) && p.services.length > 0 ? p.services : ['Full Service Inclusions', 'Professional Execution', 'Dedicated Support']
                        }))
                      : [
                          {
                            title: 'Silver Essential',
                            price: `₹${Math.round(vendor.price_amount * 0.75).toLocaleString('en-IN')}`,
                            badge: 'Essential Tier',
                            badgeBg: 'bg-sage-100 text-sage-800',
                            features: [
                              'Standard Day Event Service',
                              '1 Lead Senior Professional',
                              'High-Res Digital Delivery',
                              'Basic Editing & Retouching'
                            ]
                          },
                          {
                            title: 'Gold Premium',
                            price: `₹${vendor.price_amount.toLocaleString('en-IN')}`,
                            badge: 'Most Popular',
                            badgeBg: 'bg-gradient-brand text-white shadow-sm',
                            popular: true,
                            features: [
                              'Full Event Coverage & Teasers',
                              '2 Senior Lead Crew Members',
                              'Drone & Highlight Reel',
                              'Premium Printed Album',
                              'Express 7-Day Fast Delivery'
                            ]
                          },
                          {
                            title: 'Platinum Royal',
                            price: `₹${Math.round(vendor.price_amount * 1.5).toLocaleString('en-IN')}`,
                            badge: 'Luxury Package',
                            badgeBg: 'bg-gold-100 text-gold-900 border border-gold-300',
                            features: [
                              'Multi-Day Function Coverage',
                              'Full Crew (4 Members) + 4K Stream',
                              'Teaser + Full Length Movie',
                              'Italian Leather Master Album',
                              'Dedicated Production Manager'
                            ]
                          }
                        ];

                    return displayPackages.map((pkg: any, pIdx: number) => (
                      <div
                        key={pIdx}
                        className={`relative rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                          pkg.popular ? 'border-sage-500 bg-sage-50/50 shadow-md ring-2 ring-sage-300' : 'border-sage-200 bg-cream-50/40 hover:border-sage-300'
                        }`}
                      >
                        <div>
                          <span className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full mb-3 ${pkg.badgeBg}`}>
                            {pkg.badge}
                          </span>
                          <h3 className="font-bold text-sage-900 text-lg">{pkg.title}</h3>
                          <p className="font-display text-2xl font-extrabold text-sage-900 mt-2 mb-4">
                            {pkg.price} <span className="text-xs text-dark-500 font-normal">/ event</span>
                          </p>
                          <ul className="space-y-2.5 text-xs text-dark-700 font-medium mb-6">
                            {pkg.features.map((feat: string, fIdx: number) => (
                              <li key={fIdx} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-sage-600 flex-shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => navigate(`/book/${vendor.slug}?package=${encodeURIComponent(pkg.title)}&price=${encodeURIComponent(pkg.price)}`)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                            pkg.popular ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-glow-sage' : 'bg-white hover:bg-sage-50 text-sage-900 border border-sage-300'
                          }`}
                        >
                          Book {pkg.title}
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* ── Section B: Areas Available (Banquets / Spaces) ───────────── */}
              <div ref={areasRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100">
                <h2 className="font-display text-2xl font-bold text-sage-900 mb-1">Areas Available</h2>
                <p className="text-xs text-sage-600 font-medium mb-6">Space configurations & guest capacity</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-sage-50 to-cream-50 p-5 rounded-2xl border border-sage-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sage-600 text-white flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sage-900 text-base">Main Event Hall & Lawn</h4>
                        <span className="text-xs text-sage-600 font-medium">Indoor & Outdoor Available</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-sage-200/60 text-sm">
                      <div>
                        <span className="text-sage-500 text-xs block font-semibold">Seating Capacity</span>
                        <span className="font-bold text-sage-900">{vendor.capacity || '500 Seating'}</span>
                      </div>
                      <div className="w-px h-8 bg-sage-200" />
                      <div>
                        <span className="text-sage-500 text-xs block font-semibold">Floating Capacity</span>
                        <span className="font-bold text-sage-900">1000 Floating</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cream-50 to-gold-50/30 p-5 rounded-2xl border border-cream-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-600 text-white flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sage-900 text-base">Banquet & Terrace Space</h4>
                        <span className="text-xs text-sage-600 font-medium">Pre-Wedding & Small Gatherings</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-cream-300/60 text-sm">
                      <div>
                        <span className="text-sage-500 text-xs block font-semibold">Seating Capacity</span>
                        <span className="font-bold text-sage-900">200 Seating</span>
                      </div>
                      <div className="w-px h-8 bg-cream-300" />
                      <div>
                        <span className="text-sage-500 text-xs block font-semibold">Floating Capacity</span>
                        <span className="font-bold text-sage-900">350 Floating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section C: About & Facility Specifications ───────────────── */}
              <div ref={aboutRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100 space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-sage-900 mb-3">About {vendor.name}</h2>
                  <p className="text-dark-700 leading-relaxed text-sm">{vendor.description}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {vendor.tags.map((tag) => (
                      <span key={tag} className="text-sage-800 text-xs font-bold bg-sage-50 px-3 py-1.5 rounded-xl border border-sage-200 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-gold-600" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-sage-100">
                  <h3 className="font-bold text-sage-900 text-lg mb-4">Facilities & Policies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {[
                      'Sufficient guest parking space',
                      'Inhouse and outside catering permitted',
                      'Approved outside decorators allowed',
                      'Inhouse and outside DJ permitted',
                      'Inhouse and outside alcohol permitted',
                      'Air conditioned indoor halls',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-dark-700 font-medium">
                        <div className="w-5 h-5 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info Specification Grid */}
                <div className="pt-6 border-t border-sage-100">
                  <h3 className="font-bold text-sage-900 text-lg mb-4">Key Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-400 font-semibold block">Room Count</span>
                      <span className="font-bold text-sage-900 text-sm">30-50 Rooms</span>
                    </div>
                    <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-400 font-semibold block">Catering Policy</span>
                      <span className="font-bold text-sage-900 text-sm">Inhouse & Outside</span>
                    </div>
                    <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-400 font-semibold block">Decor Policy</span>
                      <span className="font-bold text-sage-900 text-sm">Outside Allowed</span>
                    </div>
                    <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-400 font-semibold block">Experience</span>
                      <span className="font-bold text-sage-900 text-sm">{vendor.experience_years || 5}+ Years</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section D: Reviews & Rating Form ─────────────────────────── */}
              <div ref={reviewsRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-sage-900">Customer Reviews</h2>
                    <p className="text-xs text-sage-600 font-medium">Real experiences from verified clients</p>
                  </div>

                  <div className="flex items-center gap-3 bg-sage-50 px-4 py-2 rounded-2xl border border-sage-200">
                    <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
                    <span className="font-bold text-sage-900 text-lg">{vendor.rating}</span>
                    <span className="text-xs text-sage-600 font-medium">({reviews.length} reviews)</span>
                  </div>
                </div>

                {/* Submit Review Form */}
                <form onSubmit={handleAddReview} className="bg-cream-50/80 p-5 rounded-2xl border border-cream-300 mb-8 space-y-4">
                  <h4 className="font-bold text-sage-900 text-sm">Rate & Review {vendor.name}</h4>

                  <div>
                    <label className="block text-xs font-bold text-sage-800 mb-1">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-1 text-gold-500 focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= userRating ? 'fill-gold-500' : 'text-sage-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Your Full Name"
                      required
                      className="px-4 py-2.5 bg-white border border-sage-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sage-300"
                    />
                    <input
                      type="text"
                      value={reviewSpend}
                      onChange={(e) => setReviewSpend(e.target.value)}
                      placeholder="Approx. Amount Spent (e.g. ₹50,000)"
                      className="px-4 py-2.5 bg-white border border-sage-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience with this vendor..."
                    required
                    className="w-full px-4 py-2.5 bg-white border border-sage-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sage-300 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-gradient-brand text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-card-hover transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    <>
                      {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl bg-sage-50/50 border border-sage-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-sage-700 text-white font-bold text-xs flex items-center justify-center">
                                {rev.customer_name[0] || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sage-900 text-sm leading-none">{rev.customer_name}</p>
                                <p className="text-xs text-dark-400 mt-0.5">{new Date(rev.created_at).toLocaleDateString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-gold-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-gold-500' : 'text-sage-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-dark-700 text-sm font-medium leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}

                      {reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="w-full py-3 bg-sage-50 text-sage-800 font-bold text-sm rounded-xl border border-sage-200 hover:bg-sage-100 transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                          {showAllReviews ? 'Show Less Reviews' : `See More Reviews (${reviews.length - 3} more)`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center bg-cream-50 rounded-2xl border border-dashed border-sage-200">
                      <MessageSquare className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                      <p className="text-sage-700 font-bold text-sm">Be the first one to post a review!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Section E: FAQ Accordion ─────────────────────────────────── */}
              <div ref={faqRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage-100">
                <h2 className="font-display text-2xl font-bold text-sage-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-xs text-sage-600 font-medium mb-6">Common queries about {vendor.name}</p>

                <div className="space-y-3">
                  {vendorFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={index} className="border border-sage-200 rounded-2xl overflow-hidden transition-all">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-sage-900 text-sm bg-sage-50/50 hover:bg-sage-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-sage-600 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-sage-600 flex-shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-2 text-dark-600 text-sm font-medium bg-white border-t border-sage-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── Right Column: Sticky Pricing & Inline Enquiry Form ────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">

                {/* 1. Price Breakdown Box */}
                <div className="bg-white rounded-3xl p-6 shadow-card border border-sage-200 space-y-5">

                  {/* Veg / Non-Veg Pricing */}
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-sage-100">
                    <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-500 font-bold block mb-0.5">Veg Price</span>
                      <span className="font-display text-xl font-bold text-sage-900">₹{vegPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-dark-400 block font-medium">per plate (plus tax)</span>
                    </div>
                    <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200">
                      <span className="text-xs text-dark-500 font-bold block mb-0.5">Non-Veg Price</span>
                      <span className="font-display text-xl font-bold text-sage-900">₹{nonVegPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-dark-400 block font-medium">per plate (plus tax)</span>
                    </div>
                  </div>



                  {/* Inline Enquiry Form */}
                  <div className="pt-4 border-t border-sage-100">
                    <h3 className="font-bold text-sage-900 text-sm mb-3">Hi {vendor.name},</h3>

                    {enquirySuccess ? (
                      <div className="p-4 bg-sage-50 border border-sage-300 rounded-2xl text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto" />
                        <h4 className="font-bold text-sage-900 text-sm">Enquiry Sent Successfully!</h4>
                        <p className="text-xs text-dark-600">The vendor team will contact you shortly with custom package options.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleEnquirySubmit} className="space-y-3">
                        <div>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Name *"
                            required
                            className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-sage-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 Phone *"
                            required
                            className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-sage-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-sage-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-sage-700 font-bold block mb-0.5">Function Date</label>
                            <input
                              type="date"
                              value={functionDate}
                              onChange={(e) => setFunctionDate(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-cream-50 border border-sage-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-sage-700 font-bold block mb-0.5">No. of Guests</label>
                            <input
                              type="number"
                              value={guests}
                              onChange={(e) => setGuests(e.target.value)}
                              placeholder="e.g. 200"
                              className="w-full px-3 py-2 text-xs bg-cream-50 border border-sage-200 rounded-xl outline-none focus:ring-2 focus:ring-sage-300 font-medium"
                            />
                          </div>
                        </div>

                        {/* Function Type Selector */}
                        <div>
                          <label className="text-[10px] text-sage-700 font-bold block mb-1">Function Type</label>
                          <div className="grid grid-cols-4 gap-1">
                            {['Pre-Wedding', 'Wedding', 'Evening', 'Day'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFunctionType(type)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                  functionType === type
                                    ? 'bg-sage-700 text-white border-sage-700'
                                    : 'bg-white text-sage-700 border-sage-200 hover:bg-sage-50'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="whatsapp"
                            checked={whatsappNotify}
                            onChange={(e) => setWhatsappNotify(e.target.checked)}
                            className="rounded text-sage-600 focus:ring-sage-500"
                          />
                          <label htmlFor="whatsapp" className="text-[11px] text-dark-600 font-medium cursor-pointer">
                            Notify me on WhatsApp
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={enquiryLoading}
                          className="w-full py-3 bg-gradient-brand text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-card-hover hover:scale-[1.01] transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                          {enquiryLoading ? 'Sending...' : 'Check Availability & Prices'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* 2. Direct Booking CTA Card */}
                <div className="bg-gradient-to-br from-sage-900 to-dark-950 rounded-3xl p-6 text-white shadow-card space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold-400" />
                    <span className="font-bold text-sm">Festivo Direct Booking</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Book online to get guaranteed dates, verified contract protection, and zero advance platform fees.
                  </p>
                  <button
                    onClick={() => navigate(`/book/${vendor.slug}`)}
                    className="w-full py-3 bg-gradient-gold text-white font-bold text-xs rounded-xl hover:shadow-glow-gold hover:scale-[1.01] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Directly Online
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* ── 4. Bottom Section: Browse Similar Vendors ────────────────────── */}
          {similarVendors.length > 0 && (
            <div className="mt-16 pt-12 border-t border-sage-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-sage-900">Browse Similar Vendors</h2>
                  <p className="text-xs text-sage-600 font-medium">Explore top-rated alternatives in {vendor.location}</p>
                </div>
                <button
                  onClick={() => navigate('/vendors')}
                  className="px-4 py-2 bg-white border border-sage-200 text-sage-800 font-bold text-xs rounded-xl hover:bg-sage-50 transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarVendors.slice(0, 4).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => navigate(`/vendors/${sim.slug}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer border border-sage-100 group"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={sim.image} alt={sim.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-sage-900 flex items-center gap-1 shadow-xs">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" /> {sim.rating}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sage-900 text-sm group-hover:text-sage-700 transition-colors line-clamp-1">{sim.name}</h3>
                      <p className="text-xs text-dark-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sage-500" /> {sim.location}
                      </p>
                      <div className="pt-2 border-t border-sage-100 flex items-baseline justify-between">
                        <span className="text-[10px] text-dark-400 font-medium">Starting from</span>
                        <span className="font-bold text-sage-900 text-xs">{sim.price_unit}{sim.price_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Contact Reveal Modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/60 backdrop-blur-sm" onClick={() => setShowContactModal(false)}>
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-sage-100" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sage-900 text-base">Vendor Contact Info</h3>
                <button onClick={() => setShowContactModal(false)} className="p-1 rounded-full text-dark-400 hover:text-dark-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-sage-50 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-600 text-white flex items-center justify-center font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sage-600 font-bold block">Phone Number</span>
                    <span className="font-bold text-sage-900 text-sm">+91 98765 43210</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sage-600 font-bold block">Email Address</span>
                    <span className="font-bold text-sage-900 text-sm">contact@{vendor.slug}.com</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 bg-sage-800 text-white font-bold text-xs rounded-xl hover:bg-sage-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </>
  );
}
