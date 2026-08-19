import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Users, FileText,
  CheckCircle2, CreditCard, Lock, Star, MapPin, Shield, Wallet,
  Building, Smartphone, Banknote, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useInView } from '../hooks/useInView';
import { supabase } from '../lib/supabase';
import type { Vendor } from '../lib/supabase';
import { fetchVendorBySlug, createBookingInDb, fetchBookingByRef } from '../lib/supabase-service';
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
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get('package');
  const selectedPriceRaw = searchParams.get('price');
  
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
    upi_id: '',
    bank: '',
    wallet: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const bookingRefToPay = searchParams.get('bookingRef');

    fetchVendorBySlug(slug).then(async (data) => {
      setVendor(data || MOCK_VENDORS.find(v => v.slug === slug) || MOCK_VENDORS[0]);
      
      if (bookingRefToPay) {
        const existingBooking = await fetchBookingByRef(bookingRefToPay);
        if (existingBooking) {
          setBookingId(existingBooking.id);
          setForm(f => ({
            ...f,
            customer_name: existingBooking.customer_name || '',
            customer_email: existingBooking.customer_email || '',
            customer_phone: existingBooking.customer_phone || '',
            event_type: existingBooking.event_type || '',
            event_date: existingBooking.event_date || '',
            guests: existingBooking.guests ? existingBooking.guests.toString() : '1',
            special_requests: existingBooking.special_requests || '',
          }));
          setStep(2);
        }
      }
      setLoading(false);
    });
  }, [slug, searchParams]);

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

  const parsedSelectedPrice = selectedPriceRaw ? parseInt(selectedPriceRaw.replace(/\D/g, ''), 10) : null;
  const basePrice = parsedSelectedPrice || vendor?.price_amount || 0;
  const totalAmount = vendor?.price_label === 'per plate' && !parsedSelectedPrice
    ? basePrice * (parseInt(form.guests) || 0)
    : basePrice;


  const handleSubmit = async () => {
    if (step === 1) {
      if (!validateStep1() || !vendor) return;
      setSubmitting(true);

      const bookingRef = `FEST-${Date.now().toString().slice(-8)}`;

      try {
        const { error } = await createBookingInDb({
          vendor_id: vendor.id,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          event_type: form.event_type,
          event_date: form.event_date,
          guests: parseInt(form.guests) || 1,
          special_requests: selectedPackage ? `[Package: ${selectedPackage}] ${form.special_requests || ''}`.trim() : (form.special_requests || null),
          total_amount: totalAmount,
          status: 'pending', // Use standard 'pending' to satisfy DB constraint
          payment_status: 'unpaid',
          booking_ref: bookingRef,
          package_name: selectedPackage || undefined,
          package_price: selectedPriceRaw || undefined,
        });

        if (error) throw error;
        
        navigate(`/confirmation/${bookingRef}`);
      } catch (err) {
        console.error("Booking error:", err);
        setErrors({ submit: 'Booking failed. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    } else if (step === 2) {
      const e: Record<string, string> = {};
      if (paymentMethod === 'card') {
        if (!form.card_name.trim()) e.card_name = 'Required';
        if (form.card_number.replace(/\D/g, '').length < 16) e.card_number = 'Invalid card';
        if (form.card_expiry.length < 5) e.card_expiry = 'Invalid';
        if (form.card_cvv.length < 3) e.card_cvv = 'Invalid';
      } else if (paymentMethod === 'upi') {
        if (!form.upi_id.trim() || !form.upi_id.includes('@')) e.upi_id = 'Valid UPI ID required';
      } else if (paymentMethod === 'netbanking') {
        if (!form.bank) e.bank = 'Please select a bank';
      } else if (paymentMethod === 'wallet') {
        if (!form.wallet) e.wallet = 'Please select a wallet';
      }

      if (Object.keys(e).length > 0) {
        setErrors(e);
        return;
      }

      setSubmitting(true);
      try {
        if (bookingId) {
          await supabase.from('bookings').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', bookingId);
          navigate(`/confirmation/${searchParams.get('bookingRef')}`);
        } else {
          navigate(`/confirmation/FEST-PAYMENT-MOCK`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
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
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-sage-600 text-white' : 'bg-white/10 text-white/50'}`}>
                  1
                </div>
                <span className={`text-sm font-medium transition-colors ${step >= 1 ? 'text-white' : 'text-white/50'}`}>Event Details</span>
              </div>
              <div className={`h-px w-12 transition-colors duration-300 ${step >= 2 ? 'bg-sage-600' : 'bg-white/10'}`} />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-sage-600 text-white' : 'bg-white/10 text-white/50'}`}>
                  2
                </div>
                <span className={`text-sm font-medium transition-colors ${step >= 2 ? 'text-white' : 'text-white/50'}`}>Payment</span>
              </div>
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
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.01] transition-all duration-300 active:scale-95 text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Request Booking →'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-dark-900 mb-6">Select Payment Method</h2>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {PAYMENT_METHODS.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${paymentMethod === method.id ? 'border-sage-600 bg-sage-50 ring-1 ring-sage-600' : 'border-cream-300 hover:border-sage-400 bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-sage-600' : 'text-dark-500'}`} />
                          {paymentMethod === method.id && <CheckCircle2 className="w-4 h-4 text-sage-600" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${paymentMethod === method.id ? 'text-sage-900' : 'text-dark-900'}`}>{method.label}</p>
                          <p className="text-xs text-dark-500 mt-0.5 leading-tight">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mb-8 animate-fade-in bg-cream-50 p-5 rounded-xl border border-cream-200">
                      <InputField
                        label="Cardholder Name" icon={User} required
                        value={form.card_name}
                        onChange={(e) => set('card_name', e.target.value)}
                        placeholder="Name on card"
                        error={errors.card_name}
                      />
                      <InputField
                        label="Card Number" icon={CreditCard} required
                        value={form.card_number}
                        onChange={(e) => set('card_number', formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        error={errors.card_number}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Expiry (MM/YY)" icon={Calendar} required
                          value={form.card_expiry}
                          onChange={(e) => set('card_expiry', formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          error={errors.card_expiry}
                        />
                        <InputField
                          label="CVV" icon={Lock} required type="password"
                          value={form.card_cvv}
                          onChange={(e) => set('card_cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                          error={errors.card_cvv}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 mb-8 animate-fade-in bg-cream-50 p-5 rounded-xl border border-cream-200">
                      <InputField
                        label="Virtual Payment Address (UPI ID)" icon={Smartphone} required
                        value={form.upi_id}
                        onChange={(e) => set('upi_id', e.target.value)}
                        placeholder="e.g., user@okicici"
                        error={errors.upi_id}
                      />
                      <p className="text-xs text-dark-500 mt-2">A payment request will be sent to your UPI app. Please approve it within 5 minutes to confirm your booking.</p>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4 mb-8 animate-fade-in bg-cream-50 p-5 rounded-xl border border-cream-200">
                      <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                        Select Your Bank <span className="text-gold-600">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <select
                          value={form.bank}
                          onChange={(e) => set('bank', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-dark-800 bg-white outline-none transition-all focus:ring-2 focus:ring-sage-300 focus:border-sage-400 appearance-none cursor-pointer ${errors.bank ? 'border-gold-500 bg-cream-100' : 'border-cream-300'}`}
                        >
                          <option value="">Select popular bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="Axis">Axis Bank</option>
                          <option value="Kotak">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                      {errors.bank && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.bank}</p>}
                      <p className="text-xs text-dark-500 mt-2">You will be securely redirected to your bank's portal to authorize this payment.</p>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="space-y-4 mb-8 animate-fade-in bg-cream-50 p-5 rounded-xl border border-cream-200">
                      <label className="block text-dark-700 font-semibold text-sm mb-1.5">
                        Select Wallet <span className="text-gold-600">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Paytm', 'Mobikwik', 'Amazon Pay'].map(wallet => (
                          <button
                            key={wallet}
                            onClick={() => set('wallet', wallet)}
                            className={`py-3 px-2 rounded-lg border text-sm font-semibold transition-all ${form.wallet === wallet ? 'bg-sage-600 text-white border-sage-600 ring-2 ring-sage-300' : 'bg-white text-dark-700 border-cream-300 hover:border-sage-400'}`}
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                      {errors.wallet && <p className="text-gold-700 text-xs mt-1 font-medium">{errors.wallet}</p>}
                      {form.wallet && <p className="text-xs text-dark-500 mt-2">Connect your {form.wallet} wallet securely in the next step to complete the payment.</p>}
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="space-y-4 mb-8 animate-fade-in bg-cream-50 p-5 rounded-xl border border-cream-200">
                      <div className="flex items-start gap-3">
                        <Banknote className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-dark-900 text-sm">Pay directly on Event Day</p>
                          <p className="text-xs text-dark-500 mt-1 leading-relaxed">
                            No upfront payment is required right now. By confirming this booking, you agree to pay the vendor directly on the day of the event using cash or any mutually agreed method.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="flex items-center gap-2 text-dark-500 text-sm mb-6 bg-cream-50 p-3 rounded-lg border border-cream-200">
                      <Lock className="w-4 h-4 text-sage-600" />
                      <span>Transactions are 256-bit SSL Encrypted and Secured.</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow hover:scale-[1.01] transition-all duration-300 active:scale-95 text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'cod' ? (
                      'Confirm Booking (Pay Later)'
                    ) : (
                      `Pay ₹${totalAmount.toLocaleString('en-IN')} securely`
                    )}
                  </button>
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
