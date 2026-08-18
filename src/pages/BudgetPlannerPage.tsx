import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ArrowLeft, Calculator, Wallet,
  Users, Calendar, TrendingUp, PieChart, Lightbulb,
  CheckCircle2, Info, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useInView } from '../hooks/useInView';

const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', baseCost: 300000, icon: '💍' },
  { id: 'birthday', label: 'Birthday Party', baseCost: 50000, icon: '🎂' },
  { id: 'corporate', label: 'Corporate Event', baseCost: 150000, icon: '🏢' },
  { id: 'engagement', label: 'Engagement', baseCost: 100000, icon: '💎' },
  { id: 'anniversary', label: 'Anniversary', baseCost: 80000, icon: '🥂' },
  { id: 'babyshower', label: 'Baby Shower', baseCost: 40000, icon: '🍼' },
];

const CATEGORIES = [
  { id: 'venue', label: 'Venue', icon: '🏛️', percentage: 30, color: 'bg-sage-600', essential: true },
  { id: 'catering', label: 'Catering', icon: '🍽️', percentage: 25, color: 'bg-sage-500', essential: true },
  { id: 'decoration', label: 'Decoration', icon: '🌸', percentage: 15, color: 'bg-cream-600', essential: true },
  { id: 'photography', label: 'Photography', icon: '📸', percentage: 10, color: 'bg-gold-600', essential: true },
  { id: 'entertainment', label: 'Entertainment', icon: '🎵', percentage: 8, color: 'bg-sage-700', essential: false },
  { id: 'coordination', label: 'Event Planner', icon: '📋', percentage: 7, color: 'bg-cream-700', essential: false },
  { id: 'misc', label: 'Miscellaneous', icon: '✨', percentage: 5, color: 'bg-gold-500', essential: false },
];

const CITY_MULTIPLIERS: Record<string, number> = {
  'Mumbai': 1.3, 'Delhi': 1.25, 'Bangalore': 1.15, 'Chennai': 1.0,
  'Hyderabad': 0.95, 'Pune': 1.05, 'Jaipur': 0.85, 'Kolkata': 0.9,
  'Other': 1.0,
};

