import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, Sparkles, TrendingUp, PieChart, Lightbulb } from 'lucide-react';
import { useInView } from '../hooks/useInView';

export default function BudgetPlannerCTA() {
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLDivElement>(0);

  return (
    <section ref={ref} className="py-12 sm:py-20 bg-cream-50/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`bg-gradient-to-br from-sage-800 to-sage-900 rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-100 sm:opacity-0 sm:translate-y-10'}`}>
          <div className="orb w-72 h-72 bg-gold-500/10 -top-10 -right-10" />
          <div className="orb w-64 h-64 bg-sage-600/20 -bottom-10 -left-10" style={{ animationDelay: '1.5s' }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Text & Actions */}
            <div className="lg:col-span-6 pb-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-5">
                <Calculator className="w-4 h-4 text-gold-400" />
                <span className="text-white text-sm font-bold">New: AI Budget Planner</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Plan Your Event Budget <span className="text-gradient-gold">Smartly</span>
              </h2>
              <p className="text-sage-200 text-base md:text-lg mb-8 font-medium leading-relaxed">
                Get an AI-powered budget breakdown tailored to your event type, guest count, and city. Adjust allocations, get smart recommendations, and find vendors that fit your budget.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/budget-planner')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95"
                >
                  <Calculator className="w-5 h-5" /> Plan My Budget
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/vendors')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                >
                  Browse Vendors
                </button>
              </div>
            </div>

            {/* Right iPad Pro Mockup with Scroll Entry Animation */}
            <div className="lg:col-span-6 relative flex justify-center self-end mt-4 lg:mt-0">
              <div
                className={`w-full max-w-[480px] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform ${
                  inView ? 'translate-y-4 opacity-100 scale-100' : 'translate-y-4 opacity-100 sm:opacity-0 sm:scale-95'
                }`}
              >
                {/* iPad Metallic Chassis (Space Gray / Aluminum) */}
                <div className="relative bg-gradient-to-b from-[#2a2c2e] via-[#1e2022] to-[#121415] rounded-t-[2.2rem] rounded-b-none p-[8px] pb-0 shadow-[0_-25px_60px_rgba(0,0,0,0.5)] border-t border-l border-r border-white/20 -mb-12">
                  
                  {/* Top Camera Notch / Sensor Dot */}
                  <div className="w-3 h-3 rounded-full bg-[#0a0a0d] border border-white/10 mx-auto absolute top-2.5 left-1/2 -translate-x-1/2 z-30" />

                  {/* Inner Display Bezel */}
                  <div className="bg-black rounded-t-[1.8rem] rounded-b-none p-[5px] pb-0 relative overflow-hidden">
                    
                    {/* Screen Content Box (Budget Dashboard) */}
                    <div className="bg-sage-950 rounded-t-[1.5rem] rounded-b-none pt-7 pb-6 px-5 border border-sage-800/60 shadow-inner relative overflow-hidden">
                      
                      {/* Glass Screen Glare */}
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/15 via-transparent to-transparent pointer-events-none z-10" />

                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-4 border-b border-sage-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                            <Calculator className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-xs font-bold leading-none">Festivo AI Planner</p>
                            <p className="text-sage-400 text-[10px]">Budget Dashboard</p>
                          </div>
                        </div>
                        <span className="bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          ₹5,00,000 Budget
                        </span>
                      </div>

                      {/* 2x2 Feature Grid inside iPad Dashboard */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { icon: PieChart, title: 'Smart Breakdown', desc: 'Category-wise allocation', color: 'from-sage-800 to-sage-900' },
                          { icon: Lightbulb, title: 'AI Tips', desc: 'Personalized recommendations', color: 'from-sage-800 to-sage-900' },
                          { icon: TrendingUp, title: 'City Pricing', desc: 'Location-aware estimates', color: 'from-sage-800 to-sage-900' },
                          { icon: Sparkles, title: 'Vendor Matching', desc: 'Find vendors in budget', color: 'from-sage-800 to-sage-900' },
                        ].map(({ icon: Icon, title, desc }) => (
                          <div
                            key={title}
                            className="bg-sage-900/90 rounded-xl p-3 border border-sage-800/80 flex items-start gap-2.5 shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0 border border-gold-500/30">
                              <Icon className="w-4 h-4 text-gold-400" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs leading-tight">{title}</p>
                              <p className="text-sage-400 text-[10px] mt-0.5 leading-tight">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mock Chart & Allocation Progress Bar */}
                      <div className="bg-sage-900/80 rounded-xl p-3 border border-sage-800/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-sage-300 mb-1.5">
                          <span>Venue (40%)</span>
                          <span>Catering (30%)</span>
                          <span>Decor (15%)</span>
                          <span>Other (15%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-sage-950 rounded-full overflow-hidden flex">
                          <div className="w-[40%] bg-gold-500 h-full" />
                          <div className="w-[30%] bg-sage-500 h-full" />
                          <div className="w-[15%] bg-amber-400 h-full" />
                          <div className="w-[15%] bg-emerald-400 h-full" />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
