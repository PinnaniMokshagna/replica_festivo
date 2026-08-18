import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Bride — Mumbai',
    initials: 'PS',
    color: 'from-sage-500 to-sage-700',
    rating: 5, event: 'Wedding',
    text: 'Festivo made our wedding planning an absolute dream. We found the perfect venue, caterer, and photographer — all within our budget. The booking process was seamless and the vendors were incredibly professional.',
    highlight: 'Saved 3 weeks of vendor hunting',
  },
  {
    name: 'Arjun Mehta',
    role: 'Corporate Manager — Bangalore',
    initials: 'AM',
    color: 'from-dark-600 to-dark-800',
    rating: 5, event: 'Corporate Event',
    text: 'We used Festivo for our annual company gala and the experience was outstanding. The coordinator handled everything with precision. The catering was world-class and the decor was beyond our expectations.',
    highlight: 'Flawless 400-person corporate event',
  },
  {
    name: 'Ananya Krishnan',
    role: 'Event Host — Chennai',
    initials: 'AK',
    color: 'from-cream-600 to-cream-800',
    rating: 5, event: 'Birthday Party',
    text: 'I planned my daughter\'s 18th birthday through Festivo and it was magical! The platform helped me compare multiple decorators and I found one that perfectly matched our "Garden Wonderland" theme.',
    highlight: 'Perfect themed birthday celebration',
  },
  {
    name: 'Rohit & Sneha Gupta',
    role: 'Couple — Delhi',
    initials: 'RG',
    color: 'from-sage-600 to-dark-700',
    rating: 5, event: 'Anniversary',
    text: 'Our 25th anniversary was everything we dreamed of, thanks to Festivo. The budget tracking feature helped us stay within limits while still having a lavish celebration. Pure magic!',
    highlight: 'Intimate yet grand celebration',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-rotation every 4 seconds with smooth cross-fade animation
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 200);
    }, 4000);

    return () => clearInterval(timer);
  }, [current]);

  const handleSelect = (index: number) => {
    if (index === current) return;
    setFade(false);
    setTimeout(() => {
      setCurrent(index);
      setFade(true);
    }, 200);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
      setFade(true);
    }, 200);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
      setFade(true);
    }, 200);
  };

  const t = testimonials[current];

  return (
    <section className="py-24 bg-[#f8f7f5] relative overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#3b5d43] text-xs md:text-sm font-bold tracking-widest uppercase mb-2">
            Client Stories
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1c3323]">
            Moments That <span className="text-[#48634e]">Matter</span>
          </h2>
          <p className="text-dark-500 text-sm md:text-base font-medium mt-2 max-w-xl mx-auto">
            See how real clients across India host unforgettable celebrations with Festivo.
          </p>
        </div>

        {/* ========================================================================= */}
        {/*                      REALISTIC IPAD PRO DEVICE FRAME                      */}
        {/* ========================================================================= */}
        <div className="relative max-w-4xl mx-auto">
          {/* Outer Metallic iPad Chassis (Space Gray / Obsidian Finish) */}
          <div className="bg-gradient-to-b from-[#2e3530] via-[#1d231e] to-[#131714] rounded-[48px] p-4 md:p-6 shadow-[0_30px_70px_-15px_rgba(20,35,25,0.45)] border border-white/20 relative">
            
            {/* iPad Top Camera Lens Dot */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-3.5 h-3.5 bg-black rounded-full border border-neutral-700/80 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 bg-[#1a2538] rounded-full" />
              </div>
            </div>

            {/* iPad Screen (White Glass Display) */}
            <div className="bg-[#fcfbfa] rounded-[32px] overflow-hidden border border-black/10 shadow-inner p-6 md:p-10 relative flex flex-col justify-between min-h-[460px]">
              
              {/* iPad Top Status Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-sage-100 text-xs font-semibold text-dark-400">
                <span className="font-serif font-bold text-[#1c3323] text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Festivo Reviews
                </span>
                <div className="flex items-center gap-3 text-dark-500">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-dark-600">5G</span>
                    <div className="w-5 h-2.5 border border-dark-600 rounded-xs p-0.5 flex items-center">
                      <div className="w-full h-full bg-dark-700 rounded-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Review Card Inside iPad */}
              <div className={`py-6 relative transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                {/* Background Quote Mark Watermark */}
                <div className="absolute top-0 right-4 opacity-10 pointer-events-none">
                  <Quote className="w-32 h-32 text-[#48634e]" />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  {/* Left Column: Client Avatar & Badge */}
                  <div className="flex-shrink-0">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 rounded-2xl bg-[#48634e] flex items-center justify-center ring-4 ring-[#eef4ed] shadow-md">
                        <span className="text-white font-serif font-bold text-2xl tracking-wider">{t.initials}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#3b5d43] rounded-full p-1.5 shadow">
                        <Star className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-serif font-bold text-[#1c3323] text-lg">{t.name}</h3>
                      <p className="text-dark-500 text-xs md:text-sm font-medium mt-0.5">{t.role}</p>
                      <span className="inline-block mt-3 bg-[#eef4ed] text-[#3b5d43] text-xs font-bold px-3 py-1 rounded-full border border-[#d8e7d9]">
                        {t.event}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Rating Stars, Review Text, & Highlight Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-[#1c3323] text-lg md:text-xl leading-relaxed mb-6 italic font-serif font-medium">
                      "{t.text}"
                    </p>
                    <div className="inline-flex items-center gap-2.5 bg-[#eef4ed] border border-[#d8e7d9] rounded-full px-4 py-2 shadow-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b5d43]" />
                      <span className="text-[#3b5d43] text-xs md:text-sm font-bold">{t.highlight}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom iPad Review Selector Dock Bar */}
              <div className="pt-6 border-t border-sage-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-dark-400 uppercase tracking-wider">Auto Rotating Client Reviews</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrev} 
                      className="w-8 h-8 rounded-lg border border-sage-200 flex items-center justify-center text-[#3b5d43] hover:border-sage-400 hover:bg-sage-50 transition-all active:scale-95"
                      aria-label="Previous Review"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleNext} 
                      className="w-8 h-8 rounded-lg bg-[#3b5d43] text-white flex items-center justify-center hover:bg-[#2d4934] transition-all shadow-sm active:scale-95"
                      aria-label="Next Review"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4 Client App Dock Selector Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {testimonials.map((tt, i) => (
                    <button
                      key={tt.name}
                      onClick={() => handleSelect(i)}
                      className={`p-3 rounded-xl text-left transition-all duration-300 border-2 ${
                        i === current 
                          ? 'border-[#3b5d43] bg-white shadow-md scale-[1.02]' 
                          : 'border-transparent bg-sage-50/70 hover:bg-white hover:border-sage-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[#48634e] flex items-center justify-center shadow-xs">
                          <span className="text-white font-serif font-bold text-xs">{tt.initials}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#1c3323] font-bold text-xs truncate">{tt.name}</p>
                          <p className="text-dark-400 text-[10px] truncate">{tt.event}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: tt.rating }).map((_, j) => (
                          <Star key={j} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* iPad Bottom Home Bar Indicator */}
            <div className="w-36 h-1 bg-white/30 rounded-full mx-auto mt-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
