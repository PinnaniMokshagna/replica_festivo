import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Shield, Users, User, ArrowRightLeft, Sparkles, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useAuth as useMainAuth } from '@/lib/auth';
import { useAuth as useDashboardAuth } from '@/context/AuthContext';

export function DemoRoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDemoAdmin, switchUserRole } = useMainAuth();
  const { setKycStatus } = useDashboardAuth();
  const [collapsed, setCollapsed] = useState(false);

  const activePath = location.pathname;

  const handleSwitchToAdmin = () => {
    setDemoAdmin();
    navigate('/admin');
  };

  const handleSwitchToVendor = () => {
    switchUserRole('vendor');
    navigate('/vendor-dashboard');
  };

  const handleSwitchToCustomer = () => {
    switchUserRole('customer');
    navigate('/dashboard');
  };

  const handleQuickApproveCurrentVendor = () => {
    localStorage.setItem('vendor_kyc_status', 'verified');
    setKycStatus('verified');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start gap-2 font-sans">
      <div className={`transition-all duration-300 ${collapsed ? 'opacity-0 pointer-events-none translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className="bg-dark-950/90 text-white border border-white/20 backdrop-blur-xl shadow-2xl rounded-2xl p-3 w-72 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 font-bold text-sage-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Festivo Platform Switcher</span>
            </div>
            <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono">Demo Mode</span>
          </div>

          <p className="text-white/60 text-[11px] leading-tight">
            Jump across connected roles to test the entire registration, approval, booking, and payout loop:
          </p>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={handleSwitchToVendor}
              className={`flex items-center gap-2 p-2 rounded-xl text-left font-bold transition-all ${
                activePath.startsWith('/vendor-dashboard')
                  ? 'bg-sage-600 text-white shadow-glow-sage'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Store className="w-4 h-4 shrink-0 text-sage-300" />
              <div>
                <p className="leading-none text-[11px]">Vendor Portal</p>
                <p className="text-[9px] text-white/60 font-normal">Dashboard</p>
              </div>
            </button>

            <button
              onClick={handleSwitchToAdmin}
              className={`flex items-center gap-2 p-2 rounded-xl text-left font-bold transition-all ${
                activePath === '/admin'
                  ? 'bg-gold-600 text-white shadow-glow-gold'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0 text-gold-400" />
              <div>
                <p className="leading-none text-[11px]">Admin Portal</p>
                <p className="text-[9px] text-white/60 font-normal">KYC & Approvals</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/vendors')}
              className={`flex items-center gap-2 p-2 rounded-xl text-left font-bold transition-all ${
                activePath === '/vendors'
                  ? 'bg-sage-600 text-white'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-sage-300" />
              <div>
                <p className="leading-none text-[11px]">Marketplace</p>
                <p className="text-[9px] text-white/60 font-normal">Public Site</p>
              </div>
            </button>

            <button
              onClick={handleSwitchToCustomer}
              className={`flex items-center gap-2 p-2 rounded-xl text-left font-bold transition-all ${
                activePath === '/dashboard'
                  ? 'bg-sage-600 text-white'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4 shrink-0 text-cream-300" />
              <div>
                <p className="leading-none text-[11px]">Customer Hub</p>
                <p className="text-[9px] text-white/60 font-normal">Bookings & Pay</p>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => navigate('/vendor-registration')}
              className="text-[10px] text-white/70 hover:text-white underline font-medium"
            >
              + Register New Vendor
            </button>

            <button
              onClick={handleQuickApproveCurrentVendor}
              className="flex items-center gap-1 text-[10px] bg-sage-500/30 hover:bg-sage-500/50 text-sage-300 px-2 py-1 rounded-lg font-bold border border-sage-400/40"
            >
              <Check className="w-3 h-3" /> Quick Approve KYC
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 bg-dark-900 text-white border border-white/20 px-3 py-2 rounded-full text-xs font-bold shadow-2xl hover:bg-dark-800 transition-all active:scale-95"
      >
        <ArrowRightLeft className="w-3.5 h-3.5 text-sage-400" />
        <span>Platform Nav</span>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
