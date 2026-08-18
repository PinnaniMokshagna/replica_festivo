import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNav } from '@/components/dashboard/top-nav';
import { BottomNav } from '@/components/dashboard/bottom-nav';
import { AuthModal } from '@/components/auth/auth-modal';
import { AdminKycPortal } from '@/components/admin/admin-kyc-portal';
import { ToastBanner } from '@/components/ui/toast-banner';
import { useAuth } from '@/context/AuthContext';

const gatedRoutes: Record<string, string> = {
  '/vendor-dashboard/bookings': 'Bookings Management',
  '/vendor-dashboard/packages': 'Packages & Services',
  '/vendor-dashboard/earnings': 'Earnings & Payouts',
  '/vendor-dashboard/deals': 'Special Offers & Deals',
  '/vendor-dashboard/messages': 'Customer Messages',
  '/vendor-dashboard/analytics': 'Business Analytics',
};

function FeatureLockedScreen({ featureName }: { featureName: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-100/60 border border-gold-300/30 text-gold-600 shadow-glow-gold">
          <Lock className="h-10 w-10 text-gold-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 border border-red-200 text-red-700">
          <ShieldAlert className="h-4.5 w-4.5" />
        </div>
      </div>

      <h3 className="font-display text-2xl font-black text-dark-900 tracking-tight mb-2">
        {featureName} is Locked
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        KYC Document Verification is required to access bookings, portfolio packages, financial earnings, deals, customer chats, and analytics reporting.
      </p>

      <button
        onClick={() => navigate('/vendor-dashboard/verify-documents')}
        className="flex items-center gap-2 rounded-xl bg-sage-600 px-5 py-3 text-xs font-bold text-white shadow-glow-sage transition-all hover:bg-sage-700"
      >
        Complete KYC Verification
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function VendorPortalLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { kycStatus } = useAuth();

  const featureName = gatedRoutes[location.pathname];
  const isLocked = kycStatus !== 'verified' && !!featureName;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-[280px]">
        <TopNav onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="mx-auto max-w-[1600px] p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {isLocked ? (
              <FeatureLockedScreen featureName={featureName} />
            ) : (
              <Outlet />
            )}
          </motion.div>
        </main>
      </div>

      <BottomNav />
      <AuthModal />
      <AdminKycPortal />
      <ToastBanner />
    </div>
  );
}
