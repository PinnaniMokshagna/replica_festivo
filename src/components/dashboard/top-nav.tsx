import { motion } from 'framer-motion';
import { Search, Bell, Wallet, Menu, Camera, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { VerifiedBadge } from '@/components/ui/verified-badge';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { user, kycStatus } = useAuth();
  const { notificationsList, transactions } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const unreadCount = notificationsList.filter(n => n.unread).length;
  
  // Calculate total earnings from transactions
  const totalEarnings = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, curr) => acc + curr.rawAmount, 0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/40 bg-card/75 px-4 backdrop-blur-xl shadow-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Greeting with Blue Verified Badge */}
        <div className="hidden sm:block">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <h2 className="text-xl font-bold text-dark-900 sm:text-2xl">
              Welcome, {user.fullName.split(' ')[0]}
            </h2>
            {kycStatus === 'verified' && <VerifiedBadge size="md" />}
          </motion.div>
          <p className="text-xs font-semibold text-sage-700">@{user.username} · {user.businessName}</p>
        </div>

        {/* KYC Verification Status Badge */}
        <button
          onClick={() => navigate('/vendor-dashboard/verify-documents')}
          className={`hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold border transition-all ${
            kycStatus === 'verified'
              ? 'border-sage-300 bg-sage-50 text-sage-800 shadow-sm'
              : kycStatus === 'pending'
              ? 'border-gold-300 bg-gold-50 text-gold-800'
              : 'border-red-200 bg-red-50 text-red-700 animate-pulse'
          }`}
          title="Click to manage KYC verification documents"
        >
          {kycStatus === 'verified' && <VerifiedBadge size="sm" />}
          {kycStatus === 'pending' && <Clock className="h-4 w-4 text-gold-600 animate-spin-slow" />}
          {kycStatus === 'unverified' && <ShieldAlert className="h-4 w-4 text-red-600" />}
          <span>
            {kycStatus === 'verified' && 'Verified Studio'}
            {kycStatus === 'pending' && 'KYC Reviewing'}
            {kycStatus === 'unverified' && 'Verify Documents'}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookings, clients..."
            onKeyDown={e => {
              if (e.key === 'Enter') {
                navigate('/vendor-dashboard/bookings');
              }
            }}
            className="h-11 w-52 rounded-xl border border-border bg-card/90 pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-64"
          />
        </div>

        {/* Ringing Bell Icon with Top-Notch Animation */}
        <motion.button
          whileHover={{
            rotate: [0, -22, 22, -16, 16, -8, 8, 0],
            transition: { duration: 0.7, ease: 'easeInOut' },
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/vendor-dashboard/notifications')}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card/90 text-dark-800 transition-colors hover:bg-cream-100/70 shadow-sm"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-sage-700" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-extrabold text-white shadow-glow-gold animate-bounce">
              {unreadCount}
            </span>
          )}
        </motion.button>



        {/* Avatar with photo upload */}
        <div className="relative">
          <button
            onClick={() => navigate('/vendor-dashboard/settings')}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-sm font-bold text-white shadow-glow-sage ring-2 ring-white"
          >
            {photo ? (
              <img src={photo} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              user.avatar || 'AS'
            )}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-sage-600 text-white shadow-sm transition-colors hover:bg-sage-700"
            title="Upload profile photo"
          >
            <Camera className="h-2.5 w-2.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}
