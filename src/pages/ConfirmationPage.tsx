import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, Download, Home, Star, Sparkles, Mail, Phone, ArrowRight, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useInView } from '../hooks/useInView';
import type { Booking, Vendor } from '../lib/supabase';
import { fetchBookingByRef } from '../lib/supabase-service';

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#5d8560', '#466b48', '#7fa281', '#d4ab68', '#c19350', '#fbbf24', '#f59e0b'];
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; opacity: number }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 5,
        opacity: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.01;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();
        if (p.opacity <= 0) {
          particles.splice(i, 1);
        }
      });
      frame++;
      if (frame < 300 && particles.length > 0) requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export default function ConfirmationPage() {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const { ref: nextRef, inView: nextInView } = useInView<HTMLDivElement>();
  const { ref: actionsRef, inView: actionsInView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (!ref) return;

    fetchBookingByRef(ref).then((bookingData) => {
      if (bookingData) {
        setBooking(bookingData);
        setVendor(bookingData.vendor || null);
      }
      setLoading(false);
    });

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [ref]);

  useEffect(() => {
    if (booking?.status !== 'confirmed') {
      setShowConfetti(false);
    }
  }, [booking]);

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

  if (!booking || !vendor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-dark-900 mb-2">Booking not found</h2>
            <button onClick={() => navigate('/')} className="text-sage-600 hover:underline font-semibold">Go home</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-sage-50 via-white to-cream-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8 animate-fade-up">
            <div className="relative inline-block mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${booking.status === 'confirmed' ? 'bg-sage-100' : booking.status === 'vendor_accepted' ? 'bg-blue-100' : 'bg-gold-100'}`}>
                {booking.status === 'confirmed' ? (
                  <CheckCircle className="w-12 h-12 text-sage-500" />
                ) : booking.status === 'vendor_accepted' ? (
                  <Calendar className="w-12 h-12 text-blue-500" />
                ) : (
                  <Clock className="w-12 h-12 text-gold-500" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className={`absolute -inset-2 rounded-full border-2 animate-ping opacity-50 ${booking.status === 'confirmed' ? 'border-sage-200' : booking.status === 'vendor_accepted' ? 'border-blue-200' : 'border-gold-200'}`} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-dark-900 mb-3">
              {booking.status === 'confirmed' ? 'Booking Confirmed!' : booking.status === 'vendor_accepted' ? 'Vendor Approved!' : 'Request Sent!'}
            </h1>
            <p className="text-dark-500 text-lg max-w-md mx-auto">
              {booking.status === 'confirmed' ? 'Your event is secured. Get ready to celebrate in style!' : booking.status === 'vendor_accepted' ? 'The vendor has accepted your request. Please complete payment to confirm your booking.' : 'Your booking request has been sent to the vendor. We will notify you once they approve.'}
            </p>
            <div className={`inline-flex items-center gap-2 mt-4 border rounded-xl px-4 py-2 ${booking.status === 'confirmed' ? 'bg-sage-50 border-sage-200' : booking.status === 'vendor_accepted' ? 'bg-blue-50 border-blue-200' : 'bg-gold-50 border-gold-200'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${booking.status === 'confirmed' ? 'bg-sage-500' : booking.status === 'vendor_accepted' ? 'bg-blue-500' : 'bg-gold-500'}`} />
              <span className={`text-sm font-bold ${booking.status === 'confirmed' ? 'text-sage-700' : booking.status === 'vendor_accepted' ? 'text-blue-700' : 'text-gold-700'}`}>
                {booking.status === 'confirmed' ? 'Payment Successful' : booking.status === 'vendor_accepted' ? 'Payment Pending' : 'Pending Vendor Approval'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] overflow-hidden mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative h-48">
              {vendor.image && !vendor.image.includes('pexels.com') ? (
                <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sage-700 to-sage-900 flex items-center justify-center">
                  <span className="text-white/25 text-3xl font-display font-bold">{vendor.category[0] || 'V'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className={`text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${booking.status === 'confirmed' ? 'bg-sage-500' : booking.status === 'vendor_accepted' ? 'bg-blue-500' : 'bg-gold-500'}`}>
                  {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : booking.status === 'vendor_accepted' ? <Calendar className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'vendor_accepted' ? 'Vendor Approved' : 'Pending'}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{vendor.name}</h2>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-white/70" />
                      <span className="text-white/70 text-xs">{vendor.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 text-gold-400 fill-gold-400" />
                      <span className="text-white font-bold">{vendor.rating}</span>
                    </div>
                    <span className="text-white/70 text-xs">{vendor.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider">Booking Reference</p>
                  <p className="font-mono text-2xl font-bold text-dark-900 mt-1">{booking.booking_ref}</p>
                </div>
                <div className="text-right">
                  <p className="text-dark-400 text-xs font-bold uppercase tracking-wider">Amount Paid</p>
                  <p className="font-display text-2xl font-bold text-sage-600 mt-1">₹{booking.total_amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Calendar, label: 'Event Date', value: new Date(booking.event_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { icon: Users, label: 'Event Type', value: booking.event_type },
                  { icon: Users, label: 'Guest Count', value: `${booking.guests} guests` },
                  { icon: Calendar, label: 'Booked On', value: new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-cream-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-sage-500" />
                      <span className="text-dark-400 text-xs font-bold uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-dark-900 font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-200 pt-5">
                <p className="text-dark-700 font-bold text-sm mb-3">Customer Details</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-dark-500" />
                    </div>
                    <span className="text-dark-600">{booking.customer_name}</span>
                    <span className="text-dark-400 mx-1">·</span>
                    <span className="text-dark-600">{booking.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 text-dark-500" />
                    </div>
                    <span className="text-dark-600">{booking.customer_phone}</span>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <p className="text-dark-500 text-xs font-bold uppercase tracking-wider mb-1">Special Requests</p>
                  <p className="text-dark-700 text-sm bg-cream-100 border border-cream-200 rounded-xl p-3">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>

          <div ref={nextRef} className={`bg-gradient-to-r from-sage-50 to-cream-50 rounded-2xl p-5 mb-6 border border-sage-200 animate-on-scroll ${nextInView ? 'in-view' : ''}`}>
            <h3 className="font-display font-bold text-dark-900 mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-sage-500" /> What's Next?
            </h3>
            <div className="space-y-2.5">
              {[
                { step: '1', text: `A request email has been sent to ${vendor.name}` },
                { step: '2', text: `${vendor.name} will review and approve your request` },
                { step: '3', text: 'You will complete the payment to secure the date' },
              ].map(({ step, text }, i) => (
                <div key={step} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${booking.status === 'confirmed' || (booking.status === 'vendor_accepted' && i < 2) || (booking.status === 'pending_vendor_approval' && i < 1) ? 'bg-sage-500' : 'bg-dark-300'}`}>
                    {booking.status === 'confirmed' || (booking.status === 'vendor_accepted' && i < 2) || (booking.status === 'pending_vendor_approval' && i < 1) ? <CheckCircle className="w-3 h-3" /> : step}
                  </div>
                  <p className="text-dark-700 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div ref={actionsRef} className={`flex flex-col sm:flex-row gap-3 animate-on-scroll ${actionsInView ? 'in-view' : ''}`}>
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 border border-cream-300 rounded-xl text-dark-700 font-semibold hover:border-cream-400 transition-all hover:bg-cream-50"
            >
              <Download className="w-4 h-4" /> Download Receipt
            </button>
            <button
              onClick={() => navigate('/vendors')}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 border border-sage-200 rounded-xl text-sage-600 font-semibold hover:border-sage-400 hover:bg-sage-50 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Browse More Vendors
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 border border-sage-300 text-sage-800 font-semibold rounded-xl hover:bg-sage-50 transition-all"
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
            {((booking.status === 'vendor_accepted' || booking.status === 'confirmed') && booking.payment_status !== 'paid') && (
              <button
                onClick={() => navigate('/customer-dashboard?tab=payments')}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#2d4733] hover:bg-[#1f3323] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Proceed to Pay <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
