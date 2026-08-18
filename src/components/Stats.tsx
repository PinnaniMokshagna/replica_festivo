import { useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';

const stats = [
  { value: 50000, suffix: '+', label: 'Happy Clients', desc: 'Events planned successfully' },
  { value: 2500, suffix: '+', label: 'Verified Vendors', desc: 'Across 6 service categories' },
  { value: 120, suffix: '+', label: 'Cities Covered', desc: 'Pan-India presence' },
  { value: 4.9, suffix: '/5', label: 'Average Rating', desc: 'Based on 12K+ reviews', decimal: true },
];

function CountUp({ target, suffix, decimal, active }: { target: number; suffix: string; decimal?: boolean; active: boolean }) {
  const [count, setCount] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!active || animatedRef.current) return;
    animatedRef.current = true;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(decimal ? Math.round(current * 10) / 10 : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [active, target, decimal]);

  const display = decimal ? count.toFixed(1) : count.toLocaleString('en-IN');
  return <span>{display}{suffix}</span>;
}

export default function Stats() {
  const { ref, inView } = useInView(0.2);

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-r from-sage-700 via-sage-600 to-sage-700" />
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map(({ value, suffix, label, desc, decimal }, i) => (
            <div
              key={label}
              className={`text-center animate-on-scroll ${inView ? 'in-view' : ''} delay-${(i + 1) * 100}`}
            >
              <div className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow">
                <CountUp target={value} suffix={suffix} decimal={decimal} active={inView} />
              </div>
              <p className="text-white font-bold text-lg mb-1">{label}</p>
              <p className="text-white/70 text-sm font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
