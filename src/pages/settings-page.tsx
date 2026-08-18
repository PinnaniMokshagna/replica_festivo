import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Camera, User, Mail, Phone, MapPin, Building2, Shield, Bell, CreditCard, Check, AtSign, Globe, Info } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { VerifiedBadge } from '@/components/ui/verified-badge';

export function SettingsPage() {
  const { user, updateProfile, canChangeUsername, changeUsername, kycStatus } = useAuth();
  const { showToast } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Form State
  const [fullName, setFullName] = useState(user.fullName);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [website, setWebsite] = useState(user.website || 'https://royalmoments.in');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState(user.location);

  const [businessName, setBusinessName] = useState(user.businessName);
  const [category, setCategory] = useState(user.category);
  const [bio, setBio] = useState(user.bio);

  const [upiId, setUpiId] = useState(user.upiId);
  const [bankAccount, setBankAccount] = useState(user.bankAccount);
  const [ifsc, setIfsc] = useState(user.ifsc);

  const usernameRule = canChangeUsername();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        setPhoto(res);
        updateProfile({ avatar: 'AS' });
        showToast('Profile avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Process username change rule
    if (usernameInput.toLowerCase() !== user.username.toLowerCase()) {
      const result = changeUsername(usernameInput);
      if (!result.success) {
        showToast(result.message, 'error');
        return;
      }
      showToast(result.message, 'success');
    }

    updateProfile({
      fullName,
      website,
      email,
      phone,
      location,
      businessName,
      category,
      bio,
      upiId,
      bankAccount,
      ifsc,
    });

    showToast('Profile & Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Vendor Profile', icon: User },
    { id: 'business', label: 'Business Details', icon: Building2 },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'payments', label: 'Payout Methods', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Vendor Studio Settings" subtitle="Configure vendor profile, handle rules, business details, and banking information" icon={Settings} />

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Preview */}
          <div className="glossy-panel rounded-3xl border border-white/50 p-6 shadow-premium-lg backdrop-blur-xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-2xl font-bold text-white shadow-glow-sage ring-4 ring-white">
                    {photo ? (
                      <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      user.avatar
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-sage-600 text-white shadow-md hover:bg-sage-700"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-dark-900">{user.fullName}</h3>
                    {kycStatus === 'verified' && <VerifiedBadge size="md" />}
                  </div>
                  <p className="text-sm font-bold text-sage-700">@{user.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.category} · {user.location}</p>
                </div>
              </div>

              {/* Verified Badge Indicator */}
              <div className="flex items-center gap-2 rounded-2xl border border-sage-200 bg-white/90 p-3 text-xs font-semibold text-dark-800 shadow-sm">
                {kycStatus === 'verified' ? (
                  <>
                    <VerifiedBadge size="sm" />
                    <span>Official Blue Verified Vendor</span>
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4 text-gold-600" />
                    <span>KYC Verification Required for Blue Badge</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-6 space-y-5">
            <h3 className="text-lg font-bold text-dark-900">Profile & Handle Customization</h3>

            {/* Username input with 14-day rule info */}
            <div className="rounded-2xl border border-sage-200 bg-sage-50/50 p-4 space-y-2">
              <label className="block text-xs font-bold text-dark-900">
                Vendor Handle (@username)
              </label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  required
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-semibold text-dark-900 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
                <Info className="h-4 w-4 shrink-0 text-sage-600" />
                <p className="leading-normal">
                  <span className="font-semibold text-dark-800">Handle Policy:</span> You can change your @username handle{' '}
                  <span className="font-bold text-sage-700">up to twice every 14 days</span>. You currently have{' '}
                  <span className="font-bold text-gold-700">{usernameRule.remainingChanges} change(s)</span> remaining in this 14-day window.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-dark-700">Full Display Name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-dark-700">Website URL</label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-dark-700">Email Address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-dark-700">Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Bio with 150-char counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-dark-700">Profile Bio & Specializations</label>
                <span className={cn('text-xs font-bold', bio.length > 150 ? 'text-red-600' : 'text-muted-foreground')}>
                  {bio.length}/150 chars
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={150}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Award-winning photographer capturing luxury moments ✨📸"
                className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sage-700"
              >
                <Check className="h-4 w-4" /> Save Profile & Handle
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'business' && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-dark-900">Business Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">Business Name</label>
              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">Service Category</label>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sage-700"
            >
              <Check className="h-4 w-4" /> Save Business Info
            </button>
          </div>
        </motion.form>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Security & Authentication</h3>
          <form onSubmit={e => { e.preventDefault(); showToast('Password updated'); }} className="space-y-4 max-w-md">
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">Current Password</label>
              <input type="password" placeholder="••••••••" className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">New Password</label>
              <input type="password" placeholder="••••••••" className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </div>
            <button type="submit" className="rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sage-700">
              Update Password
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-dark-900">Notification Preferences</h3>
          <div className="space-y-3">
            {['New Booking Requests', 'Payment Received', 'New Client Reviews', 'Package Views', 'System Updates'].map((pref, i) => (
              <div key={pref} className="flex items-center justify-between rounded-xl border border-border bg-cream-50/50 p-3.5">
                <span className="text-sm font-medium text-dark-700">{pref}</span>
                <button
                  onClick={() => showToast(`Updated preference for ${pref}`)}
                  className={cn('relative h-7 w-12 rounded-full transition-colors', i < 4 ? 'bg-sage-600' : 'bg-dark-200')}
                >
                  <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform', i < 4 ? 'left-6' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'payments' && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-border bg-card p-5 shadow-premium sm:p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-dark-900">Banking & UPI Payout Methods</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">UPI VPA ID</label>
              <input
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="vendor@okaxis"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">Bank Account Number</label>
              <input
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="•••• •••• 8842"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-dark-700">IFSC Code</label>
              <input
                value={ifsc}
                onChange={e => setIfsc(e.target.value)}
                placeholder="HDFC0001234"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-dark-900 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sage-700"
            >
              <Check className="h-4 w-4" /> Save Banking Details
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
