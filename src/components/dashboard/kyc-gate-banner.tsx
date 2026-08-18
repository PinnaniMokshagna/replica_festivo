import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function KycGateBanner() {
  const { kycStatus } = useAuth();
  const navigate = useNavigate();

  if (kycStatus === 'verified') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glossy-panel relative overflow-hidden rounded-2xl border border-gold-300/60 bg-gradient-to-r from-gold-50/90 via-cream-50/80 to-sage-50/90 p-5 shadow-premium-lg mb-6 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-glow-gold">
            {kycStatus === 'pending' ? <Clock className="h-6 w-6 animate-spin-slow" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-dark-900">
                {kycStatus === 'pending' ? 'KYC Verification Under Review' : 'KYC Document Verification Required'}
              </h4>
              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-gold-800 border border-gold-300">
                {kycStatus === 'pending' ? 'Reviewing' : 'Action Needed'}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-dark-700">
              {kycStatus === 'pending'
                ? 'Your government ID document has been submitted and is currently in the queue for Blue Verification Badge approval.'
                : 'Upload government photo ID (Aadhaar/PAN/Passport) to apply for the official Blue Verification Badge.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/vendor-dashboard/verify-documents')}
            className="flex items-center gap-2 rounded-xl bg-sage-600 px-4 py-2.5 text-xs font-bold text-white shadow-glow-sage transition-all hover:bg-sage-700"
          >
            {kycStatus === 'pending' ? 'Check Document Status' : 'Upload ID Now'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
