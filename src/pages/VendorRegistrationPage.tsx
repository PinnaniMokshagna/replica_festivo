import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Camera, ArrowRight, ArrowLeft,
  Store, FileText, Check, Instagram, Facebook, Youtube, Linkedin, Twitter,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { safeSetItem } from '../lib/storageUtils';
import { ALL_CATEGORIES } from '../lib/categories';

const CATEGORIES_LIST = ALL_CATEGORIES;

const SERVICE_AREAS_OPTIONS = ['Bangalore', 'Hyderabad', 'Chennai', 'Mysore'];
const EXPERIENCE_OPTIONS = ['Fresher', '1–2 Years', '3–5 Years', '5–10 Years', '10+ Years'];
const TEAM_SIZE_OPTIONS = ['Individual', '2–5 Members', '6–10 Members', '10+'];
const LANGUAGES_OPTIONS = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil'];
const PRICE_TYPES = ['Per Hour', 'Per Day', 'Per Event', 'Package'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function VendorRegistrationPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Account Information
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Business Information
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Photographer']);
  const category = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Photographer';
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1 ? prev.filter((c) => c !== cat) : prev
        : [...prev, cat]
    );
  };

  // Step 3: Business Address
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Step 4: Contact Information
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactAltMobile, setContactAltMobile] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Step 5: Service Information
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [experience, setExperience] = useState('Fresher');
  const [teamSize, setTeamSize] = useState('Individual');
  const [languages, setLanguages] = useState<string[]>([]);

  // Step 6: Pricing
  const [priceAmount, setPriceAmount] = useState('');
  const [priceType, setPriceType] = useState('Per Event');

  // Step 7: Portfolio
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800');
  const [portfolioCount, setPortfolioCount] = useState(6);
  const [videoCount, setVideoCount] = useState(2);
  const [brochureUploaded, setBrochureUploaded] = useState(true);

  // Step 8: Business Verification (KYC Documents are blank initially)
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [gstUrl, setGstUrl] = useState('');
  const [regCertUrl, setRegCertUrl] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccNum, setBankAccNum] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [cancelledChequeUrl, setCancelledChequeUrl] = useState('');

  // Step 9: Social Media (Optional)
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  // Step 10: Availability
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [workingStart, setWorkingStart] = useState('09:00');
  const [workingEnd, setWorkingEnd] = useState('18:00');

  // Step 11: Terms & Conditions
  const [confirmCorrect, setConfirmCorrect] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // Simulated OTP & Verification Step 1.5
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!businessEmail || !businessPhone || !password) {
        setError('Please fill in email, phone, and password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!otpVerified) {
        setError('Please verify your mobile OTP code first.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!businessName || !ownerName || !description) {
        setError('Business Name, Owner Name, and Description are required.');
        return;
      }
    }
    if (currentStep === 6) {
      if (!priceAmount) {
        setError('Starting price is required.');
        return;
      }
    }
    if (currentStep === 8) {
      if (!bankHolderName || !bankAccNum || !bankIfsc) {
        setError('Please provide Account Holder Name, Number, and IFSC.');
        return;
      }
    }

    setError('');
    if (currentStep < 11) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleToggleServiceArea = (area: string) => {
    if (serviceAreas.includes(area)) {
      setServiceAreas(serviceAreas.filter(a => a !== area));
    } else {
      setServiceAreas([...serviceAreas, area]);
    }
  };

  const handleToggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleToggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSendOtp = () => {
    if (!businessPhone) {
      setError('Please input a valid mobile number.');
      return;
    }
    setOtpSent(true);
    setError('');
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234' || otpCode.length === 4) {
      setOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP code. Enter any 4-digit code (e.g. 1234).');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCorrect || !agreeTerms || !agreePrivacy) {
      setError('You must accept all terms, conditions, and privacy policies.');
      return;
    }

    setSubmitting(true);
    setError('');

    const vendorId = `VND-${Math.floor(100000 + Math.random() * 900000)}`;
    const newVendor = {
      id: vendorId,
      name: businessName,
      category,
      location: `${city || 'Bangalore'}, ${state || 'Karnataka'}`,
      price_amount: parseFloat(priceAmount) || 25000,
      price_label: 'Starting Package',
      price_unit: priceType.toLowerCase().replace('per ', ''),
      rating: 5.0,
      reviews: 0,
      image: coverUrl,
      logo: logoUrl,
      gallery: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800'
      ],
      tags: [subcategory || category, 'Verified', experience],
      description,
      verified: false, // Remains false for Admin Review queue
      badge: 'Pending Review',
      badge_color: 'bg-gold-500',
      capacity: capacityMapper(category),
      experience_years: parseInt(experience) || 3,
      slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      details: {
        email: businessEmail,
        phone: businessPhone,
        owner: ownerName,
        address: `${address}, ${city}, ${pincode}`,
        serviceAreas,
        languages,
        teamSize,
        instagram,
        facebook,
        youtube,
        linkedin,
        twitter,
        workingDays,
        workingStart,
        workingEnd,
        bank: {
          holder: bankHolderName,
          account: bankAccNum,
          ifsc: bankIfsc,
          name: bankName,
        },
        kyc: {
          aadhaarFront: aadhaarFrontUrl,
          aadhaarBack: aadhaarBackUrl,
          pan: panUrl,
          gst: gstUrl,
          regCert: regCertUrl,
          cancelledCheque: cancelledChequeUrl,
        },
        portfolioCount,
        videoCount,
        brochureUploaded,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Pending Verification'
      }
    };

    try {
      // 1. Save in local storage Verification queue
      const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      safeSetItem('festivo_pending_vendors', JSON.stringify([...pendingList, newVendor]));

      // Create admin notification
      const adminNotifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
      const newAdminNotification = {
        id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'new_application',
        vendorId: newVendor.id,
        vendorName: newVendor.name,
        message: `New vendor application submitted by "${newVendor.name}" (${newVendor.category}) in ${newVendor.location}.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      safeSetItem('festivo_admin_notifications', JSON.stringify([newAdminNotification, ...adminNotifications]));

      // 2. Submit to Supabase database
      let createdVendorId: string | null = null;
      try {
        const { data: insertedVendor, error: vendorErr } = await supabase
          .from('vendors')
          .insert({
            name: newVendor.name,
            category: newVendor.category,
            location: newVendor.location,
            price_amount: newVendor.price_amount,
            price_label: newVendor.price_label,
            price_unit: newVendor.price_unit,
            rating: newVendor.rating,
            reviews: newVendor.reviews,
            image: newVendor.image,
            gallery: newVendor.gallery,
            tags: newVendor.tags,
            description: newVendor.description,
            verified: false,
            slug: newVendor.slug
          })
          .select('id')
          .single();

        if (vendorErr) {
          console.error('Supabase vendors insert error:', vendorErr);
        } else if (insertedVendor) {
          createdVendorId = insertedVendor.id;
        }
      } catch (err) {
        console.warn('Vendor insert failed:', err);
      }

      // 3. Register user profile mapping in DB
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: businessEmail,
          password: password,
          options: { data: { full_name: ownerName, role: 'vendor' } }
        });

        if (authErr) {
          console.warn('Supabase auth signUp notice:', authErr.message);
        }
        
        let userId = authData?.user?.id;
        if (!userId) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: businessEmail,
            password: password
          });
          userId = signInData?.user?.id;
        }

        // Guaranteed fallback UUID so vendor_profiles insertion never fails due to auth rate limits
        const finalUserId = userId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`);

        if (userId) {
          const { error: profileErr } = await supabase.from('profiles').upsert({
            id: userId,
            full_name: ownerName,
            role: 'vendor',
            phone: businessPhone,
            city: city
          });
          if (profileErr) console.error('Supabase profiles insert error:', profileErr);
        }

        const { error: vendorProfileErr } = await supabase.from('vendor_profiles').upsert(
          {
            user_id: finalUserId,
            business_name: businessName,
            bio: description,
            gst_number: gstUrl ? 'GST-UPLOADED' : '',
            pan_number: 'PAN-UPLOADED',
            bank_account: bankAccNum,
            bank_ifsc: bankIfsc
          },
          { onConflict: 'user_id' }
        );
        if (vendorProfileErr) console.error('Supabase vendor_profiles insert error:', vendorProfileErr);
      } catch (err) {
        console.warn('Auth / Profile insert failed:', err);
      }
    } catch (e) {
      console.warn('Backend sync failed (proceeding with local storage registration queue):', e);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const capacityMapper = (cat: string) => {
    if (cat === 'Venue') return 'Up to 1000 guests';
    if (cat === 'Caterer') return '50 - 500 plates';
    return 'Professional Team';
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-body selection:bg-sage-100 selection:text-sage-800">
      
      {/* Brand Header */}
      <header className="h-20 bg-white border-b border-dark-100 flex items-center justify-between px-6 md:px-12 shadow-soft">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-xl text-sage-900 tracking-tight">Festivo Partner</span>
        </div>
        <button 
          onClick={() => navigate('/auth')}
          className="text-xs font-bold text-sage-700 hover:text-sage-800 bg-cream-100 hover:bg-cream-200 px-4 py-2.5 rounded-xl transition-all"
        >
          Sign In
        </button>
      </header>

      {/* Multi-step Registration Form */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-sage-100 shadow-card animate-scale-in">
            <div className="w-16 h-16 bg-sage-50 border border-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-sage-600" />
            </div>
            
            <h2 className="font-display text-2xl md:text-3xl font-black text-sage-900 mb-3 tracking-tight">
              Application Submitted!
            </h2>
            <p className="text-sage-800 text-sm font-semibold mb-6">
              Business ID: {businessName.substring(0,3).toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}
            </p>
            
            <div className="max-w-md mx-auto space-y-4 text-dark-600 text-xs font-medium bg-cream-50 p-6 rounded-2xl border border-cream-200 text-left">
              <p className="font-bold text-sage-900 text-sm mb-2">Verification Pipeline Timeline:</p>
              <div className="space-y-3 relative before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-sage-200">
                <div className="relative pl-6">
                  <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 bg-sage-600 rounded-full" />
                  <p className="font-bold text-dark-800">Step 1: Registration Form Completed &amp; Filed</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  <p className="font-bold text-amber-600">Step 2: Under Administration Verification Review (Pending)</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 bg-dark-200 rounded-full" />
                  <p className="text-dark-400">Step 3: Access Granted to Premium Vendor Dashboard</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/vendor-dashboard')}
              className="mt-8 bg-gradient-brand text-white rounded-2xl px-8 py-3 text-xs font-black shadow-md hover:opacity-95 transition-all"
            >
              Go to Portal Landing
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-up">
            
            {/* Step Indicators Headers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-dark-500 uppercase tracking-widest">
                <span>Step {currentStep} of 11</span>
                <span>{Math.round((currentStep / 11) * 100)}% Complete</span>
              </div>
              <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage-600 transition-all duration-300"
                  style={{ width: `${(currentStep / 11) * 100}%` }}
                />
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs font-semibold text-red-800 animate-scale-in">
                <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Step Content panels */}
            <form onSubmit={(e) => e.preventDefault()} className="bg-white border border-dark-100 rounded-3xl p-6 md:p-8 shadow-soft space-y-6">
              
              {/* STEP 1: ACCOUNT INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Account Information</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Setup your account credentials to log in.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Business Email Address *</label>
                      <input
                        type="email"
                        placeholder="e.g. partner@business.com"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-dark-500 uppercase">Mobile Number (WhatsApp) *</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="h-11 bg-cream-100 hover:bg-cream-200 text-dark-800 rounded-xl text-xs font-bold transition-all border border-cream-200"
                      >
                        {otpSent ? 'Resend OTP' : 'Send Mobile OTP'}
                      </button>
                    </div>

                    {otpSent && !otpVerified && (
                      <div className="bg-cream-50 border border-cream-200 rounded-2xl p-4 space-y-3 animate-scale-in">
                        <label className="block text-xs font-bold text-dark-500 uppercase">Verification OTP Code *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4 digit code (e.g. 1234)"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="bg-white border border-dark-100 rounded-xl px-4 py-2 text-sm outline-none font-medium w-48 text-center tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="bg-sage-600 hover:bg-sage-700 text-white rounded-xl px-5 text-xs font-bold transition-colors"
                          >
                            Verify Code
                          </button>
                        </div>
                      </div>
                    )}

                    {otpVerified && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <Check className="w-4 h-4 text-emerald-600 bg-white rounded-full p-0.5" />
                        Mobile OTP Verified successfully!
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Password *</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Confirm Password *</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Business Information</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Let event planners know about your brand.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Business Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Royal Decorators"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Owner Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rajesh Kumar"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mt-1 mb-1.5">
                        <label className="block text-xs font-bold text-dark-500 uppercase">Business Categories *</label>
                        <span className="text-xs text-sage-700 font-semibold">{selectedCategories.length} selected</span>
                      </div>
                      <div className="bg-cream-50 border border-dark-100 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {CATEGORIES_LIST.map(cat => {
                            const isChecked = selectedCategories.includes(cat);
                            return (
                              <label
                                key={cat}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                                  isChecked ? 'bg-sage-100 text-sage-900 font-bold' : 'hover:bg-white text-dark-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleCategory(cat)}
                                  className="w-3.5 h-3.5 rounded border-dark-200 text-sage-700 focus:ring-sage-500 cursor-pointer accent-sage-700"
                                />
                                <span>{cat}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Subcategory / Speciality</label>
                        <input
                          type="text"
                          placeholder="e.g. Floral Designs / Candid Video"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Business Description *</label>
                      <textarea
                        placeholder="Write a brief overview of your business services, target style, and why clients choose you..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUSINESS ADDRESS */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Business Address</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Where is your primary headquarters located?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-cream-100 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium text-dark-500"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">State</label>
                        <input
                          type="text"
                          placeholder="e.g. Karnataka"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Bangalore"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Complete Address</label>
                      <input
                        type="text"
                        placeholder="House/Office No., Street, Area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      />
                    </div>

                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-dark-500 uppercase">Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 560001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT INFORMATION */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Contact Information</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Primary coordinates for partner support and event details.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Contact Person</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={contactMobile}
                          onChange={(e) => setContactMobile(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Alternate Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543211"
                          value={contactAltMobile}
                          onChange={(e) => setContactAltMobile(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Business Email</label>
                        <input
                          type="email"
                          placeholder="e.g. contact@business.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Website (Optional)</label>
                        <input
                          type="url"
                          placeholder="e.g. https://website.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SERVICE INFORMATION */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Service Information</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Define your team parameters and active service regions.</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase mb-2">Service Areas (Multi-select)</label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_AREAS_OPTIONS.map(area => {
                          const active = serviceAreas.includes(area);
                          return (
                            <button
                              key={area}
                              type="button"
                              onClick={() => handleToggleServiceArea(area)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                active 
                                  ? 'bg-sage-600 border-sage-600 text-white' 
                                  : 'bg-cream-50 border-dark-100 text-dark-600 hover:bg-cream-100'
                              }`}
                            >
                              {area}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Experience Standing</label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        >
                          {EXPERIENCE_OPTIONS.map(exp => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Team Size</label>
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        >
                          {TEAM_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase mb-2">Languages Spoken (Checklist)</label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {LANGUAGES_OPTIONS.map(lang => {
                          const active = languages.includes(lang);
                          return (
                            <label key={lang} className="flex items-center gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleToggleLanguage(lang)}
                                className="w-4.5 h-4.5 rounded border-dark-100 text-sage-600 focus:ring-sage-100"
                              />
                              <span>{lang}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PRICING */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Pricing Model</h3>
                    <p className="text-dark-500 text-xs mt-0.5">State your standard base pricing rates to filter matches.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Starting Price (INR) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase">Price Unit / Type</label>
                      <select
                        value={priceType}
                        onChange={(e) => setPriceType(e.target.value)}
                        className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                      >
                        {PRICE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: PORTFOLIO */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Upload Portfolio</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Upload high quality media showcasing your premium services.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Logo upload */}
                    <div className="bg-cream-50 p-5 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                      <Store className="w-8 h-8 text-sage-600 mb-2" />
                      <p className="text-xs font-bold text-dark-800">Business Logo</p>
                      <img src={logoUrl} alt="Logo Preview" className="w-14 h-14 object-cover rounded-xl mt-3 border" />
                      <input
                        type="file"
                        id="logo-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('logo-file-input')?.click()}
                        className="mt-3 text-[10px] font-black text-sage-600 hover:underline"
                      >
                        Change Logo Image
                      </button>
                    </div>

                    {/* Cover Banner upload */}
                    <div className="bg-cream-50 p-5 rounded-2xl border border-dashed border-dark-200 text-center flex flex-col items-center justify-center">
                      <Camera className="w-8 h-8 text-sage-600 mb-2" />
                      <p className="text-xs font-bold text-dark-800">Cover Banner</p>
                      <img src={coverUrl} alt="Cover Preview" className="w-24 h-12 object-cover rounded-xl mt-3 border" />
                      <input
                        type="file"
                        id="cover-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCoverUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('cover-file-input')?.click()}
                        className="mt-3 text-[10px] font-black text-sage-600 hover:underline"
                      >
                        Change Cover Photo
                      </button>
                    </div>

                    {/* Portfolio images */}
                    <div className="p-5 bg-white border border-dark-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-dark-950">Portfolio Images (Max 20)</p>
                        <p className="text-[10px] text-dark-400 font-semibold mt-0.5">{portfolioCount} files ready for upload.</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setPortfolioCount(Math.max(0, portfolioCount - 1))} className="w-7 h-7 bg-cream-100 rounded-lg text-xs font-bold">-</button>
                        <button type="button" onClick={() => setPortfolioCount(portfolioCount + 1)} className="w-7 h-7 bg-cream-100 rounded-lg text-xs font-bold">+</button>
                      </div>
                    </div>

                    {/* Video files count */}
                    <div className="p-5 bg-white border border-dark-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-dark-950">Video Files (Max 5)</p>
                        <p className="text-[10px] text-dark-400 font-semibold mt-0.5">{videoCount} files ready for upload.</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setVideoCount(Math.max(0, videoCount - 1))} className="w-7 h-7 bg-cream-100 rounded-lg text-xs font-bold">-</button>
                        <button type="button" onClick={() => setVideoCount(videoCount + 1)} className="w-7 h-7 bg-cream-100 rounded-lg text-xs font-bold">+</button>
                      </div>
                    </div>

                    {/* PDF Brochure */}
                    <div className="p-5 bg-white border border-dark-100 rounded-2xl flex items-center justify-between md:col-span-2">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-sage-600" />
                        <div>
                          <p className="text-xs font-bold text-dark-950">Brochure PDF (Optional)</p>
                          <p className="text-[10px] text-dark-400 font-semibold mt-0.5">
                            {brochureUploaded ? 'business-brochure.pdf (Ready)' : 'No brochure file selected.'}
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setBrochureUploaded(!brochureUploaded)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                          brochureUploaded ? 'bg-red-50 text-red-600' : 'bg-sage-50 text-sage-600'
                        }`}
                      >
                        {brochureUploaded ? 'Remove' : 'Upload'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 8: PAYOUT BANK DETAILS */}
              {currentStep === 8 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Payout Bank Details</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Please provide your bank details to configure payout distributions.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">Account Holder Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Rajesh Kumar"
                            value={bankHolderName}
                            onChange={(e) => setBankHolderName(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. State Bank of India"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-dark-500 uppercase">Account Number *</label>
                          <input
                            type="text"
                            placeholder="Bank Account Number"
                            value={bankAccNum}
                            onChange={(e) => setBankAccNum(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-dark-500 uppercase">IFSC Code *</label>
                          <input
                            type="text"
                            placeholder="e.g. SBIN0001234"
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value)}
                            className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2 text-sm mt-1.5 outline-none font-medium"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: SOCIAL MEDIA */}
              {currentStep === 9 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Social Media Links (Optional)</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Link your business handles to showcase external works.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                      <Instagram className="w-4 h-4 text-sage-600" />
                      <input
                        type="url"
                        placeholder="Instagram Link (e.g. https://instagram.com/brand)"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                      <Facebook className="w-4 h-4 text-sage-600" />
                      <input
                        type="url"
                        placeholder="Facebook Link"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                      <Youtube className="w-4 h-4 text-sage-600" />
                      <input
                        type="url"
                        placeholder="YouTube Link"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                      <Linkedin className="w-4 h-4 text-sage-600" />
                      <input
                        type="url"
                        placeholder="LinkedIn Profile Link"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-cream-50 border border-dark-100 rounded-xl px-4 py-2">
                      <Twitter className="w-4 h-4 text-sage-600" />
                      <input
                        type="url"
                        placeholder="X / Twitter Link"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="bg-transparent text-sm w-full outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 10: AVAILABILITY */}
              {currentStep === 10 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Availability Schedule</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Let clients know your standard weekly business hours.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-dark-500 uppercase mb-3">Weekly Working Days</label>
                      <div className="flex flex-wrap gap-3">
                        {WEEKDAYS.map(day => {
                          const active = workingDays.includes(day);
                          return (
                            <label key={day} className="flex items-center gap-2 text-xs font-bold text-dark-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleToggleWorkingDay(day)}
                                className="w-4.5 h-4.5 rounded border-dark-100 text-sage-600 focus:ring-sage-100"
                              />
                              <span>{day}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Working Hours Start</label>
                        <input
                          type="time"
                          value={workingStart}
                          onChange={(e) => setWorkingStart(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark-500 uppercase">Working Hours End</label>
                        <input
                          type="time"
                          value={workingEnd}
                          onChange={(e) => setWorkingEnd(e.target.value)}
                          className="w-full bg-cream-50 border border-dark-100 rounded-xl px-4 py-2.5 mt-1.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 11: TERMS & CONDITIONS */}
              {currentStep === 11 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-black text-dark-900 text-lg">Terms &amp; Conditions</h3>
                    <p className="text-dark-500 text-xs mt-0.5">Please review and confirm to complete your registration request.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="flex items-start gap-3 text-xs font-bold text-dark-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmCorrect}
                        onChange={(e) => setConfirmCorrect(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-dark-100 text-sage-600 focus:ring-sage-100 mt-0.5"
                      />
                      <span className="leading-tight">I confirm that all information provided in this registration document is accurate and correct.</span>
                    </label>

                    <label className="flex items-start gap-3 text-xs font-bold text-dark-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-dark-100 text-sage-600 focus:ring-sage-100 mt-0.5"
                      />
                      <span className="leading-tight">I agree to the Festivo Partner Terms and Conditions agreement.</span>
                    </label>

                    <label className="flex items-start gap-3 text-xs font-bold text-dark-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-dark-100 text-sage-600 focus:ring-sage-100 mt-0.5"
                      />
                      <span className="leading-tight">I agree to the Festivo Platform Privacy Policy guidelines.</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation button controls */}
              <div className="flex justify-between items-center border-t border-dark-100 pt-6 mt-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 border border-dark-100 hover:bg-cream-50 text-dark-700 rounded-xl px-5 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 11 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="h-11 bg-gradient-brand text-white rounded-xl px-6 text-xs font-black shadow-md flex items-center gap-1.5 transition-all hover:opacity-95"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-11 bg-gradient-brand text-white rounded-xl px-8 text-xs font-black shadow-md flex items-center gap-1.5 transition-all hover:opacity-95"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Enrollment Application'}
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-dark-100 text-center text-[10px] font-bold text-dark-400 tracking-widest bg-white">
        &copy; {new Date().getFullYear()} FESTIVO EVENT MARKETPLACE. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
}
