import { Sparkles, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Linkedin, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const serviceLinks = [
  { label: 'Catering', cat: 'Catering' },
  { label: 'Decoration', cat: 'Decoration' },
  { label: 'Venues', cat: 'Venue' },
  { label: 'Photography', cat: 'Photography' },
  { label: 'Entertainment', cat: 'Entertainment' },
  { label: 'Coordinators', cat: 'Coordinator' },
];

const occasionLinks = [
  { label: 'Weddings', occ: 'Wedding' },
  { label: 'Birthday Parties', occ: 'Birthday' },
  { label: 'Corporate Events', occ: 'Corporate' },
  { label: 'Anniversaries', occ: 'Anniversary' },
  { label: 'Engagements', occ: 'Engagement' },
  { label: 'Baby Showers', occ: 'Baby Shower' },
];

const staticLinks = {
  Company: [
    { label: 'How It Works', path: '/explore' },
    { label: 'Explore', path: '/explore' },
    { label: 'Partner with Us', path: '/auth' },
  ],
  Support: [
    { label: 'Help Center', path: '/' },
    { label: 'Terms of Service', path: '/' },
    { label: 'Privacy Policy', path: '/' },
  ],
};

const socialIcons = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-sage-950 text-sage-300">
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Plan Your Dream Event?
              </h3>
              <p className="text-sage-400 font-medium">Join 50,000+ happy clients who trusted Festivo with their celebrations.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:border-sage-400 hover:text-sage-300 transition-all duration-200"
              >
                List Your Business
              </button>
              <button
                onClick={() => navigate('/vendors')}
                className="px-6 py-3 rounded-xl bg-gradient-brand text-white font-bold hover:shadow-glow hover:scale-105 transition-all duration-300"
              >
                Start Planning
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">Festivo</span>
            </button>
            <p className="text-sage-400 text-sm leading-relaxed mb-6 font-medium">
              India's premier digital event platform connecting customers with the finest event service providers across the country.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: Mail, text: 'Arshithgroup@info.com' },
                { icon: Phone, text: '+91 8618471424' },
                { icon: MapPin, text: 'Banglore, Karnataka, India' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-sage-500 flex-shrink-0" />
                  <span className="text-sage-400 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {socialIcons.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-sage-800 flex items-center justify-center text-sage-400 hover:bg-sage-600 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map(({ label, cat }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(`/vendors?category=${cat}`)}
                    className="text-sage-400 text-sm hover:text-sage-300 transition-colors duration-200 text-left hover-underline font-medium"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Occasions</h4>
            <ul className="space-y-3">
              {occasionLinks.map(({ label, occ }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(`/vendors?occasion=${occ}`)}
                    className="text-sage-400 text-sm hover:text-sage-300 transition-colors duration-200 text-left hover-underline font-medium"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {Object.entries(staticLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      className="text-sage-400 text-sm hover:text-sage-300 transition-colors duration-200 text-left hover-underline font-medium"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sage-500 text-sm font-medium">
            © 2026 Arshithgroup Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
