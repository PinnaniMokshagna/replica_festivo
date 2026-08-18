import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1',
    tag: 'Dream Weddings',
    title: 'Your Perfect',
    highlight: 'Wedding Day',
    subtitle: 'Begins Here',
  },
  {
    image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1',
    tag: 'Corporate Events',
    title: 'Elevate Your',
    highlight: 'Corporate',
    subtitle: 'Experience',
  },
  {
    image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1',
    tag: 'Unforgettable Parties',
    title: 'Celebrate Every',
    highlight: 'Milestone',
    subtitle: 'In Style',
  },
];

const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Engagement', 'Baby Shower'];

const CITIES = [
  { name: 'Bangalore', enabled: true },
  { name: 'Mumbai', enabled: false },
  { name: 'Delhi NCR', enabled: false },
  { name: 'Hyderabad', enabled: false },
  { name: 'Chennai', enabled: false },
  { name: 'Kolkata', enabled: false },
  { name: 'Pune', enabled: false },
  { name: 'Goa', enabled: false },
  { name: 'Ahmedabad', enabled: false },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [eventType, setEventType] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (eventType) params.set('occasion', eventType);
    if (city) params.set('city', city);
    if (date) params.set('date', date);
    navigate(`/vendors?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Darker overlay for guaranteed text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-950/70 via-sage-900/50 to-sage-950/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-sage-950/40 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        
        {/* Dynamic Animated Text Headline Box */}
        <div className="relative mb-8 min-h-[220px] sm:min-h-[240px] md:min-h-[260px] flex items-center justify-center">
          {slides.map((s, i) => (
            <div
              key={i}
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 transform"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.98)',
                pointerEvents: i === current ? 'auto' : 'none',
              }}
            >
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 mb-4 shadow-md">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider">{s.tag}</span>
              </div>

              {/* Perfectly Proportioned Responsive Title */}
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] drop-shadow-xl text-center max-w-4xl mx-auto px-2">
                <span>{s.title}</span>{' '}
                <span className="text-gradient-gold bg-clip-text text-transparent bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 inline-block">
                  {s.highlight}
                </span>{' '}
                <span className="block mt-1 sm:mt-2 text-white">{s.subtitle}</span>
              </h1>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '0.3s' }}
        >
          <div className="bg-white rounded-2xl shadow-card-hover p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-600">
                <Search className="w-4 h-4" />
              </div>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full pl-10 pr-4 py-4 text-sage-900 bg-transparent rounded-xl focus:bg-sage-50 transition-colors outline-none text-sm font-bold appearance-none cursor-pointer search-input"
              >
                <option value="">Select Occasion</option>
                {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-500 pointer-events-none" />
            </div>

            <div className="hidden md:block w-px bg-sage-200 my-2" />

            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-600">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-8 py-4 text-sage-900 bg-transparent rounded-xl focus:bg-sage-50 transition-colors outline-none text-sm font-bold appearance-none cursor-pointer search-input"
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name} disabled={!c.enabled}>
                    {c.name}{!c.enabled ? ' (Disabled)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-500 pointer-events-none" />
            </div>

            <div className="hidden md:block w-px bg-sage-200 my-2" />

            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-600">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-4 text-sage-900 bg-transparent rounded-xl focus:bg-sage-50 transition-colors outline-none text-sm font-bold search-input"
              />
            </div>

            <button
              onClick={handleSearch}
              className="md:w-auto w-full px-8 py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.02] transition-all duration-300 active:scale-95 whitespace-nowrap"
            >
              Search Vendors
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
