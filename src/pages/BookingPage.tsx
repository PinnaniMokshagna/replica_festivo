import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Users, FileText,
  CheckCircle2, CreditCard, Lock, Star, MapPin, Shield, Wallet,
  Building, Smartphone, Banknote, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useInView } from '../hooks/useInView';
import { supabase } from '../lib/supabase';
import type { Vendor } from '../lib/supabase';
import { fetchVendorBySlug, createBookingInDb } from '../lib/supabase-service';
import { dataCache } from '../lib/cache';
import { MOCK_VENDORS } from '../lib/vendors';

const EVENT_TYPES = ['Wedding', 'Birthday Party', 'Corporate Event', 'Anniversary', 'Engagement', 'Baby Shower', 'Other'];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'netbanking', label: 'Net Banking', icon: Building, desc: 'All major banks supported' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, Mobikwik, Amazon Pay' },
  { id: 'cod', label: 'Cash on Event Day', icon: Banknote, desc: 'Pay vendor directly after service' },
];

function InputField({
  label, icon: Icon, required, error, ...props
}: { label: string; icon: React.ElementType; required?: boolean; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-dark-700 font-semibold text-sm mb-1.5">
        {label} {required && <span className="text-gold-600">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
          <Icon className="w-4 h-4" />
        </div>
        <input
          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 ${error ? 'border-gold-500 bg-cream-100' : 'border-cream-300 hover:border-cream-400'}`}
          {...props}
        />
      </div>
      {error && <p className="text-gold-700 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { ref: summaryRef, inView: summaryInView } = useInView<HTMLDivElement>();

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    event_type: '',
    event_date: '',
    guests: '',
    special_requests: '',
    card_name: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetchVendorBySlug(slug).then((data) => {
      setVendor(data || MOCK_VENDORS.find(v => v.slug === slug) || MOCK_VENDORS[0]);
      setLoading(false);
    });
  }, [slug]);

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const formatCardNumber = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const nums = value.replace(/\D/g, '').slice(0, 4);
    if (nums.length >= 3) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return nums;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required';
    if (!form.customer_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = 'Valid email required';
    if (!form.customer_phone.trim() || form.customer_phone.replace(/\D/g, '').length < 10) e.customer_phone = 'Valid phone required';
    if (!form.event_type) e.event_type = 'Select event type';
    if (!form.event_date) e.event_date = 'Select event date';
    if (!form.guests || parseInt(form.guests) < 1) e.guests = 'Enter guest count';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (paymentMethod === 'card') {
      if (!form.card_name.trim()) e.card_name = 'Cardholder name required';
      const cardDigits = form.card_number.replace(/\D/g, '');
      if (cardDigits.length < 16) e.card_number = 'Enter valid 16-digit card number';
      if (!form.card_expiry || form.card_expiry.length < 5) e.card_expiry = 'Enter expiry date';
      if (!form.card_cvv || form.card_cvv.length < 3) e.card_cvv = 'Enter CVV';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const queryParams = new URLSearchParams(window.location.search);
  const selectedPackage = queryParams.get('package');
  const selectedPriceRaw = queryParams.get('price');
  const parsedPackagePrice = selectedPriceRaw ? parseInt(selectedPriceRaw.replace(/[^0-9]/g, ''), 10) : 0;

  const totalAmount = parsedPackagePrice || (vendor
    ? vendor.price_label === 'per plate' && form.guests
      ? vendor.price_amount * (parseInt(form.guests, 10) || 1)
      : vendor.price_amount
    : 45000);

  const handleSubmit = async () => {
    if (!validateStep2() || !vendor) return;
    setSubmitting(true);

    const bookingRef = `FEST-${Date.now().toString().slice(-8)}`;

    try {
      await createBookingInDb({
        vendor_id: vendor.id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        event_type: form.event_type,
        event_date: form.event_date,
        guests: parseInt(form.guests) || 1,
        special_requests: selectedPackage ? `[Package: ${selectedPackage}] ${form.special_requests || ''}`.trim() : (form.special_requests || null),
        total_amount: totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
        booking_ref: bookingRef,
        package_name: selectedPackage || undefined,
        package_price: selectedPriceRaw || undefined,
      });

      navigate(`/confirmation/${bookingRef}`);
    } catch {
      setErrors({ submit: 'Booking failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-dark-900 mb-2">Vendor not found</h2>
            <button onClick={() => navigate('/vendors')} className="text-sage-600 hover:underline font-semibold">Browse vendors</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream-50/50 pt-16">
        <div className="bg-gradient-dark py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => navigate(`/vendors/${slug}`)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to vendor</span>
            </button>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Book Your Event</h1>
            <p className="text-dark-300 text-sm">Secure your date with {vendor.name}</p>

            <div className="flex items-center gap-3 mt-6">
              {['Event Details', 'Payment'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > i + 1 ? 'bg-sage-500 text-white' : step === i + 1 ? 'bg-sage-600 text-white' : 'bg-white/20 text-white/50'}`}>
                    {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${step === i + 1 ? 'text-white' : 'text-white/50'}`}>{label}</span>
                  {i < 1 && <div className={`w-12 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-sage-500' : 'bg-white/20'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {step === 1 ? (
                <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-dark-900 mb-6">Event Details</h2>
                  <div className="space-y-5">
                    <InputField
                      label="Full Name" icon={User} required
                      value={form.customer_name}
                      onChange={(e) => set('customer_name', e.target.value)}
                      placeholder="Your full name"
                      error={errors.customer_name}
                    />
                    <InputField
                      label="Email Address" icon={Mail} required type="email"
                      value={form.customer_email}
                      onChange={(e) => set('customer_email', e.target.value)}
                      placeholder="you@example.com"
                      error={errors.customer_email}
                    />
                    <InputField
                      label="Phone Number" icon={Phone} required type="tel"
                      value={form.customer_phone}
                      onChange={(e) => set('customer_phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      error={errors.customer_phone}
                    />

                    <div>
                      <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                        Event Type <span className="text-gold-600">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <select
                          value={form.event_type}
                          onChange={(e) => set('event_type', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 appearance-none cursor-pointer ${errors.event_type ? 'border-gold-500 bg-cream-100' : 'border-cream-300'}`}
                        >
                          <option value="">Select event type</option>
                          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      {errors.event_type && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.event_type}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Event Date" icon={Calendar} required type="date"
                        value={form.event_date}
                        onChange={(e) => set('event_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        error={errors.event_date}
                      />
                      <InputField
                        label="Number of Guests" icon={Users} required type="number"
                        value={form.guests}
                        onChange={(e) => set('guests', e.target.value)}
                        placeholder="100"
                        min="1"
                        error={errors.guests}
                      />
                    </div>

                    <div>
                      <label className="block text-dark-700 font-semibold text-sm mb-1.5 flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Special Requests <span className="text-dark-400 font-normal text-xs">(optional)</span>
                      </label>
                      <textarea
                        value={form.special_requests}
                        onChange={(e) => set('special_requests', e.target.value)}
                        rows={3}
                        placeholder="Any specific requirements, dietary needs, or special arrangements..."
                        className="w-full px-4 py-3 border border-cream-300 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 resize-none hover:border-cream-400"
                      />
                    </div>

                    <button
                      onClick={handleStep1}
                      className="w-full py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.01] transition-all duration-300 active:scale-95 text-lg"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-dark-900">Payment Details</h2>
                    <div className="flex items-center gap-1.5 text-sage-600 bg-sage-50 px-3 py-1.5 rounded-lg">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">Secure Payment</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="block text-dark-700 font-bold text-sm mb-3">Select Payment Method</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const selected = paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${selected ? 'border-sage-600 bg-sage-50' : 'border-cream-200 hover:border-sage-300 bg-white'}`}
                          >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-sage-600 text-white' : 'bg-cream-100 text-dark-500'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-dark-900">{method.label}</p>
                              <p className="text-xs text-dark-500">{method.desc}</p>
                            </div>
                            {selected && <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                  <>
                  <div className="bg-gradient-dark rounded-2xl p-5 mb-6 relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-white/10 font-bold text-6xl">VISA</div>
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex gap-1">
                        <div className="w-8 h-8 rounded-full bg-gold-400/80" />
                        <div className="w-8 h-8 rounded-full bg-sage-500/80 -ml-3" />
                      </div>
                      <CreditCard className="w-6 h-6 text-white/40" />
                    </div>
                    <p className="text-white font-mono text-lg tracking-widest mb-3">
                      {form.card_number || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider">Card Holder</p>
                        <p className="text-white text-sm font-medium mt-0.5">{form.card_name || 'YOUR NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs uppercase tracking-wider">Expires</p>
                        <p className="text-white text-sm font-medium mt-0.5">{form.card_expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <InputField
                      label="Cardholder Name" icon={User} required
                      value={form.card_name}
                      onChange={(e) => set('card_name', e.target.value)}
                      placeholder="Name as on card"
                      error={errors.card_name}
                    />

                    <div>
                      <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                        Card Number <span className="text-gold-600">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type="text"
                          value={form.card_number}
                          onChange={(e) => set('card_number', formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 font-mono tracking-wider ${errors.card_number ? 'border-gold-500 bg-cream-100' : 'border-cream-300'}`}
                        />
                      </div>
                      {errors.card_number && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.card_number}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                          Expiry Date <span className="text-gold-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.card_expiry}
                          onChange={(e) => set('card_expiry', formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 font-mono ${errors.card_expiry ? 'border-gold-500 bg-cream-100' : 'border-cream-300'}`}
                        />
                        {errors.card_expiry && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.card_expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                          CVV <span className="text-gold-600">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <input
                            type="password"
                            value={form.card_cvv}
                            onChange={(e) => set('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 ${errors.card_cvv ? 'border-gold-500 bg-cream-100' : 'border-cream-300'}`}
                          />
                        </div>
                        {errors.card_cvv && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.card_cvv}</p>}
                      </div>
                    </div>
                  </div>
                  </>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-sage-600 text-white flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-dark-900">UPI Payment</p>
                          <p className="text-sm text-dark-500">Enter your UPI ID on the next step</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5">
                          UPI ID <span className="text-gold-600">*</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 hover:border-cream-400"
                          />
                        </div>
                        <p className="text-dark-500 text-xs mt-2">You'll receive a payment request on your UPI app to confirm.</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-sage-600 text-white flex items-center justify-center">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-dark-900">Net Banking</p>
                          <p className="text-sm text-dark-500">Select your bank on the next step</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-dark-700 font-bold text-sm mb-1.5">
                          Select Bank <span className="text-gold-600">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                          <select className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 appearance-none cursor-pointer">
                            <option value="">Choose your bank</option>
                            <option value="sbi">State Bank of India</option>
                            <option value="hdfc">HDFC Bank</option>
                            <option value="icici">ICICI Bank</option>
                            <option value="axis">Axis Bank</option>
                            <option value="kotak">Kotak Mahindra Bank</option>
                            <option value="yes">Yes Bank</option>
                            <option value="pnb">Punjab National Bank</option>
                            <option value="canara">Canara Bank</option>
                          </select>
                        </div>
                        <p className="text-dark-500 text-xs mt-2">You'll be redirected to your bank's secure portal to complete payment.</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-sage-600 text-white flex items-center justify-center">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-dark-900">Wallet Payment</p>
                          <p className="text-sm text-dark-500">You'll be redirected to your wallet app to complete payment</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Paytm', 'Mobikwik', 'Amazon Pay', 'Freecharge'].map(w => (
                          <span key={w} className="px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-sm font-semibold text-dark-700">{w}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-sage-600 text-white flex items-center justify-center">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-dark-900">Cash on Event Day</p>
                          <p className="text-sm text-dark-500">Pay the vendor directly after the event. A 10% advance confirms your booking.</p>
                        </div>
                      </div>
                      <div className="bg-white border border-cream-200 rounded-xl p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-dark-500">Total amount</span>
                          <span className="text-dark-700 font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-dark-500">Advance now (10%)</span>
                          <span className="text-sage-600 font-bold">₹{Math.round(totalAmount * 0.1).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-cream-200">
                          <span className="text-dark-500">Balance at event</span>
                          <span className="text-dark-700 font-semibold">₹{Math.round(totalAmount * 0.9).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <p className="text-xs text-dark-500 mt-3 flex items-start gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sage-500 flex-shrink-0 mt-0.5" />
                        The 10% advance secures your date and is fully refundable within 24 hours of booking.
                      </p>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="mt-4 p-3 bg-cream-100 border border-gold-400 rounded-xl">
                      <p className="text-gold-700 text-sm font-medium">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="flex-shrink-0 px-5 py-4 border border-cream-300 text-dark-700 font-semibold rounded-xl hover:border-cream-400 transition-colors flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.01] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 text-base"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {paymentMethod === 'cod'
                            ? 'Confirm Booking (10% Advance)'
                            : `Pay ₹${totalAmount.toLocaleString('en-IN')} Now`}
                        </>
                      )}
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                      {['visa', 'mastercard', 'amex', 'rupay'].map(card => (
                        <span key={card} className="text-dark-400 text-xs font-bold uppercase tracking-wider bg-cream-50 px-2 py-1 rounded">{card}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div ref={summaryRef} className={`bg-white rounded-2xl shadow-card overflow-hidden animate-on-scroll ${summaryInView ? 'in-view' : ''}`}>
                <div className="relative h-40">
                  {vendor.image && !vendor.image.includes('pexels.com') ? (
                    <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sage-700 to-sage-900 flex items-center justify-center">
                      <span className="text-white/25 text-3xl font-display font-bold">{vendor.category[0] || 'V'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-white text-base">{vendor.name}</h3>
                      {vendor.verified && <CheckCircle2 className="w-4 h-4 text-gold-400" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/70" />
                      <span className="text-white/70 text-xs">{vendor.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-sage-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-sage-600 fill-sage-600" />
                      <span className="text-sage-700 text-sm font-bold">{vendor.rating}</span>
                    </div>
                    <span className="text-dark-400 text-xs">({vendor.reviews} reviews)</span>
                    <span className="ml-auto text-xs text-dark-500 bg-cream-50 px-2 py-1 rounded">{vendor.category}</span>
                  </div>

                  {selectedPackage && (
                    <div className="bg-sage-100/70 border border-sage-300 rounded-xl p-3 mb-4">
                      <p className="text-sage-900 text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Selected Service Package
                      </p>
                      <p className="text-sage-900 font-extrabold text-sm mt-0.5">{selectedPackage}</p>
                      {selectedPriceRaw && <p className="text-sage-700 font-bold text-xs">{selectedPriceRaw}</p>}
                    </div>
                  )}

                  {form.event_date && (
                    <div className="bg-sage-50 rounded-xl p-3 mb-4">
                      <p className="text-dark-600 text-xs font-bold mb-1">Booking Summary</p>
                      {form.event_type && <p className="text-dark-800 text-sm"><span className="text-dark-400">Event:</span> {form.event_type}</p>}
                      <p className="text-dark-800 text-sm"><span className="text-dark-400">Date:</span> {new Date(form.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      {form.guests && <p className="text-dark-800 text-sm"><span className="text-dark-400">Guests:</span> {form.guests}</p>}
                    </div>
                  )}

                  <div className="space-y-2 border-t border-cream-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">
                        {vendor.price_label === 'per plate'
                          ? `₹${vendor.price_amount.toLocaleString('en-IN')} × ${form.guests || '0'} guests`
                          : `Base price`}
                      </span>
                      <span className="text-dark-700 font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">Platform fee</span>
                      <span className="text-sage-600 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-dark-900 border-t border-cream-200 pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-sage-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card p-5">
                <h4 className="font-bold text-dark-900 text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sage-500" /> Why Book on Festivo?
                </h4>
                <div className="space-y-2">
                  {[
                    'Verified & background-checked vendors',
                    'Instant booking confirmation via email',
                    'Secure end-to-end encryption',
                    'Free cancellation within 24 hours',
                    'Dedicated support throughout',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage-500 flex-shrink-0 mt-0.5" />
                      <span className="text-dark-600 text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
