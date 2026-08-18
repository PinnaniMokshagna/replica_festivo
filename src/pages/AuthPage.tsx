import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
  CheckCircle2, Building2, Users, Shield, Zap,
  Store, Search, CalendarCheck, ChevronDown, Tag,
  TrendingUp, Heart, Briefcase, Phone, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, type UserRole } from '../lib/auth';
import { ALL_CATEGORIES } from '../lib/categories';
import { safeSetItem } from '../lib/storageUtils';

/* ── Data ───────────────────────────────────────────────────────── */

const VENDOR_FEATURES = [
  { icon: Building2, text: 'Create your vendor profile & showcase portfolio' },
  { icon: TrendingUp, text: 'Get discovered by thousands of event planners' },
  { icon: Zap, text: 'Receive & manage bookings instantly' },
  { icon: Shield, text: 'Verified badge & priority listing' },
];

const CUSTOMER_FEATURES = [
  { icon: Search, text: 'Access 2,500+ verified vendors across India' },
  { icon: Heart, text: 'Save favourites and compare vendors easily' },
  { icon: CalendarCheck, text: 'Instant booking with secure payments' },
  { icon: Shield, text: 'Free cancellation & full buyer protection' },
];

const vendorSlides = [
  { image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'For Vendors', title: 'Grow Your\nBusiness' },
  { image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Showcase', title: 'Your Work,\nAmplified' },
  { image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Connect', title: 'Reach More\nCustomers' },
];

const customerSlides = [
  { image: 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'For Customers', title: 'Plan Perfect\nEvents' },
  { image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Discover', title: 'Find The Best\nVendors' },
  { image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Celebrate', title: 'Every Moment\nMatters' },
];

const adminSlides = [
  { image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'For Administrators', title: 'Platform\nOversight' },
  { image: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1', tag: 'Analytics', title: 'Performance\n& Growth' }
];

const ADMIN_FEATURES = [
  { icon: Shield, text: 'Review and approve pending vendor submissions' },
  { icon: Sparkles, text: 'Verify event categories and listings' },
  { icon: TrendingUp, text: 'Analyze platform bookings and commission revenues' },
];

/* ── Main Component ─────────────────────────────────────────────── */

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, signOut, user, profile, setDemoAdmin } = useAuth();

  const getInitialRole = (): UserRole | null => {
    if (searchParams.get('admin') === 'true' || searchParams.get('role') === 'admin') return 'admin';
    return (searchParams.get('role') as UserRole) || 'customer';
  };
  const [role, setRole] = useState<UserRole | null>(getInitialRole());
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => (getInitialRole() === 'admin' ? 'admin@festivo.com' : ''));
  const [password, setPassword] = useState(() => (getInitialRole() === 'admin' ? 'admin123' : ''));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotice, setOtpNotice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Photographer']);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1 ? prev.filter((c) => c !== cat) : prev
        : [...prev, cat]
    );
  };

  useEffect(() => {
    let t: any;
    if (otpTimer > 0) {
      t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [otpTimer]);

  const sendOtpCode = () => {
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(60);
    setOtpNotice('✓ Verification code sent! Use mock OTP: 123456');
  };

  const slides = role === 'vendor' ? vendorSlides : (role === 'admin' ? adminSlides : customerSlides);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSlideIndex(0);
  }, [role]);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    if (user) {
      // If the logged-in user's role does not match the role selected on the AuthPage,
      // sign them out first so they can log in/register for the new role.
      if (profile && role && profile.role !== role) {
        signOut();
        return;
      }
      if (profile?.role === 'admin' || role === 'admin') navigate('/admin');
      else if (profile?.role === 'vendor' || role === 'vendor') navigate('/vendor-dashboard');
      else navigate('/dashboard');
    }
  }, [user, profile, navigate, role, signOut]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const isAdminLogin = role === 'admin' || searchParams.get('admin') === 'true';

    // 1. ADMIN SIGN IN
    if (isAdminLogin) {
      setLoading(true);
      if (email.trim().toLowerCase() === 'admin@festivo.com' && password === 'admin123') {
        localStorage.setItem('festivo_admin_authenticated', 'true');
        setLoading(false);
        navigate('/admin');
        return;
      } else {
        setLoading(false);
        setError('Invalid Admin Credentials. Unique Admin Login: admin@festivo.com / admin123');
        return;
      }
    }

    // 2. SIGN UP VALIDATION
    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your full name');
      if (!mobileNumber.trim()) return setError('Please enter your mobile number');
      if (!otp.trim()) return setError('Please enter the OTP');
      if (otp !== '123456') return setError('Invalid OTP. Please use the verification code 123456');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (!agreeTerms) return setError('You must agree to the Terms & Conditions');
    }

    // 3. VENDOR / CUSTOMER SIGN IN & SIGN UP
    setLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();

      // ── ALWAYS enqueue vendor into admin applications FIRST ──
      // This runs before signIn/signUp so it cannot be skipped
      if (role === 'vendor') {
        const specStatus = localStorage.getItem(`festivo_kyc_status_${emailLower}`);
        if (specStatus === 'Approved') {
          localStorage.setItem('vendor_kyc_status', 'verified');
        } else if (specStatus === 'Pending Verification' || specStatus === 'pending') {
          localStorage.setItem('vendor_kyc_status', 'pending');
        } else {
          localStorage.setItem('vendor_kyc_status', 'unverified');
          localStorage.setItem(`festivo_kyc_status_${emailLower}`, 'unverified');
        }

        // Write to festivo_pending_vendors immediately
        try {
          const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
          const alreadyExists = pendingList.some(
            (v: any) => (v.details?.email || '').toLowerCase().trim() === emailLower
          );
          if (!alreadyExists) {
            const emailPrefix = emailLower.split('@')[0];
            const autoName = emailPrefix
              .replace(/[._\-]/g, ' ')
              .split(' ').filter(Boolean)
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Vendor';
            const vendorName = name?.trim() || autoName;
            const isStudio = vendorName.toLowerCase().includes('studio') || vendorName.toLowerCase().includes('events') || vendorName.toLowerCase().includes('photography');
            const businessName = isStudio ? vendorName : `${vendorName} Events`;
            const finalCategoryStr = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Photographer';
            const newPendingEntry = {
              id: `VND-${Math.floor(100000 + Math.random() * 900000)}`,
              name: businessName,
              category: finalCategoryStr,
              location: 'Hyderabad, India',
              price_amount: 25000,
              price_label: 'Starting Package',
              price_unit: 'event',
              rating: 5.0,
              reviews: 0,
              image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
              logo: vendorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'VN',
              verified: false,
              badge: 'Pending Review',
              badge_color: 'bg-gold-500',
              slug: emailPrefix.replace(/[^a-z0-9]/g, '-'),
              details: {
                email: emailLower,
                phone: mobileNumber || '',
                owner: vendorName,
                address: 'Hyderabad, India',
                registrationDate: new Date().toISOString().split('T')[0],
                status: 'Pending Verification',
                kyc: {
                  idNumber: 'Not submitted',
                  aadhaarFront: '',
                  cancelledCheque: '',
                },
              },
            };
            pendingList.unshift(newPendingEntry);
            safeSetItem('festivo_pending_vendors', JSON.stringify(pendingList));

            // Notify admin
            const notifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
            notifications.unshift({
              id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
              type: 'new_application',
              vendorId: newPendingEntry.id,
              vendorName: businessName,
              message: `New vendor "${businessName}" (${emailLower}) registered on Festivo.`,
              timestamp: new Date().toISOString(),
              read: false,
            });
            safeSetItem('festivo_admin_notifications', JSON.stringify(notifications));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {
          console.warn('Could not enqueue vendor to pending list:', e);
        }
      }

      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password, role as 'vendor' | 'customer' | undefined ?? undefined);
        setLoading(false);
        if (error && !error.toLowerCase().includes('failed to fetch')) {
          setError(error);
          return;
        }
        navigate(role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
      } else {
        if (!role) { setLoading(false); return; }
        const finalCatStr = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Photographer';
        const { error } = await signUp(email.trim(), password, name || 'New Account', role, finalCatStr);
        setLoading(false);
        if (error && !error.toLowerCase().includes('failed to fetch')) {
          setError(error);
          return;
        }
        if (role === 'customer') {
          navigate('/dashboard');
        } else {
          setMode('signin');
          setSuccessMsg('Vendor Account created successfully! Please sign in with your credentials to access your Vendor Dashboard.');
          setError('');
        }
      }
    } catch (err) {
      setLoading(false);
      navigate(role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
    }
  };

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setError('');
    setConfirmPassword('');
    setMobileNumber('');
    setOtp('');
    setAgreeTerms(false);
    setOtpSent(false);
    setOtpTimer(0);
    setOtpNotice('');
  };

  const resetRole = () => {
    setRole(null);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMobileNumber('');
    setOtp('');
    setAgreeTerms(false);
    setOtpSent(false);
    setOtpTimer(0);
    setOtpNotice('');
  };

  const slide = slides[slideIndex] ?? slides[0];
  const isVendor = role === 'vendor';
  const isAdmin = role === 'admin';

  /* ── Render ───────────────────────────────────────────────────── */

  // No role selected yet → show role selection screen
  if (!role) {
    return <RoleSelectionScreen mounted={mounted} onSelect={setRole} onBack={() => navigate('/')} />;
  }

  // Role selected → show auth form
  return (
    <>
      <div className="min-h-screen lg:h-screen w-full relative overflow-hidden bg-cream-50 lg:flex">
        {/* Visual panel (Left in Customer Mode, Right in Vendor Mode) */}
        <div
          className={`hidden lg:flex lg:absolute lg:top-0 lg:bottom-0 lg:left-0 lg:w-1/2 lg:h-full relative overflow-hidden z-20 transition-transform duration-700 ease-in-out ${
            isVendor ? 'lg:translate-x-full' : 'lg:translate-x-0'
          }`}
        >
          {slides.map((s, i) => (
            <div
              key={`${role}-${i}`}
              className="absolute inset-0 transition-all duration-1000"
              style={{ opacity: i === slideIndex ? 1 : 0, transform: i === slideIndex ? 'scale(1)' : 'scale(1.05)' }}
            >
              <img src={s.image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}

          {/* Mixed multi-layer blend overlays */}
          <div className={`absolute inset-0 mix-swap-panel ${isVendor ? 'bg-sage-950/90 mix-blend-multiply' : (isAdmin ? 'bg-slate-950/95 mix-blend-multiply' : 'bg-sage-900/80 mix-blend-multiply')}`} />
          <div className={`absolute inset-0 mix-swap-panel backdrop-blur-[2px] ${isVendor ? 'bg-gradient-to-br from-sage-950/90 via-sage-900/60 to-gold-950/70' : (isAdmin ? 'bg-gradient-to-br from-slate-950/95 via-sage-900/40 to-slate-950/95' : 'bg-gradient-to-br from-sage-900/85 via-sage-800/40 to-sage-900/75')}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-950/70 via-transparent to-transparent" />

          <div className="orb w-96 h-96 bg-sage-600/20 -top-20 -left-20" />
          <div className="orb w-72 h-72 bg-gold-400/15 bottom-10 right-10" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 text-white h-full w-full">
            {/* Logo */}
            <div className="flex items-center justify-between max-w-lg mx-auto w-full">
              <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group w-fit">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-2xl font-bold">Festivo</span>
              </button>

              {/* Role badge */}
              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl mix-swap-panel ${isVendor ? 'bg-sage-800/60 border border-gold-400/30' : (isAdmin ? 'bg-slate-800/60 border border-gold-400/30' : 'bg-sage-700/40 border border-white/20')} backdrop-blur-sm`}>
                {isVendor ? <Store className="w-4 h-4 text-gold-400 animate-pulse" /> : (isAdmin ? <Shield className="w-4 h-4 text-gold-400 animate-pulse" /> : <Users className="w-4 h-4 text-cream-400" />)}
                <span className="text-xs font-bold">{isVendor ? 'Vendor Portal' : (isAdmin ? 'Admin Portal' : 'Customer Portal')}</span>
              </div>
            </div>

            {/* Slide content with mixed fade & scale transition */}
            <div key={`${role}-${slideIndex}`} className="animate-fade-up my-auto py-6 mix-swap-panel text-left flex flex-col items-start max-w-lg mx-auto w-full">
              <p className={`text-sm sm:text-base font-bold tracking-widest uppercase mb-3 mix-swap-panel ${isVendor ? 'text-gold-400' : (isAdmin ? 'text-gold-400' : 'text-cream-400')}`}>
                {slide.tag}
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 whitespace-pre-line drop-shadow-lg mix-swap-panel text-left">
                {slide.title}
              </h2>

              {/* Feature list */}
              <div className="space-y-4 w-full">
                {(isVendor ? VENDOR_FEATURES : (isAdmin ? ADMIN_FEATURES : CUSTOMER_FEATURES)).slice(0, 3).map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3.5 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mix-swap-panel ${isVendor ? 'bg-gold-400/15 border border-gold-400/25' : (isAdmin ? 'bg-gold-500/20 border border-gold-500/25' : 'bg-sage-500/20 border border-sage-400/25')}`}>
                      <Icon className={`w-5 h-5 mix-swap-panel ${isVendor ? 'text-gold-400' : (isAdmin ? 'text-gold-400' : 'text-cream-300')}`} />
                    </div>
                    <span className="text-sage-100 text-sm sm:text-base lg:text-lg font-semibold leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="space-y-3 flex flex-col items-start max-w-lg mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['1239291', '1516680', '1181686', '1024993'].map(n => (
                    <div key={n} className="w-6.5 h-6.5 rounded-full border border-sage-900 overflow-hidden">
                      <img
                        src={`https://images.pexels.com/photos/${n}/pexels-photo-${n}.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sage-200 text-sm font-semibold mix-swap-panel">
                  {isVendor ? 'Join 2,500+ vendors' : (isAdmin ? 'Secure Administration Portal' : 'Join 50,000+ happy customers')}
                </p>
              </div>

              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className={`transition-all duration-300 rounded-full ${i === slideIndex ? 'w-5 h-1 bg-gold-400' : 'w-1.5 h-1 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form panel with mixed morphing background and card transition */}
        <div
          className={`w-full lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-1/2 lg:h-full flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-gradient-to-tr from-cream-50 via-white to-sage-50/30 z-10 overflow-y-auto transition-transform duration-700 ease-in-out relative ${
            isVendor ? 'lg:-translate-x-full' : 'lg:translate-x-0'
          }`}
        >
          {/* Floating background blur orbs */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-sage-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-gold-100/30 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 sm:top-10 sm:left-10 lg:top-12 lg:left-12 xl:top-16 xl:left-16 flex items-center gap-2 px-3 py-1.5 rounded-full border border-sage-100 bg-white/80 hover:bg-white text-dark-600 hover:text-sage-800 transition-all font-semibold text-xs shadow-sm hover:shadow z-30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className={`w-full max-w-[480px] my-auto mix-swap-panel z-10 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_20px_50px_rgba(74,93,78,0.05)] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${role}-${mode}`}
                  initial={{ opacity: 0, x: isVendor ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isVendor ? 30 : -30 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full text-left"
                >
                  {/* Mobile logo */}
                  <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
                    <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display text-2xl font-bold text-sage-900">Festivo</span>
                  </div>

                  {/* Portal Badge */}
                  <div className="flex justify-start mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isVendor 
                        ? 'bg-gold-500/10 text-gold-700 border border-gold-400/20' 
                        : (isAdmin ? 'bg-slate-900 text-gold-400 border border-gold-500/25' : 'bg-sage-600/10 text-sage-800 border border-sage-500/20')
                    }`}>
                      {isVendor ? <Store className="w-3.5 h-3.5" /> : (isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />)}
                      {isVendor ? 'Vendor Portal' : (isAdmin ? 'Admin Portal' : 'Customer Portal')}
                    </span>
                  </div>

                  {/* Heading */}
                  <div className="text-left mb-6">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-sage-900 tracking-tight mb-2">
                      {mode === 'signin'
                        ? isVendor ? 'Vendor Sign In' : (isAdmin ? 'Admin Sign In' : 'Welcome Back')
                        : isVendor ? 'Create Vendor Account' : 'Create Account'}
                    </h1>
                    <p className="text-dark-500 text-xs sm:text-sm">
                      {mode === 'signin'
                        ? 'Enter your details to access your portal'
                        : 'Fill in the details below to register'}
                    </p>
                  </div>

                  {/* Sign In / Sign Up toggle */}
                  {!isAdmin && (
                    <div className="flex gap-1 p-1 bg-sage-900/5 rounded-2xl mb-6">
                      {(['signin', 'signup'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => switchMode(m)}
                          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                            mode === m ? 'bg-white text-sage-800 shadow-sm' : 'text-dark-500 hover:text-sage-700'
                          }`}
                        >
                          {m === 'signin' ? 'Sign In' : 'Sign Up'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                      <div className="animate-fade-up">
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">
                          {isVendor ? 'Business Name' : 'Full Name'}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={isVendor ? 'Your business name' : 'Your full name'}
                            className="w-full pl-10 pr-4 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && isVendor && (
                      <div className="animate-fade-up space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-dark-700 font-bold text-xs flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-sage-600" />
                            <span>Business Categories</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                              {selectedCategories.length} selected
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCategories(
                                  selectedCategories.length === ALL_CATEGORIES.length
                                    ? ['Photographer']
                                    : [...ALL_CATEGORIES]
                                )
                              }
                              className="text-[10px] text-sage-700 hover:text-sage-900 font-bold underline transition-colors"
                            >
                              {selectedCategories.length === ALL_CATEGORIES.length ? 'Clear All' : 'Select All'}
                            </button>
                          </div>
                        </div>

                        {/* Inline Checkbox Grid Box */}
                        <div className="bg-white/90 backdrop-blur-sm border border-sage-200/80 rounded-2xl p-3 max-h-48 overflow-y-auto shadow-inner space-y-1">
                          <div className="grid grid-cols-2 gap-1.5">
                            {ALL_CATEGORIES.map((cat) => {
                              const isChecked = selectedCategories.includes(cat);
                              return (
                                <label
                                  key={cat}
                                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs transition-all border ${
                                    isChecked
                                      ? 'bg-sage-50 border-sage-300 text-sage-900 font-bold shadow-xs'
                                      : 'bg-cream-50/40 border-sage-100/50 hover:bg-cream-50 text-dark-700 font-medium'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCategory(cat)}
                                    className="w-3.5 h-3.5 rounded border-sage-300 text-sage-700 focus:ring-sage-500 cursor-pointer accent-sage-700"
                                  />
                                  <span className="truncate">{cat}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Category Badges */}
                        {selectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-20 overflow-y-auto">
                            {selectedCategories.map((cat) => (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-sage-100 text-sage-900 border border-sage-200/80 shadow-2xs"
                              >
                                {cat}
                                <button
                                  type="button"
                                  onClick={() => toggleCategory(cat)}
                                  className="text-sage-500 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-dark-700 font-bold text-xs mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                        />
                      </div>
                    </div>

                    {mode === 'signup' && (
                      <div className="animate-fade-up">
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="10-digit mobile number"
                              className="w-full pl-10 pr-4 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={sendOtpCode}
                            disabled={otpTimer > 0}
                            className="px-4 py-2 bg-sage-800 hover:bg-sage-700 disabled:bg-sage-200 text-white disabled:text-dark-400 font-bold text-xs rounded-xl transition-all whitespace-nowrap flex-shrink-0"
                          >
                            {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send OTP'}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && otpSent && (
                      <div className="animate-fade-up space-y-2">
                        {otpNotice && (
                          <div className="p-2 bg-sage-50 border border-sage-200 rounded-xl text-xs text-sage-800 font-bold">
                            {otpNotice}
                          </div>
                        )}
                        <div>
                          <label className="block text-dark-700 font-bold text-xs mb-1.5">Verification OTP</label>
                          <div className="relative">
                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="6-digit verification code"
                              className="w-full pl-10 pr-4 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-dark-700 font-bold text-xs mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                          required
                          className="w-full pl-10 pr-10 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-sage-700 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === 'signup' && (
                      <div className="animate-fade-up">
                        <label className="block text-dark-700 font-bold text-xs mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            required
                            className="w-full pl-10 pr-10 py-2.5 border border-sage-100 rounded-2xl text-sm text-dark-800 bg-white/50 focus:bg-white outline-none transition-all focus:ring-2 focus:ring-sage-500/15 focus:border-sage-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-sage-700 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-dark-500 font-medium my-4 select-none animate-fade-up">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded text-sage-600 focus:ring-sage-400 border-sage-200"
                        />
                        <span>
                          I agree to Festivo's{' '}
                          <button
                            type="button"
                            onClick={() => setModalType('terms')}
                            className="text-sage-700 font-bold hover:underline inline-block focus:outline-none"
                          >
                            Terms &amp; Conditions
                          </button>
                          {' '}and{' '}
                          <button
                            type="button"
                            onClick={() => setModalType('privacy')}
                            className="text-sage-700 font-bold hover:underline inline-block focus:outline-none"
                          >
                            Privacy Policy
                          </button>
                        </span>
                      </label>
                    )}

                    {mode === 'signin' && (
                      <div className="flex justify-end">
                        <button type="button" className="text-sage-600 text-xs font-bold hover:underline">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-3 bg-sage-50 border border-sage-200 rounded-xl animate-fade-in text-left">
                        <p className="text-sage-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
                          <span>{successMsg}</span>
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="p-2.5 bg-cream-100 border border-cream-300 rounded-xl animate-fade-in">
                        <p className="text-cream-900 text-xs font-bold">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-sage-800 hover:bg-sage-700 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-glow-sage hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Please wait...
                        </>
                      ) : (
                        <>
                          {mode === 'signin'
                            ? isVendor ? 'Sign In to Dashboard' : 'Sign In'
                            : isVendor ? 'Create Vendor Account' : 'Create Account'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Auto-Fill Credentials Box */}
                  <div className="mt-5 p-3.5 bg-gold-50/80 border border-gold-200 rounded-2xl text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gold-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                        {isAdmin ? 'Admin Portal Login' : isVendor ? 'Vendor Demo Login' : 'Customer Demo Login'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          if (isAdmin) {
                            setEmail('admin@festivo.com');
                            setPassword('admin123');
                          } else if (isVendor) {
                            setRole('vendor');
                            setEmail('bhavana@events.com');
                            setPassword('festivo2026');
                            setName('Bhavana Events');
                          } else {
                            setRole('customer');
                            setEmail('kranti@festivo.com');
                            setPassword('festivo2026');
                            setName('Kranti');
                          }
                          setError('');
                        }}
                        className="text-[11px] font-extrabold text-gold-800 bg-gold-200/70 hover:bg-gold-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Auto-Fill {isAdmin ? 'Admin' : 'Demo'}
                      </button>
                    </div>
                    <div className="text-[11px] text-dark-600 font-mono space-y-0.5">
                      <p><span className="text-dark-400 font-sans font-semibold">Email:</span> {isAdmin ? 'admin@festivo.com' : isVendor ? 'bhavana@events.com' : 'kranti@festivo.com'}</p>
                      <p><span className="text-dark-400 font-sans font-semibold">Password:</span> {isAdmin ? 'admin123' : 'festivo2026'}</p>
                    </div>
                  </div>

                  {/* Quick role switch hint */}
                  {!isAdmin && (
                    <div className="mt-6 text-left">
                      <span className="text-xs text-dark-400 font-medium">
                        {isVendor ? 'Looking for services?' : 'Are you a vendor?'}
                      </span>{' '}
                      <button
                        type="button"
                        onClick={() => setRole(isVendor ? 'customer' : 'vendor')}
                        className="text-xs text-sage-700 hover:text-sage-800 font-bold hover:underline transition-colors"
                      >
                        {isVendor ? 'Switch to Customer Portal' : 'Switch to Vendor Portal'}
                      </button>
                    </div>
                  )}

                  <p className="text-left text-dark-500 text-[11px] mt-4 font-medium">
                    By continuing, you agree to Festivo's{' '}
                    <button
                      type="button"
                      onClick={() => setModalType('terms')}
                      className="text-sage-600 font-bold hover:underline"
                    >
                      Terms
                    </button> &{' '}
                    <button
                      type="button"
                      onClick={() => setModalType('privacy')}
                      className="text-sage-600 font-bold hover:underline"
                    >
                      Privacy Policy
                    </button>.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {modalType && (
          <InfoModal type={modalType} onClose={() => setModalType(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Role Selection Screen ──────────────────────────────────────── */

function RoleSelectionScreen({
  mounted, onSelect, onBack,
}: {
  mounted: boolean;
  onSelect: (role: UserRole) => void;
  onBack: () => void;
}) {
  const [searchParams] = useSearchParams();
  const showAdmin = searchParams.get('admin') === 'true';

  return (
    <div className="min-h-screen bg-cream-50 relative overflow-hidden flex items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="orb w-96 h-96 bg-sage-400/20 -top-20 right-1/4" />
      <div className="orb w-72 h-72 bg-cream-400/20 bottom-0 left-1/4" style={{ animationDelay: '2s' }} />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-dark-500 hover:text-sage-700 transition-colors group z-10"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Home</span>
      </button>

      {/* Logo top center */}
      <button onClick={onBack} className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 group z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold text-sage-900">Festivo</span>
      </button>

      <div className={`relative z-10 w-full max-w-6xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Heading */}
        <div className="text-center mb-10 mt-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sage-900 mb-3">
            {showAdmin ? (
              <>Platform <span className="text-gradient">Admin Portal</span></>
            ) : (
              <>Select Your <span className="text-gradient">Portal</span></>
            )}
          </h1>
          <p className="text-dark-500 text-lg font-medium max-w-lg mx-auto">
            {showAdmin
              ? "Access the Festivo administration dashboard to manage platform bookings and approve vendor registrations."
              : "Choose your account type below. Portals for Customers and Vendors."}
          </p>
        </div>

        {/* Portal Cards */}
        <div className={`grid gap-6 ${showAdmin ? 'max-w-md mx-auto' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {!showAdmin && (
            <>
              {/* Customer Card */}
              <RoleCard
                role="customer"
                icon={Users}
                accentIcon={Search}
                title="Customer Portal"
                subtitle="Plan & Book Events"
                description="Discover 2,500+ verified vendors, compare prices, and book services for your event."
                features={CUSTOMER_FEATURES.slice(0, 3)}
                accent="sage"
                ctaLabel="Enter Customer Portal"
                mounted={mounted}
                onClick={() => onSelect('customer')}
              />

              {/* Vendor Card */}
              <RoleCard
                role="vendor"
                icon={Store}
                accentIcon={Briefcase}
                title="Vendor Portal"
                subtitle="Enrolled Business Partner"
                description="List your business by category, upload portfolio, and manage customer bookings."
                features={VENDOR_FEATURES.slice(0, 3)}
                accent="gold"
                ctaLabel="Vendor Sign In / Sign Up"
                mounted={mounted}
                onClick={() => onSelect('vendor')}
              />
            </>
          )}

          {/* Admin Card */}
          {showAdmin && (
            <div className="bg-sage-900 rounded-3xl p-8 text-white border-2 border-sage-700 shadow-card flex flex-col justify-between hover:border-gold-400/60 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-gold-400" />
                  </div>
                  <span className="bg-gold-500/20 text-gold-300 text-xs font-bold px-3 py-1 rounded-full border border-gold-400/30">
                    Admin Panel
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-1">Platform Admin</h2>
                <p className="text-gold-400 text-sm font-bold mb-3">Verification & Oversight</p>
                <p className="text-sage-200 text-sm leading-relaxed mb-6 font-medium">
                  Approve pending vendor registration applications, manage category listings, and oversee platform bookings & revenues.
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    'Approve / Reject submitted vendor applications',
                    'Verify & link vendors to official categories',
                    'Platform revenue & booking management',
                  ].map(text => (
                    <div key={text} className="flex items-center gap-2 text-xs text-sage-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelect('admin')}
                className="w-full py-3.5 bg-gold-500 hover:bg-gold-400 text-sage-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Enter Admin Portal <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom info */}
        {!showAdmin && (
          <div className="text-center mt-8">
            <p className="text-dark-500 text-sm font-medium">
              Not sure? You can switch your role anytime after signing up.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Role Card ──────────────────────────────────────────────────── */

function RoleCard({
  role, icon: Icon, accentIcon: AccentIcon, title, subtitle, description, features, accent, ctaLabel, mounted, onClick,
}: {
  role: UserRole;
  icon: typeof Users;
  accentIcon: typeof Search;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: typeof Users; text: string }[];
  accent: 'sage' | 'gold';
  ctaLabel: string;
  mounted: boolean;
  onClick: () => void;
}) {
  const isGold = accent === 'gold';
  const delay = role === 'customer' ? 'delay-100' : 'delay-300';

  return (
    <div className={`animate-on-scroll ${mounted ? 'in-view' : ''} ${delay}`}>
      <button
        onClick={onClick}
        className={`group relative w-full text-left rounded-3xl p-8 border-2 transition-all duration-400 card-hover overflow-hidden ${
          isGold
            ? 'bg-sage-900 border-sage-800 hover:border-gold-500/50 hover:shadow-card-hover'
            : 'bg-white border-sage-200 hover:border-sage-400 hover:shadow-card-hover'
        }`}
      >
        {/* Decorative gradient blob */}
        <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-40 ${
          isGold ? 'bg-gold-500/15' : 'bg-sage-400/15'
        }`} />

        {/* Icon row */}
        <div className="relative flex items-center justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            isGold ? 'bg-sage-700' : 'bg-sage-100'
          }`}>
            <Icon className={`w-8 h-8 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isGold ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-sage-50 border border-sage-200'
          }`}>
            <AccentIcon className={`w-5 h-5 ${isGold ? 'text-gold-400' : 'text-sage-500'}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className={`font-display text-2xl font-bold mb-1 ${isGold ? 'text-white' : 'text-sage-900'}`}>
          {title}
        </h2>
        <p className={`text-sm font-bold mb-3 ${isGold ? 'text-gold-400' : 'text-sage-600'}`}>
          {subtitle}
        </p>
        <p className={`text-sm leading-relaxed mb-6 font-medium ${isGold ? 'text-sage-300' : 'text-dark-500'}`}>
          {description}
        </p>

        {/* Feature list */}
        <div className="space-y-2.5 mb-8">
          {features.map(({ icon: FeatureIcon, text }) => (
            <div key={text} className="flex items-start gap-2.5">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isGold ? 'bg-sage-700' : 'bg-sage-100'
              }`}>
                <FeatureIcon className={`w-3 h-3 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
              </div>
              <span className={`text-sm font-medium ${isGold ? 'text-sage-200' : 'text-dark-600'}`}>
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`flex items-center justify-between pt-5 border-t transition-colors ${
          isGold ? 'border-sage-700 group-hover:border-gold-400/30' : 'border-sage-100 group-hover:border-sage-300'
        }`}>
          <span className={`font-bold text-sm ${isGold ? 'text-white' : 'text-sage-900'}`}>
            {ctaLabel}
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 ${
            isGold ? 'bg-gold-500/15 group-hover:bg-gold-500/25' : 'bg-sage-100 group-hover:bg-sage-200'
          }`}>
            <ArrowRight className={`w-5 h-5 ${isGold ? 'text-gold-400' : 'text-sage-600'}`} />
          </div>
        </div>
      </button>
    </div>
  );
}

/* ── Info Modal Component ────────────────────────────────────────── */

function InfoModal({ type, onClose }: { type: 'terms' | 'privacy'; onClose: () => void }) {
  const isTerms = type === 'terms';

  useEffect(() => {
    // Disable background scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
        className="bg-white rounded-3xl border border-sage-100 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden relative z-10 font-sans"
      >
        {/* Header */}
        <div className="p-6 border-b border-sage-50 flex items-center justify-between bg-gradient-to-r from-sage-50/20 to-cream-50/10">
          <div className="text-left">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-sage-900 flex items-center gap-2">
              {isTerms ? <FileText className="w-5 h-5 text-sage-600" /> : <Shield className="w-5 h-5 text-sage-600" />}
              {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
            </h2>
            <p className="text-xs text-dark-400 font-semibold mt-1">Last Updated: August 2026</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-dark-400 hover:text-sage-800 hover:bg-sage-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-left text-sm text-dark-600 font-medium leading-relaxed scrollbar-thin">
          {isTerms ? (
            <>
              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">1. Welcome to Festivo</h3>
                <p>
                  Festivo is a premier marketplace connecting clients with verified event service providers. 
                  By registering or using the platform, you agree to these Terms. If you do not agree, please do not use our services.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">2. Client Bookings & Payments</h3>
                <ul className="list-disc pl-5 space-y-1.5 mt-1">
                  <li>Bookings are confirmed only after the required deposit is successfully paid through the platform.</li>
                  <li>Festivo acts as an intermediary. The contract for services is directly between the Client and the Vendor.</li>
                  <li>Clients agree to pay all service charges, taxes, and platform commission fees where applicable.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">3. Vendor Terms & Commits</h3>
                <ul className="list-disc pl-5 space-y-1.5 mt-1">
                  <li>Vendors must keep details, portfolios, pricing, and calendars up to date.</li>
                  <li>Vendors commit to providing services with utmost professionalism as per booking contract details.</li>
                  <li>A percentage of service fee is retained by Festivo as a platform commission.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">4. Cancellations & Refunds</h3>
                <p>
                  Cancellation policies are designated individually by Vendors and displayed on their profile. 
                  In case of dispute, Festivo acts as an arbitrator to resolve billing issues based on policies set.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">5. Platform Use & Limitation</h3>
                <p>
                  Festivo is provided "as is". We are not liable for direct, indirect, or consequential damages 
                  resulting from vendor service delivery failures, customer cancellations, or platform outages.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">1. Data We Collect</h3>
                <p>
                  We collect registration info (names, emails, mobile numbers), payment info (facilitated via secure partners), 
                  and business portfolio details for vendors to offer booking services.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">2. How We Use Your Data</h3>
                <ul className="list-disc pl-5 space-y-1.5 mt-1">
                  <li>To verify profiles, process vendor registrations, and secure customer accounts.</li>
                  <li>To facilitate communication and confirm booking details between clients and booked vendors.</li>
                  <li>To process refunds, payments, and notify users of important platform announcements.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">3. Third-party Services</h3>
                <p>
                  We coordinate with transaction processors, KYC systems (for document verification), and cloud hosts. 
                  Your personal info is shared only to complete your bookings and is never sold to marketing aggregators.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">4. Security Measures</h3>
                <p>
                  We enforce end-to-end data encryption and regular security updates. Your credentials and mock codes 
                  are kept safe via hashed database registers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sage-900 text-base mb-2">5. User Rights</h3>
                <p>
                  Users can update registration records, download business profiles, or request account deletions 
                  by reaching out to Festivo support center.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-sage-50 bg-sage-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-sage-800 hover:bg-sage-700 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:-translate-y-0.5"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
}
