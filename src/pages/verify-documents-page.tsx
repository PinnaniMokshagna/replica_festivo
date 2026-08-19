import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, Building, CreditCard, Eye, X, FileText } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { VerifiedBadge } from '@/components/ui/verified-badge';

// Compress image to a reasonable size for preview and transmission
const compressImage = (file: File, maxWidth = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const processFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    if (file.size > 3 * 1024 * 1024) {
      throw new Error('PDF is too large (max 3MB)');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read PDF'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
  return compressImage(file);
};

export function VerifyDocumentsPage() {
  const { kycStatus, kycRecord, submitKycDocuments, refreshKycStatus } = useAuth();
  const { showToast } = useData();

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [govtIdType, setGovtIdType] = useState(kycRecord?.govtIdType || 'Aadhaar Card');
  const [govtIdNumber, setGovtIdNumber] = useState(kycRecord?.govtIdNumber || '');
  const [businessRegNumber, setBusinessRegNumber] = useState(kycRecord?.businessRegNumber || '');

  // File Previews / Strings
  const [govtIdFile, setGovtIdFile] = useState<string | null>(kycRecord?.govtIdFile || null);
  const [govtIdFileName, setGovtIdFileName] = useState<string>(kycRecord?.govtIdFile ? 'Government_Photo_ID' : '');

  const [businessRegFile, setBusinessRegFile] = useState<string | null>(kycRecord?.businessRegFile || null);
  const [businessRegFileName, setBusinessRegFileName] = useState<string>(kycRecord?.businessRegFile ? 'Business_Certificate' : '');

  const [bankProofFile, setBankProofFile] = useState<string | null>(kycRecord?.bankProofFile || null);
  const [bankProofFileName, setBankProofFileName] = useState<string>(kycRecord?.bankProofFile ? 'Cancelled_Cheque' : '');

  // Preview Modal
  const [previewModal, setPreviewModal] = useState<{ title: string; fileUrl: string } | null>(null);

  // Populate from record when available
  useEffect(() => {
    if (kycRecord) {
      if (kycRecord.govtIdType) setGovtIdType(kycRecord.govtIdType);
      if (kycRecord.govtIdNumber) setGovtIdNumber(kycRecord.govtIdNumber);
      if (kycRecord.businessRegNumber) setBusinessRegNumber(kycRecord.businessRegNumber);
      if (kycRecord.govtIdFile) {
        setGovtIdFile(kycRecord.govtIdFile);
        setGovtIdFileName('Government_Photo_ID');
      }
      if (kycRecord.bankProofFile) {
        setBankProofFile(kycRecord.bankProofFile);
        setBankProofFileName('Cancelled_Cheque');
      }
      if (kycRecord.businessRegFile) {
        setBusinessRegFile(kycRecord.businessRegFile);
        setBusinessRegFileName('Business_Certificate');
      }
    }
  }, [kycRecord]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError('');

    if (!govtIdNumber.trim()) {
      setSubmitError('Please enter your Government ID Number.');
      return;
    }
    if (!govtIdFile) {
      setSubmitError('Please upload your Government Photo ID (Aadhaar/PAN/Passport).');
      return;
    }
    if (!bankProofFile) {
      setSubmitError('Please upload your Banking Proof (Cancelled Cheque or Bank Passbook).');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitKycDocuments({
        govtIdType,
        govtIdNumber: govtIdNumber.trim(),
        govtIdFile: govtIdFile || undefined,
        businessRegNumber: businessRegNumber.trim() || undefined,
        businessRegFile: businessRegFile || undefined,
        bankProofFile: bankProofFile || undefined,
      });

      await refreshKycStatus();
      showToast('KYC Documents submitted successfully! Your application is now in the Admin Review queue.', 'success');
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err?.message || 'Failed to submit KYC documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verify KYC Documents"
        subtitle="Submit official identity & banking proofs for verification and Blue Verification Badge activation"
        icon={ShieldCheck}
      />

      {/* Verification Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-panel relative overflow-hidden rounded-3xl border border-white/50 p-6 shadow-premium backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md',
                kycStatus === 'verified'
                  ? 'bg-gradient-to-br from-sage-500 to-sage-700 shadow-glow-sage'
                  : kycStatus === 'pending'
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600 shadow-glow-gold'
                  : 'bg-gradient-to-br from-dark-500 to-dark-700'
              )}
            >
              {kycStatus === 'verified' && <VerifiedBadge size="lg" />}
              {kycStatus === 'pending' && <Clock className="h-7 w-7 animate-pulse" />}
              {kycStatus === 'unverified' && <AlertCircle className="h-7 w-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-dark-900 flex items-center gap-1.5">
                  {kycStatus === 'verified' && (
                    <>
                      KYC Verified & Official Blue Badge Active <VerifiedBadge size="md" />
                    </>
                  )}
                  {kycStatus === 'pending' && 'Documents Submitted — Awaiting Admin Review'}
                  {kycStatus === 'unverified' && 'Verification Required (Aadhaar/PAN Required)'}
                </h3>
                <span
                  className={cn(
                    'rounded-full px-3 py-0.5 text-xs font-extrabold capitalize border',
                    kycStatus === 'verified' && 'bg-sage-100 text-sage-800 border-sage-300',
                    kycStatus === 'pending' && 'bg-gold-100 text-gold-800 border-gold-300',
                    kycStatus === 'unverified' && 'bg-red-100 text-red-700 border-red-200'
                  )}
                >
                  {kycStatus === 'verified' ? 'Verified Partner' : kycStatus === 'pending' ? 'Pending Review' : 'Action Required'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {kycStatus === 'verified' && 'Your vendor studio is officially verified. All dashboard features are unlocked.'}
                {kycStatus === 'pending' && 'Your documents are safely stored in Supabase and waiting for Admin inspection.'}
                {kycStatus === 'unverified' && 'Government Photo ID and Banking Proof are required to unlock your Vendor Dashboard.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Verified State Unlocked Screen */}
      {kycStatus === 'verified' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-sage-300 bg-gradient-to-br from-sage-50 via-white to-sage-50/60 p-8 shadow-premium text-center space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-sage-600 text-white shadow-glow-sage">
            <ShieldCheck className="h-10 w-10" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-sage-950 flex items-center justify-center gap-2">
              All Vendor Studio Features Are Unlocked! <VerifiedBadge size="lg" />
            </h2>
            <p className="text-sm text-dark-600 leading-relaxed">
              Congratulations! Your verification application has been approved by the Festivo Admin. Your public profile is verified and active.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            {[
              { label: 'Bookings', href: '/vendor-dashboard/bookings', icon: '📅' },
              { label: 'Packages', href: '/vendor-dashboard/packages', icon: '📦' },
              { label: 'Messages', href: '/vendor-dashboard/messages', icon: '💬' },
              { label: 'Earnings', href: '/vendor-dashboard/earnings', icon: '💰' },
            ].map((f) => (
              <a
                key={f.label}
                href={f.href}
                className="p-4 rounded-2xl bg-white border border-sage-200 shadow-sm hover:shadow-md hover:border-sage-400 transition-all text-center block group"
              >
                <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{f.icon}</span>
                <span className="text-xs font-extrabold text-sage-900">{f.label}</span>
                <span className="block text-[10px] text-sage-600 font-bold mt-0.5">Unlocked ✓</span>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Form Submission (Shown when not verified or when reviewing submitted docs) */}
      {kycStatus !== 'verified' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Step 1: Mandatory Govt ID */}
            <div className="glossy-panel rounded-3xl border border-sage-300 p-6 shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-600 text-white font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-900 flex items-center gap-1">
                      Government Photo ID <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-xs text-muted-foreground font-semibold">Mandatory for Verification</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Select Document Type</label>
                    <select
                      value={govtIdType}
                      onChange={e => setGovtIdType(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-sage-600 focus:outline-none"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (India)</option>
                      <option value="PAN Card">PAN Card (Tax ID)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver License">Driver's License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-700 mb-1">ID Number</label>
                    <input
                      required
                      placeholder="e.g. 5482 9912 3014 or ABCDE1234F"
                      value={govtIdNumber}
                      onChange={e => setGovtIdNumber(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-sage-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Photo ID File</label>
                    <input
                      type="file"
                      id="govt-id-input"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setGovtIdFileName(file.name);
                          setSubmitError('');
                          try {
                            const processed = await processFile(file);
                            setGovtIdFile(processed);
                          } catch (err: any) {
                            setSubmitError(err?.message || 'Failed to process file.');
                          }
                        }
                      }}
                    />
                    <div
                      onClick={() => document.getElementById('govt-id-input')?.click()}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/40 p-4 text-center cursor-pointer hover:border-sage-500 hover:bg-sage-50 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-sage-600 mb-1" />
                      <span className="text-xs font-bold text-dark-900 truncate max-w-full px-2">
                        {govtIdFile ? (govtIdFileName || 'Identity_Document Attached') : 'Click to Upload Front/Back Photo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {govtIdFile ? (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-sage-100 p-2.5 text-xs font-bold text-sage-900 border border-sage-200">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-4 w-4 text-sage-700 flex-shrink-0" />
                    <span className="truncate">{govtIdFileName || 'Photo ID Attached'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewModal({ title: `${govtIdType} Preview`, fileUrl: govtIdFile })}
                      className="text-sage-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGovtIdFile(null); setGovtIdFileName(''); }}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Photo ID Required
                </div>
              )}
            </div>

            {/* Step 2: Optional Business Registration */}
            <div className="glossy-panel rounded-3xl border border-border p-6 shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-white font-bold shadow-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-900 flex items-center gap-1.5">
                      Business Certificate <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-extrabold text-gold-800">OPTIONAL</span>
                    </h4>
                    <p className="text-xs text-muted-foreground">GST, MSME, or Trade License</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-700 mb-1">GST / License Number (Optional)</label>
                    <input
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      value={businessRegNumber}
                      onChange={e => setBusinessRegNumber(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Certificate File (Optional)</label>
                    <input
                      type="file"
                      id="business-reg-input"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBusinessRegFileName(file.name);
                          setSubmitError('');
                          try {
                            const processed = await processFile(file);
                            setBusinessRegFile(processed);
                          } catch (err: any) {
                            setSubmitError(err?.message || 'Failed to process file.');
                          }
                        }
                      }}
                    />
                    <div
                      onClick={() => document.getElementById('business-reg-input')?.click()}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-cream-50/50 p-4 text-center cursor-pointer hover:border-gold-400 hover:bg-gold-50/30 transition-colors"
                    >
                      <Building className="h-6 w-6 text-gold-600 mb-1" />
                      <span className="text-xs font-bold text-dark-900 truncate max-w-full px-2">
                        {businessRegFile ? (businessRegFileName || 'Certificate Attached') : 'Click to Upload (Optional)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {businessRegFile ? (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-gold-100 p-2.5 text-xs font-bold text-gold-900 border border-gold-200">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-4 w-4 text-gold-700 flex-shrink-0" />
                    <span className="truncate">{businessRegFileName || 'Certificate Attached'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewModal({ title: 'Business Certificate Preview', fileUrl: businessRegFile })}
                      className="text-gold-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBusinessRegFile(null); setBusinessRegFileName(''); }}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted p-2.5 text-xs font-semibold text-muted-foreground border border-border">
                  <AlertCircle className="h-4 w-4" /> Optional Document
                </div>
              )}
            </div>

            {/* Step 3: Banking Proof */}
            <div className="glossy-panel rounded-3xl border border-sage-300 p-6 shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-600 text-white font-bold shadow-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-900 flex items-center gap-1">
                      Banking Proof <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-xs text-muted-foreground">Cancelled Cheque or Passbook</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Used to verify account ownership for fast booking payouts upon verification.
                  </p>

                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Cheque / Passbook</label>
                    <input
                      type="file"
                      id="bank-proof-input"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBankProofFileName(file.name);
                          setSubmitError('');
                          try {
                            const processed = await processFile(file);
                            setBankProofFile(processed);
                          } catch (err: any) {
                            setSubmitError(err?.message || 'Failed to process file.');
                          }
                        }
                      }}
                    />
                    <div
                      onClick={() => document.getElementById('bank-proof-input')?.click()}
                      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/40 p-4 text-center cursor-pointer hover:border-sage-500 hover:bg-sage-50 transition-colors"
                    >
                      <CreditCard className="h-6 w-6 text-sage-600 mb-1" />
                      <span className="text-xs font-bold text-dark-900 truncate max-w-full px-2">
                        {bankProofFile ? (bankProofFileName || 'Bank Proof Attached') : 'Click to Upload Cheque / Passbook'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {bankProofFile ? (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-sage-100 p-2.5 text-xs font-bold text-sage-900 border border-sage-200">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="h-4 w-4 text-sage-700 flex-shrink-0" />
                    <span className="truncate">{bankProofFileName || 'Bank Proof Attached'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewModal({ title: 'Banking Proof Preview', fileUrl: bankProofFile })}
                      className="text-sage-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBankProofFile(null); setBankProofFileName(''); }}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800 border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Banking Proof Required
                </div>
              )}
            </div>
          </div>

          {/* Submission Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-20 border-t border-border mt-8">
            <div className="text-left">
              <p className="font-bold text-dark-900 text-sm">Submit Documents to Platform Admin</p>
              <p className="text-xs text-muted-foreground">Once submitted, documents are reviewed by the Festivo Admin team to grant your Blue Verified Badge.</p>
              {submitError && (
                <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {submitError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-extrabold text-white shadow-glow-sage transition-all hover:shadow-card-hover active:scale-95 cursor-pointer z-30',
                isSubmitting ? 'bg-sage-400 cursor-wait' : 'bg-sage-600 hover:bg-sage-700'
              )}
            >
              <ShieldCheck className="h-5 w-5" /> {isSubmitting ? 'Submitting to Supabase...' : (kycStatus === 'pending' ? 'Update & Re-Submit Documents' : 'Submit Documents for Verification')}
            </button>
          </div>
        </form>
      )}

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-sage-100 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3 border-sage-100">
                <h3 className="font-bold text-sage-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sage-600" /> {previewModal.title}
                </h3>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1 rounded-full text-dark-400 hover:bg-cream-100 hover:text-dark-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center bg-cream-50/70 rounded-2xl p-4 min-h-[300px]">
                {previewModal.fileUrl.startsWith('data:application/pdf') ? (
                  <iframe src={previewModal.fileUrl} className="w-full h-96 rounded-xl border" title="PDF Preview" />
                ) : (
                  <img src={previewModal.fileUrl} alt="Document preview" className="max-h-96 max-w-full rounded-xl object-contain shadow-sm" />
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
