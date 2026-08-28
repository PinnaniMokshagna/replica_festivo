import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LogOut, User, Store, LayoutDashboard, ChevronDown, Calendar, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useUserAvatar } from '../lib/userAvatar';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Vendors', href: '/vendors' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, profile, signOut } = useAuth();
  const { avatarUrl } = useUserAvatar();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparent = isHome && !scrolled;

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === '/') {
      navigate('/');
    } else if (href.startsWith('/#')) {
      if (isHome) {
        document.querySelector(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userDisplayName = user?.email?.split('@')[0] || 'User';
  const isVendor = profile?.role === 'vendor';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent py-4'
          : 'bg-cream-50/95 backdrop-blur-xl shadow-soft py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className={`font-display text-2xl font-bold tracking-tight transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-sage-900'}`}>
                Festivo
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-sm font-bold hover-underline transition-colors duration-200 ${
                    isTransparent ? 'text-white/95 hover:text-white' : 'text-sage-700 hover:text-sage-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2 justify-end ml-auto">
            {user ? (
              /* SIGNED IN STATE */
              <>
                {/* User Dropdown Button (Username + ChevronDown) */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                      isTransparent ? 'text-white/95 hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                    }`}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-gold-400 flex-shrink-0" />
                    ) : isVendor ? (
                      <Store className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                    <span>{userDisplayName}</span>
                    {isVendor && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-gold-100 text-gold-700">
                        Vendor
                      </span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-sage-100 py-1.5 z-50 animate-fade-in">
                      <div className="px-3 py-1.5 border-b border-sage-100">
                        <p className="font-bold text-sage-900 text-xs truncate">{userDisplayName}</p>
                        <p className="text-dark-500 text-[11px] truncate">{user?.email}</p>
                      </div>

                      {isVendor ? (
                        <button
                          onClick={() => { setShowProfileMenu(false); navigate('/vendor-dashboard'); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sage-800 hover:bg-sage-50 transition-colors text-left"
                        >
                          <Store className="w-3.5 h-3.5 text-gold-600" />
                          <span>Vendor Studio</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => { setShowProfileMenu(false); navigate("/customer-dashboard?tab=overview"); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sage-800 hover:bg-sage-50 transition-colors text-left"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-sage-600" />
                            <span>My Dashboard</span>
                          </button>

                          <button
                            onClick={() => { setShowProfileMenu(false); navigate('/customer-dashboard?tab=bookings'); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sage-800 hover:bg-sage-50 transition-colors text-left"
                          >
                            <Calendar className="w-3.5 h-3.5 text-sage-600" />
                            <span>My Bookings</span>
                          </button>

                          <button
                            onClick={() => { setShowProfileMenu(false); navigate('/customer-dashboard?tab=saved'); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sage-800 hover:bg-sage-50 transition-colors text-left"
                          >
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                            <span>Saved Vendors</span>
                          </button>
                        </>
                      )}

                      <div className="border-t border-sage-100 my-1" />

                      <button
                        onClick={() => { setShowProfileMenu(false); handleSignOut(); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* BEFORE SIGNED IN (GUEST STATE) */
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className={`text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isTransparent ? 'text-white/95 hover:bg-white/10' : 'text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/vendors')}
                  className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-brand text-white shadow-glow hover:shadow-card-hover hover:scale-105 transition-all duration-300 active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isTransparent ? 'text-white' : 'text-sage-800'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-cream-50 border-t border-sage-200 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left text-sage-800 font-bold py-2 hover:text-sage-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              /* SIGNED IN (Mobile) */
              <>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sage-50 border border-sage-200">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gold-400 flex-shrink-0" />
                  ) : isVendor ? (
                    <Store className="w-5 h-5 text-sage-700" />
                  ) : (
                    <User className="w-5 h-5 text-sage-700" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-sage-900 block truncate">{userDisplayName}</span>
                    <span className="text-[10px] text-dark-400 font-medium block truncate">{user?.email}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isVendor ? 'bg-gold-100 text-gold-700' : 'bg-sage-100 text-sage-600'}`}>
                    {isVendor ? 'Vendor' : 'Customer'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); navigate(isVendor ? '/vendor-dashboard' : '/customer-dashboard?tab=bookings'); }}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border border-sage-200 bg-white text-sage-800"
                  >
                    <Calendar className="w-3.5 h-3.5 text-sage-600" /> Bookings
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate(isVendor ? '/vendor-dashboard' : '/customer-dashboard?tab=saved'); }}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border border-sage-200 bg-white text-sage-800"
                  >
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Saved
                  </button>
                </div>

                <button
                  onClick={() => { setMobileOpen(false); navigate(isVendor ? '/vendor-dashboard' : '/customer-dashboard'); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-sage-200 text-sage-700 hover:bg-sage-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> My Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-sm font-bold py-2.5 rounded-xl border border-sage-300 text-sage-700 hover:border-sage-500 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              /* BEFORE SIGNED IN (Mobile) */
              <button
                onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl border border-sage-300 text-sage-700 hover:border-sage-500 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
            
            <button
              onClick={() => { setMobileOpen(false); navigate('/vendors'); }}
              className="w-full text-sm font-bold py-2.5 rounded-xl bg-gradient-brand text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
