import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, User, Building, CreditCard, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { InstagramBadge } from '@/components/ui/instagram-badge';

export function AdminKycPortal() {
  const { isAdminModalOpen, setAdminModalOpen, user, kycStatus, kycRecord, adminApproveKyc, adminRejectKyc } = useAuth();
  const { showToast } = useData();

  if (!isAdminModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAdminModalOpen(false)}
          className="absolute inset-0 bg-dark-900/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/50 bg-card shadow-premium-lg"
        >
          {/* Admin Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-dark-900 to-dark-800 px-6 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-600 shadow-glow-sage">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Festivo Admin KYC Portal</h3>
                <p className="text-[11px] text-white/70">Document Inspection & Blue Badge Issuer</p>
              </div>
            </div>
            <button
              onClick={() => setAdminModalOpen(false)}
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Vendor Summary Card */}
            <div className="rounded-2xl border border-border bg-cream-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white shadow-sm">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-dark-900 text-base">{user.fullName}</h4>
                      {kycStatus === 'verified' && <InstagramBadge size="sm" />}
                    </div>
                    <p className="text-xs font-semibold text-sage-700">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.businessName} · {user.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold capitalize border ${
                      kycStatus === 'verified'
                        ? 'bg-sage-100 text-sage-800 border-sage-300'
                        : kycStatus === 'pending'
                        ? 'bg-gold-100 text-gold-800 border-gold-300'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    {kycStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Submitted Documents Inspection */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Submitted Documents Inspection
              </h4>

              {kycRecord ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-sage-600" />
                      <div>
                        <p className="font-bold text-dark-900">{kycRecord.govtIdType}</p>
                        <p className="text-muted-foreground font-mono">ID No: {kycRecord.govtIdNumber}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-sage-50 px-2 py-1 font-semibold text-sage-800">
                      {kycRecord.govtIdFile || 'Attached'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <Building className="h-4 w-4 text-gold-600" />
                      <div>
                        <p className="font-bold text-dark-900">Business Certificate (Optional)</p>
                        <p className="text-muted-foreground font-mono">
                          {kycRecord.businessRegNumber ? `GST: ${kycRecord.businessRegNumber}` : 'Not provided (Optional)'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-cream-100 px-2 py-1 font-semibold text-dark-700">
                      {kycRecord.businessRegFile || 'Optional'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="h-4 w-4 text-sage-600" />
                      <div>
                        <p className="font-bold text-dark-900">Banking Proof</p>
                        <p className="text-muted-foreground font-mono">Cancelled Cheque Attached</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-sage-50 px-2 py-1 font-semibold text-sage-800">
                      {kycRecord.bankProofFile || 'Attached'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-cream-50 p-4 text-center text-xs text-muted-foreground">
                  No document submission record found. Vendor is currently unverified.
                </div>
              )}
            </div>

            {/* Decision Actions */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  adminApproveKyc();
                  showToast(`Admin Approved KYC! Issued official Blue Verified Badge to @${user.username}`, 'success');
                  setAdminModalOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sage-600 py-3 text-xs font-bold text-white shadow-glow-sage hover:bg-sage-700 transition-colors"
              >
                <InstagramBadge size="sm" />
                Approve & Grant Blue Verified Badge
              </button>

              <button
                onClick={() => {
                  adminRejectKyc();
                  showToast('Admin Rejected KYC Submission', 'info');
                  setAdminModalOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