export default function BudgetPlannerPage() {
  const navigate = useNavigate();
  const [eventType, setEventType] = useState('wedding');
  const [guestCount, setGuestCount] = useState(150);
  const [city, setCity] = useState('Mumbai');
  const [luxuryLevel, setLuxuryLevel] = useState(2);
  const [customBudget, setCustomBudget] = useState<number | ''>('');
  const [allocations, setAllocations] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map(c => [c.id, c.percentage]))
  );

  const heroView = useInView<HTMLDivElement>();
  const resultView = useInView<HTMLDivElement>();

  const luxuryMultiplier = [0.7, 0.85, 1.0, 1.3, 1.6][luxuryLevel];
  const luxuryLabels = ['Budget', 'Economy', 'Standard', 'Premium', 'Luxury'];

  const estimatedBudget = useMemo(() => {
    const event = EVENT_TYPES.find(e => e.id === eventType)!;
    const cityMult = CITY_MULTIPLIERS[city] ?? 1.0;
    const guestMult = 1 + (guestCount - 100) * 0.003;
    return Math.round(event.baseCost * cityMult * guestMult * luxuryMultiplier);
  }, [eventType, guestCount, city, luxuryMultiplier]);

  const totalBudget = customBudget || estimatedBudget;
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);

  const categoryAmounts = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      amount: Math.round((totalBudget * allocations[cat.id]) / 100),
    }));
  }, [totalBudget, allocations]);

  const updateAllocation = (id: string, value: number) => {
    setAllocations(prev => ({ ...prev, [id]: Math.max(0, Math.min(100, value)) }));
  };

  const resetAllocations = () => {
    setAllocations(Object.fromEntries(CATEGORIES.map(c => [c.id, c.percentage])));
  };

  const recommendations = useMemo(() => {
    const tips: { icon: typeof Lightbulb; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
    if (allocations.venue > 35) tips.push({ icon: TrendingUp, text: 'Venue is taking a large share. Consider a weekday or off-season date to save 20-30%.', priority: 'high' });
    if (allocations.catering < 20) tips.push({ icon: Info, text: 'Catering is below typical range. Consider increasing food budget for guest satisfaction.', priority: 'medium' });
    if (allocations.photography < 7) tips.push({ icon: Lightbulb, text: 'Photography budget is low — memories last forever. Consider allocating at least 8-10%.', priority: 'medium' });
    if (guestCount > 300) tips.push({ icon: Users, text: 'Large guest count detected. A professional coordinator is highly recommended.', priority: 'high' });
    if (allocations.entertainment < 5 && eventType === 'wedding') tips.push({ icon: Lightbulb, text: 'Entertainment adds energy to weddings. Consider a DJ or live band.', priority: 'low' });
    if (allocations.misc < 3) tips.push({ icon: Info, text: 'Keep at least 5% for miscellaneous — invitations, gifts, transport, and surprises.', priority: 'medium' });
    if (tips.length === 0) tips.push({ icon: CheckCircle2, text: 'Your budget allocation looks well-balanced! You\'re ready to start booking.', priority: 'low' });
    return tips;
  }, [allocations, guestCount, eventType]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        {/* Hero */}
        <div ref={heroView.ref} className={`bg-gradient-to-br from-sage-900 to-sage-800 py-16 relative overflow-hidden transition-all duration-700 ${heroView.inView ? 'opacity-100' : 'opacity-0'}`}>
          <div className="orb w-96 h-96 bg-sage-600/20 -top-20 -left-20" />
          <div className="orb w-72 h-72 bg-gold-500/10 bottom-0 right-10" style={{ animationDelay: '2s' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-5">
              <Calculator className="w-4 h-4 text-gold-400" />
              <span className="text-white text-sm font-bold">AI Budget Planner</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Plan Your Perfect <span className="text-gradient-gold">Event Budget</span>
            </h1>
            <p className="text-sage-200 text-lg max-w-2xl mx-auto font-medium">
              Get a smart, AI-powered budget breakdown tailored to your event type, guest count, and city. Adjust allocations and get instant recommendations.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-card p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sage-500" /> Event Details
                </h2>

                {/* Event Type */}
                <div className="mb-6">
                  <label className="block text-dark-700 font-bold text-sm mb-2">Event Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EVENT_TYPES.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => setEventType(ev.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          eventType === ev.id ? 'border-sage-500 bg-sage-50' : 'border-sage-100 hover:border-sage-200'
                        }`}
                      >
                        <span className="text-lg block mb-1">{ev.icon}</span>
                        <span className={`text-xs font-bold ${eventType === ev.id ? 'text-sage-700' : 'text-dark-600'}`}>{ev.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Count */}
                <div className="mb-6">
                  <label className="block text-dark-700 font-bold text-sm mb-2">
                    Guest Count: <span className="text-sage-600">{guestCount} guests</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-sage-600"
                  />
                  <div className="flex justify-between text-xs text-dark-400 mt-1">
                    <span>10</span><span>500</span><span>1000</span>
                  </div>
                </div>

                {/* City */}
                <div className="mb-6">
                  <label className="block text-dark-700 font-bold text-sm mb-2">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-sage-200 rounded-xl text-sm font-medium text-dark-800 bg-white outline-none focus:ring-2 focus:ring-sage-300"
                  >
                    {Object.keys(CITY_MULTIPLIERS).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Luxury Level */}
                <div className="mb-6">
                  <label className="block text-dark-700 font-bold text-sm mb-2">
                    Style: <span className="text-sage-600">{luxuryLabels[luxuryLevel]}</span>
                  </label>
                  <div className="flex gap-1">
                    {luxuryLabels.map((label, i) => (
                      <button
                        key={label}
                        onClick={() => setLuxuryLevel(i)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          luxuryLevel === i ? 'bg-sage-600 text-white' : 'bg-sage-50 text-dark-500 hover:bg-sage-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Budget */}
                <div className="mb-6">
                  <label className="block text-dark-700 font-bold text-sm mb-2">Custom Budget (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value ? Number(e.target.value) : '')}
                      placeholder={estimatedBudget.toLocaleString('en-IN')}
                      className="w-full pl-8 pr-4 py-3 border border-sage-200 rounded-xl text-sm font-medium text-dark-800 outline-none focus:ring-2 focus:ring-sage-300"
                    />
                  </div>
                  <p className="text-dark-400 text-xs mt-1">Leave empty to use AI estimate</p>
                </div>

                {/* Estimated Budget */}
                <div className="bg-gradient-to-br from-sage-700 to-sage-900 rounded-2xl p-5 text-center">
                  <p className="text-sage-200 text-xs font-bold uppercase tracking-wider mb-1">Estimated Budget</p>
                  <p className="font-display text-3xl font-bold text-white">₹{totalBudget.toLocaleString('en-IN')}</p>
                  <p className="text-sage-300 text-xs mt-1">For {guestCount} guests in {city}</p>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-3" ref={resultView.ref}>
              {/* Budget Breakdown */}
              <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-sage-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-sage-500" /> Budget Breakdown
                  </h2>
                  <button onClick={resetAllocations} className="text-xs font-bold text-sage-600 hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Visual bar */}
                <div className="flex h-3 rounded-full overflow-hidden mb-6">
                  {categoryAmounts.map(cat => (
                    <div
                      key={cat.id}
                      className={cat.color}
                      style={{ width: `${allocations[cat.id]}%` }}
                      title={`${cat.label}: ${allocations[cat.id]}%`}
                    />
                  ))}
                </div>

                {/* Category sliders */}
                <div className="space-y-4">
                  {categoryAmounts.map(cat => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-bold text-sage-900 text-sm">{cat.label}</span>
                          {cat.essential && <span className="text-[10px] font-bold text-sage-600 bg-sage-100 px-1.5 py-0.5 rounded">Essential</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-display font-bold text-sage-900 text-sm">₹{cat.amount.toLocaleString('en-IN')}</span>
                          <span className="text-dark-400 text-xs ml-1.5">{allocations[cat.id]}%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={allocations[cat.id]}
                        onChange={(e) => updateAllocation(cat.id, Number(e.target.value))}
                        className="w-full accent-sage-600 h-1.5"
                      />
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-sage-100 flex items-center justify-between">
                  <span className="font-bold text-dark-700 text-sm">Total Allocated</span>
                  <div className="text-right">
                    <span className={`font-display text-xl font-bold ${totalAllocated === 100 ? 'text-sage-600' : 'text-cream-700'}`}>
                      {totalAllocated}%
                    </span>
                    {totalAllocated !== 100 && (
                      <p className="text-xs text-cream-600 font-medium">
                        {totalAllocated < 100 ? `${100 - totalAllocated}% unallocated` : `${totalAllocated - 100}% over`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-5 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-gold-500" /> Smart Recommendations
                </h2>
                <div className="space-y-3">
                  {recommendations.map((tip, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-4 rounded-xl ${
                        tip.priority === 'high' ? 'bg-cream-50 border border-cream-200' :
                        tip.priority === 'medium' ? 'bg-sage-50 border border-sage-100' :
                        'bg-sage-50/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tip.priority === 'high' ? 'bg-cream-200' :
                        tip.priority === 'medium' ? 'bg-sage-200' :
                        'bg-sage-100'
                      }`}>
                        <tip.icon className={`w-4 h-4 ${tip.priority === 'high' ? 'text-cream-700' : 'text-sage-600'}`} />
                      </div>
                      <p className="text-dark-700 text-sm font-medium leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Category Cards */}
              <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
                <h2 className="font-display text-xl font-bold text-sage-900 mb-5">Find Vendors in Your Budget</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryAmounts.filter(c => c.essential).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/vendors?category=${cat.label}`)}
                      className="p-4 rounded-xl border-2 border-sage-100 hover:border-sage-400 hover:bg-sage-50 transition-all text-left group"
                    >
                      <span className="text-2xl block mb-2">{cat.icon}</span>
                      <p className="font-bold text-sage-900 text-sm">{cat.label}</p>
                      <p className="text-sage-600 text-xs font-medium mt-0.5">₹{cat.amount.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-1 mt-2 text-sage-600 text-xs font-bold">
                        Browse <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="orb w-64 h-64 bg-gold-500/10 -top-10 -right-10" />
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold text-white mb-3">Ready to Start Booking?</h3>
                  <p className="text-sage-200 text-sm mb-6 max-w-md mx-auto font-medium">
                    Browse 2,500+ verified vendors that fit your budget. No upfront payment required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate('/vendors')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow transition-all"
                    >
                      Browse Vendors <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                    >
                      <Download className="w-4 h-4" /> Save Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
