import { useNavigate } from 'react-router-dom';
import { useInView } from '../hooks/useInView';

const occasions = [
  {
    title: 'Wedding',
    image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '850+ Vendors',
    badge: 'Most Popular',
    badgeColor: 'bg-sage-600',
  },
  {
    title: 'Birthday Party',
    image: 'https://images.pexels.com/photos/1405528/pexels-photo-1405528.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '620+ Vendors',
    badge: null,
    badgeColor: '',
  },
  {
    title: 'Corporate Event',
    image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '430+ Vendors',
    badge: 'Trending',
    badgeColor: 'bg-cream-600',
  },
  {
    title: 'Anniversary',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '380+ Vendors',
    badge: null,
    badgeColor: '',
  },
  {
    title: 'Engagement',
    image: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '290+ Vendors',
    badge: null,
    badgeColor: '',
  },
  {
    title: 'Baby Shower',
    image: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    count: '210+ Vendors',
    badge: null,
    badgeColor: '',
  },
];

export default function Occasions() {
  const { ref, inView } = useInView();
  const navigate = useNavigate();

  return (
    <section id="occasions" className="py-24 bg-cream-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 animate-on-scroll ${inView ? 'in-view' : ''}`}>
          <span className="inline-block text-sage-600 text-sm font-bold tracking-widest uppercase mb-3">
            Every Celebration
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-sage-900 mb-4">
            What Are You
            <span className="text-gradient"> Celebrating?</span>
          </h2>
          <p className="text-dark-500 text-lg max-w-xl mx-auto font-medium">
            From intimate gatherings to grand celebrations — we have the perfect vendors for every occasion.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {occasions.map((occ, i) => (
            <div
              key={occ.title}
              className={`animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i + 1) * 100}`}
            >
              <div
                onClick={() => navigate(`/vendors?occasion=${occ.title}`)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer card-hover aspect-[4/3] shadow-card"
              >
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-950/85 via-sage-950/25 to-transparent" />

                {occ.badge && (
                  <div className="absolute top-3 right-3">
                    <span className={`${occ.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-soft`}>
                      {occ.badge}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-white font-bold text-lg md:text-xl mb-1">
                    {occ.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-xs font-bold">{occ.count}</span>
                    <span className="text-white/0 group-hover:text-white/90 text-xs font-bold transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 animate-on-scroll ${inView ? 'in-view' : ''} delay-700`}>
          <button
            onClick={() => navigate('/vendors')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-sage-300 text-sage-700 font-bold hover:bg-sage-50 hover:border-sage-500 transition-all duration-300 group"
          >
            View All Occasions
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
