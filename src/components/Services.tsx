import { useState } from 'react';
import { Sparkles, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { CATEGORIES } from '../lib/categories';

export default function Services() {
  const { ref, inView } = useInView(0);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'essential'>('all');

  const filteredCategories = CATEGORIES.filter((cat) => {
    if (activeTab === 'popular') {
      return ['Photographer', 'Decorator', 'Catering', 'DJ', 'Wedding Hall', 'Mehendi Artist', 'Makeup'].includes(cat.label);
    }
    if (activeTab === 'essential') {
      return ['Photographer', 'Tent House', 'Lights', 'Makeup', 'Travel', 'Pandit', 'Flower Decor', 'Anchor', 'Band', 'Decorator'].includes(cat.label);
    }
    return true;
  });

  return (
    <section id="services" className="pt-12 sm:pt-20 pb-12 bg-gradient-to-b from-white via-sage-50/40 to-white relative overflow-hidden" ref={ref}>
      {/* Background ambient lighting blur spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sage-200/30 blur-[130px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-100 sm:opacity-0 sm:translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100/80 border border-sage-200 text-sage-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Curated Excellence</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-sage-950 tracking-tight mb-4 sm:mb-5">
            Everything You Need <br />
            <span className="text-gradient">Under One Roof</span>
          </h2>
          <p className="text-dark-600 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Discover 14 premium service categories with 2,500+ verified professionals, transparent pricing, and instant booking assurance.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div className="w-full overflow-x-auto pb-3 mb-8 sm:mb-14 scrollbar-none flex justify-start sm:justify-center px-1 sm:px-0">
          <div className="inline-flex p-1 rounded-2xl sm:rounded-2xl bg-sage-100/70 border border-sage-200/80 backdrop-blur-md shadow-inner gap-1 flex-nowrap shrink-0 mx-auto sm:mx-0">
            {[
              { id: 'all', label: 'All Services (14)' },
              { id: 'popular', label: 'Most Popular' },
              { id: 'essential', label: '✦ Event Essentials' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-sage-900 text-white shadow-md scale-[1.02]'
                    : 'text-sage-700 hover:text-sage-950 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic 3D Service Cards Grid (4 per row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCategories.map((cat, i) => (
            <div
              key={cat.label}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.label)}`)}
              className={`group relative bg-white rounded-3xl overflow-hidden border border-sage-200/80 shadow-md hover:shadow-[0_25px_60px_-15px_rgba(45,74,51,0.22)] transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:rotate-[0.5deg] flex flex-col justify-between ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-100 sm:opacity-0 sm:translate-y-12'
              }`}
              style={{ transitionDelay: `${Math.min(i * 40, 300)}ms` }}
            >
              {/* Card Image Container with cinematic overlay */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                
                {/* Dark Cinematic Gradient Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-sage-950/90 via-sage-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Top Badge: Price */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-white/40 rounded-full px-3.5 py-1 shadow-md">
                  <span className="text-sage-950 text-xs font-extrabold tracking-tight">
                    From {cat.startingPrice}
                  </span>
                </div>

                {/* Top Left Icon Pill */}
                <div className="absolute top-4 left-4">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Title floating over image bottom */}
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="font-display font-bold text-white text-2xl drop-shadow-md group-hover:text-gold-300 transition-colors duration-300">
                    {cat.label}
                  </h3>
                </div>
              </div>

              {/* Card Content & Action Bar */}
              <div className="p-6 pt-4 flex-1 flex flex-col justify-between bg-white">
                <p className="text-dark-600 text-sm font-medium leading-relaxed line-clamp-2 mb-6">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-sage-100">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sage-700 group-hover:text-sage-900 transition-colors">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    Verified Partners
                  </span>

                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sage-900 group-hover:text-sage-600 group-hover:translate-x-1 transition-all duration-300">
                    <span>Explore Now</span>
                    <div className="w-6 h-6 rounded-full bg-sage-100 group-hover:bg-sage-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Accent Border Line */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${cat.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

