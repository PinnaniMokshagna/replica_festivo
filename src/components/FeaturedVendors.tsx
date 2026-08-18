import { useState } from 'react';
import { Star, MapPin, Heart, ArrowRight, RotateCw, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import type { Vendor } from '../lib/supabase';
import { MOCK_VENDORS } from '../lib/vendors';

import { useSavedVendors } from '../lib/savedVendors';

function VendorFlipCard({
  vendor,
  index,
  inView,
}: {
  vendor: Vendor;
  index: number;
  inView: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isSaved, toggleSave } = useSavedVendors();
  const liked = isSaved(vendor.id);
  const navigate = useNavigate();

  return (
    <div
      className={`animate-on-scroll ${inView ? 'in-view' : ''} delay-${Math.min((index + 1) * 100, 600)} group h-[490px]`}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Flip Container */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ================= FRONT SIDE (Services Full-Bleed 3D Card Style) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-3xl overflow-hidden border border-sage-200/90 shadow-md hover:shadow-[0_25px_60px_-15px_rgba(45,74,51,0.22)] transition-all duration-500 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          
          {/* Top Full-Bleed Image Header Container */}
          <div className="relative h-64 overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/vendors/${vendor.slug}`)}>
            <img
              src={vendor.image}
              alt={vendor.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-sage-950/90 via-sage-950/20 to-transparent opacity-85 group-hover:opacity-70 transition-opacity duration-300" />

            {/* Top Left Badge */}
            {vendor.badge && (
              <div className="absolute top-4 left-4">
                <span className="bg-sage-900/90 backdrop-blur-md text-gold-300 text-xs font-extrabold px-3 py-1 rounded-full shadow-md border border-white/20">
                  {vendor.badge}
                </span>
              </div>
            )}

            {/* Top Right Buttons: Flip Card & Like */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="px-3 py-1.5 bg-white/95 backdrop-blur-md border border-white/40 rounded-full text-sage-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:bg-white hover:scale-105 transition-all"
                title="Click to flip card & view details"
              >
                <RotateCw className="w-3.5 h-3.5 text-sage-700" />
                <span>Flip Card 🔄</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSave(vendor.id);
                }}
                className="w-8.5 h-8.5 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                title={liked ? "Saved to your list (Click to remove)" : "Save vendor"}
              >
                <Heart className={`w-4 h-4 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-sage-700'}`} />
              </button>
            </div>

            {/* Price Badge floating top right (below buttons) */}
            <div className="absolute top-15 right-4 bg-white/90 backdrop-blur-md border border-white/40 rounded-full px-3 py-1 shadow-sm">
              <span className="text-sage-950 text-xs font-extrabold">
                {vendor.price_unit}{vendor.price_amount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Vendor Name & Rating floating over bottom image vignette */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {vendor.category}
                </span>
                <div className="flex items-center gap-1 bg-amber-400/90 text-sage-950 px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-xs">
                  <Star className="w-3 h-3 fill-sage-950 text-sage-950" />
                  <span>{vendor.rating}</span>
                </div>
              </div>
              <h3 className="font-display font-bold text-white text-2xl drop-shadow-md group-hover:text-gold-300 transition-colors duration-300 line-clamp-1">
                {vendor.name}
              </h3>
            </div>
          </div>

          {/* Card Content & Action Bar */}
          <div className="p-6 pt-4 flex-1 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center gap-1.5 text-sage-600 text-xs font-semibold mb-3">
                <MapPin className="w-3.5 h-3.5 text-sage-500" />
                <span>{vendor.location}</span>
                <span className="text-dark-400">• ({vendor.reviews} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {vendor.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-sage-800 text-xs bg-sage-50 px-2.5 py-1 rounded-xl border border-sage-100 font-medium">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-sage-100">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-sage-700 group-hover:text-sage-900 transition-colors">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                Verified Vendor
              </span>

              <div
                onClick={() => navigate(`/vendors/${vendor.slug}`)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sage-900 group-hover:text-sage-600 group-hover:translate-x-1 transition-all duration-300 cursor-pointer"
              >
                <span>View Details</span>
                <div className="w-6 h-6 rounded-full bg-sage-100 group-hover:bg-sage-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accent Color Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-sage-600 via-gold-500 to-sage-700 opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* ================= BACK SIDE (Vendor Features & Services) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-sage-950 via-sage-900 to-sage-950 text-white rounded-3xl p-6 border border-sage-700 shadow-2xl flex flex-col justify-between"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          
          <div>
            {/* Header: Title & Flip Back */}
            <div className="flex items-center justify-between pb-3 border-b border-sage-800 mb-4">
              <div>
                <span className="text-gold-400 text-[10px] font-bold uppercase tracking-widest block">Vendor Profile</span>
                <h4 className="font-display font-bold text-white text-lg leading-tight line-clamp-1">{vendor.name}</h4>
              </div>
              <button
                onClick={() => setIsFlipped(false)}
                className="px-3.5 py-1.5 bg-sage-800 hover:bg-sage-700 text-gold-300 border border-gold-500/30 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <RotateCw className="w-3 h-3 text-gold-400" />
                <span>Front ↩</span>
              </button>
            </div>

            {/* Overview / Description */}
            <div className="mb-4">
              <p className="text-sage-200 text-xs font-medium leading-relaxed line-clamp-3">
                {vendor.description || `${vendor.name} is a top-rated ${vendor.category} provider in ${vendor.location} delivering premium services.`}
              </p>
            </div>

            {/* Highlights & Features List */}
            <div className="space-y-2 mb-4">
              <h5 className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">Key Services & Amenities</h5>
              {vendor.tags.slice(0, 4).map((tag) => (
                <div key={tag} className="flex items-center gap-2 text-sage-100 text-xs font-medium bg-sage-900/80 p-2.5 rounded-xl border border-sage-800">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="line-clamp-1">{tag}</span>
                </div>
              ))}
            </div>

            {/* Quick Metrics (Capacity & Experience) */}
            <div className="grid grid-cols-2 gap-2 bg-sage-900/90 p-3 rounded-xl border border-sage-800 text-center">
              <div>
                <span className="text-[10px] text-sage-400 font-bold block uppercase">Capacity</span>
                <span className="text-xs font-bold text-white line-clamp-1">{vendor.capacity || 'Flexible'}</span>
              </div>
              <div>
                <span className="text-[10px] text-sage-400 font-bold block uppercase">Experience</span>
                <span className="text-xs font-bold text-gold-400">{vendor.experience_years || 8}+ Years</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-sage-800 flex items-center justify-between">
            <div>
              <span className="text-sage-400 text-[10px] uppercase font-bold block">Starting From</span>
              <p className="text-gold-400 font-extrabold text-lg leading-none">
                {vendor.price_unit}{vendor.price_amount.toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={() => navigate(`/vendors/${vendor.slug}`)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-sage-950 text-xs font-extrabold rounded-xl shadow-md hover:scale-105 transition-all"
            >
              <span>Book Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FeaturedVendors() {
  const { ref, inView } = useInView(0);
  const navigate = useNavigate();

  return (
    <section id="vendors" className="pt-8 pb-20 bg-white relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-100 sm:opacity-0 sm:translate-y-8'}`}>
          <div>
            <span className="inline-flex items-center gap-2 text-sage-700 text-xs font-bold tracking-widest uppercase mb-3 bg-sage-100 px-3.5 py-1 rounded-full border border-sage-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Verified Top Picks
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-sage-950">
              Featured <span className="text-gradient">Vendors</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/vendors')}
              className="text-sage-700 font-extrabold text-sm border-b-2 border-sage-300 hover:border-sage-700 hover:text-sage-950 transition-colors pb-0.5"
            >
              View All 2,500+ →
            </button>
          </div>
        </div>

        {/* 6 Individual Featured Vendor Flip Cards Grid (3 Columns x 2 Rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_VENDORS.slice(0, 6).map((vendor, index) => (
            <VendorFlipCard
              key={vendor.id}
              vendor={vendor}
              index={index}
              inView={inView}
            />
          ))}
        </div>

      </div>
    </section>
  );
}



