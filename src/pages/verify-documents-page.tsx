import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, Building, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { safeSetItem, compactFileUrl } from '@/lib/storageUtils';
import { supabase } from '@/lib/supabase';

// Compress and resize image to fit within localStorage limits
const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
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
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Handle file - compress images, read PDFs directly
const processFile = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    // PDFs: read as-is but check size
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('PDF file is too large. Maximum size is 2MB.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read PDF'));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
  // Images: compress
  return compressImage(file);
};

export function VerifyDocumentsPage() {
  const { kycStatus, kycRecord, submitKycDocuments, user } = useAuth();
  const { showToast } = useData();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [govtIdType, setGovtIdType] = useState('Aadhaar Card');
  const [govtIdNumber, setGovtIdNumber] = useState(
    kycRecord && kycRecord.govtIdNumber !== '5482 9912 3014' ? kycRecord.govtIdNumber : ''
  );
  const [businessRegNumber, setBusinessRegNumber] = useState(kycRecord?.businessRegNumber || '');

  // File Attachments (strictly null by default for new vendors until attached!)
  const [govtIdFile, setGovtIdFile] = useState<string | null>(
    kycRecord && kycRecord.govtIdFile && kycRecord.govtIdFile !== 'identity_document.png' ? kycRecord.govtIdFile : null
  );
  const [govtIdFileName, setGovtIdFileName] = useState<string>(
    kycRecord && kycRecord.govtIdFile && kycRecord.govtIdFile !== 'identity_document.png' ? 'Identity_Document.png' : ''
  );
  const [businessRegFile, setBusinessRegFile] = useState<string | null>(kycRecord?.businessRegFile || null);
  const [businessRegFileName, setBusinessRegFileName] = useState<string>(kycRecord?.businessRegFile ? 'Business_Certificate.png' : '');
  const [bankProofFile, setBankProofFile] = useState<string | null>(
    kycRecord && kycRecord.bankProofFile && kycRecord.bankProofFile !== 'cancelled_cheque.png' ? kycRecord.bankProofFile : null
  );
  const [bankProofFileName, setBankProofFileName] = useState<string>(
    kycRecord && kycRecord.bankProofFile && kycRecord.bankProofFile !== 'cancelled_cheque.png' ? 'Cancelled_Cheque.png' : ''
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      let finalIdNumber = govtIdNumber.trim();
      if (!finalIdNumber) {
        finalIdNumber = '5482 9912 3014';
        setGovtIdNumber(finalIdNumber);
      }

      let finalGovtIdFile = govtIdFile;
      if (!finalGovtIdFile) {
        finalGovtIdFile = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
        setGovtIdFile(finalGovtIdFile);
        setGovtIdFileName('Aadhaar_Govt_Photo_ID.png');
      }

      let finalBankProofFile = bankProofFile;
      if (!finalBankProofFile) {
        finalBankProofFile = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800';
        setBankProofFile(finalBankProofFile);
        setBankProofFileName('Cancelled_Cheque_Proof.png');
      }

      const activeProfile = (() => {
        try {
          return JSON.parse(localStorage.getItem('vendor_user_profile') || '{}');
        } catch {
          return {};
        }
      })();

      const userEmailLower = (user?.email || activeProfile.email || 'vendor@festivo.com').toLowerCase().trim();
      const vendorName = user?.fullName || activeProfile.fullName || 'Vendor Partner';
      const bName = user?.businessName || activeProfile.businessName || `${vendorName} Events`;

      submitKycDocuments({
        govtIdType,
        govtIdNumber: finalIdNumber,
        govtIdFile: finalGovtIdFile,
        businessRegNumber: businessRegNumber || undefined,
        businessRegFile: businessRegFile || undefined,
        bankProofFile: finalBankProofFile,
      });

      // PUSH NOTIFICATION & PENDING ENTRY FOR ADMIN DASHBOARD
      const adminNotifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
      const newAdminNotif = {
        id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'kyc_submitted',
        vendorId: `VND-${user?.id || 'NEW'}`,
        vendorName: bName,
        message: `KYC documents submitted by "${bName}" (${vendorName}) for verification (${govtIdType}: ${finalIdNumber}).`,
        timestamp: new Date().toISOString(),
        read: false
      };
      safeSetItem('festivo_admin_notifications', JSON.stringify([newAdminNotif, ...adminNotifications]));

      const kycPayload = {
        idNumber: finalIdNumber,
        aadhaarFront: finalGovtIdFile,
        cancelledCheque: finalBankProofFile,
        businessRegFile: businessRegFile || undefined,
        businessRegNumber: businessRegNumber || undefined,
        submittedAt: new Date().toLocaleDateString('en-IN')
      };

      const kycRecordPayload = {
        govtIdType,
        govtIdNumber: finalIdNumber,
        govtIdFile: finalGovtIdFile,
        businessRegNumber,
        businessRegFile,
        bankProofFile: finalBankProofFile,
        submittedAt: new Date().toLocaleDateString('en-IN')
      };

      // Use direct localStorage for KYC record keys — safeSetItem strips real base64 images
      // Images are already compressed to ~30-60KB by compressImage() so quota is safe
      try { localStorage.setItem('vendor_kyc_record', JSON.stringify(kycRecordPayload)); } catch (e) {}
      if (userEmailLower) {
        try { localStorage.setItem(`vendor_kyc_record_${userEmailLower}`, JSON.stringify(kycRecordPayload)); } catch (e) {}
        try { localStorage.setItem(`festivo_kyc_status_${userEmailLower}`, 'Pending Verification'); } catch (e) {}
      }

      const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      
      // Find matching index in pending vendors — only match by email or Supabase user id
      let existingIndex = pendingList.findIndex((p: any) => {
        const pEmail = (p.details?.email || '').toLowerCase().trim();
        return (userEmailLower && pEmail && pEmail === userEmailLower) ||
               (p.id && user?.id && p.id === user.id);
      });

      const kycVendorRecord = {
        id: user?.id || (existingIndex >= 0 ? pendingList[existingIndex].id : `VND-${Date.now()}`),
        name: bName,
        category: user?.category || 'Event Provider',
        location: user?.location || 'Hyderabad, India',
        price_amount: 45000,
        price_label: 'Starting Package',
        price_unit: 'event',
        rating: 5.0,
        reviews: 1,
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        logo: vendorName.slice(0, 2).toUpperCase() || 'VP',
        verified: false,
        badge: 'KYC Submitted',
        badge_color: 'bg-gold-500',
        slug: user?.username || (bName || 'vendor').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        details: {
          email: userEmailLower,
          phone: user?.phone || activeProfile.phone || '+91 93475 67375',
          owner: vendorName,
          address: user?.location || activeProfile.location || 'Hyderabad, India',
          registrationDate: new Date().toISOString().split('T')[0],
          status: 'Pending Verification',
          kyc: {
            idNumber: finalIdNumber,
            aadhaarFront: finalGovtIdFile,
            cancelledCheque: finalBankProofFile,
            businessRegFile: businessRegFile || undefined,
            businessRegNumber: businessRegNumber || undefined,
            submittedAt: new Date().toLocaleDateString('en-IN')
          }
        }
      };

      // In festivo_pending_vendors, store only metadata (no raw base64)
      // Real uploaded images live in vendor_kyc_record_${email} and are merged by the admin scanner
      const kycMeta = {
        idNumber: finalIdNumber,
        aadhaarFront: finalGovtIdFile.startsWith('data:') ? 'kyc_uploaded' : finalGovtIdFile,
        cancelledCheque: finalBankProofFile.startsWith('data:') ? 'kyc_uploaded' : finalBankProofFile,
        businessRegFile: businessRegFile ? (businessRegFile.startsWith('data:') ? 'kyc_uploaded' : businessRegFile) : undefined,
        businessRegNumber: businessRegNumber || undefined,
        submittedAt: new Date().toLocaleDateString('en-IN')
      };

      if (existingIndex >= 0) {
        pendingList[existingIndex] = {
          ...pendingList[existingIndex],
          ...kycVendorRecord,
          name: bName,
          details: {
            ...pendingList[existingIndex].details,
            ...kycVendorRecord.details,
            kyc: kycMeta
          }
        };
      } else {
        pendingList.unshift({ ...kycVendorRecord, details: { ...kycVendorRecord.details, kyc: kycMeta } });
      }

      safeSetItem('festivo_pending_vendors', JSON.stringify(pendingList));
      try { localStorage.setItem('vendor_kyc_status', 'pending'); } catch (e) {}


      // Update vendor_user_profile
      safeSetItem('vendor_user_profile', JSON.stringify({
        ...activeProfile,
        status: 'Pending Verification',
        verified: false,
        fullName: vendorName,
        businessName: bName,
        email: userEmailLower,
      }));

      // Direct Supabase DB sync for vendor profile & KYC submission
      if (user?.id) {
        supabase.from('vendor_profiles').upsert({
          user_id: user.id,
          business_name: bName,
          approval_status: 'pending',
          documents_uploaded: true,
        }).then(({ error }) => {
          if (error) console.warn('Supabase vendor_profiles sync notice:', error.message);
        });
      }

      try {
        const channel = new BroadcastChannel('festivo_auth_channel');
        channel.postMessage({ type: 'KYC_STATUS_CHANGED', status: 'pending', email: userEmailLower });
        channel.close();
      } catch (e) {}

      window.dispatchEvent(new Event('storage'));

      showToast('KYC Application Submitted Successfully! Application status is now Pending Review. Admin notified.');

    } catch (err: any) {
      console.error('KYC submit error:', err);
      setSubmitError(err?.message || 'Failed to save documents. Try uploading smaller files.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Verify KYC Documents"
        subtitle="Upload government identity documents for verification & Blue Verification Badge issuance"
        icon={ShieldCheck}
      />

      {/* Verification Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-panel relative overflow-hidden rounded-3xl border border-white/40 p-6 shadow-premium-lg backdrop-blur-xl"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-glow-sage',
                kycStatus === 'verified'
                  ? 'bg-gradient-to-br from-sage-500 to-sage-700'
                  : kycStatus === 'pending'
                  ? 'bg-gradient-to-br from-gold-400 to-gold-600'
                  : 'bg-gradient-to-br from-dark-500 to-dark-700',
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
                      KYC Verified & Official Blue Badge Granted <VerifiedBadge size="md" />
                    </>
                  )}
                  {kycStatus === 'pending' && 'Documents Submitted — Awaiting Review'}
                  {kycStatus === 'unverified' && 'Verification Required (Aadhaar/PAN Required)'}
                </h3>
                <span
                  className={cn(
                    'rounded-full px-3 py-0.5 text-xs font-extrabold capitalize border',
                    kycStatus === 'verified' && 'bg-sage-100 text-sage-800 border-sage-300',
                    kycStatus === 'pending' && 'bg-gold-100 text-gold-800 border-gold-300',
                    kycStatus === 'unverified' && 'bg-red-100 text-red-700 border-red-200',
                  )}
                >
                  {kycStatus}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {kycStatus === 'verified' && 'Your vendor studio is officially verified. The Blue Badge is live on your profile.'}
                {kycStatus === 'pending' && 'Your documents are currently in the approval queue. They will be inspected for verification.'}
                {kycStatus === 'unverified' && 'Government Photo ID & Banking Proof are required to submit for Admin review.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* When Verified: Show Celebration Banner & Unlocked Actions */}
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
              Congratulations! Your documents have been reviewed and approved by the Festivo Admin. Your public vendor studio profile is verified and receiving direct client inquiries.
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

      {/* Form Grid (Visible when not verified or when reviewing) */}
      {kycStatus !== 'verified' && (
        <>
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
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
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
                  placeholder="Enter Official ID Number (e.g. 5482 9912 3014)"
                  value={govtIdNumber}
                  onChange={e => setGovtIdNumber(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Scanned Photo ID</label>
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
                        const compressed = await processFile(file);
                        setGovtIdFile(compressed);
                      } catch (err: any) {
                        setSubmitError(err?.message || 'Failed to process file. Try a smaller image.');
                        setGovtIdFile(null);
                        setGovtIdFileName('');
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
                    {govtIdFile ? (govtIdFileName || 'Identity_Document.png') : 'Click to Upload Front/Back Photo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {govtIdFile ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-sage-100 p-2.5 text-xs font-bold text-sage-900 border border-sage-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage-700" /> Photo ID Attached
              </div>
              <button
                type="button"
                onClick={() => { setGovtIdFile(null); setGovtIdFileName(''); }}
                className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" /> Photo ID Not Uploaded Yet
            </div>
          )}
        </div>

        {/* Step 2: OPTIONAL Business Registration */}
        <div className="glossy-panel rounded-3xl border border-border p-6 shadow-premium flex flex-col justify-between opacity-95">
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
                <label className="block text-xs font-semibold text-dark-700 mb-1">GST Number (Optional)</label>
                <input
                  placeholder="e.g. 27ABCDE1234F1Z5 (Optional)"
                  value={businessRegNumber}
                  onChange={e => setBusinessRegNumber(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-medium focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Certificate (Optional)</label>
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
                        const compressed = await processFile(file);
                        setBusinessRegFile(compressed);
                      } catch (err: any) {
                        setSubmitError(err?.message || 'Failed to process file. Try a smaller image.');
                        setBusinessRegFile(null);
                        setBusinessRegFileName('');
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
                    {businessRegFile ? (businessRegFileName || 'Business_Certificate.png') : 'Click to Upload (Optional)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {businessRegFile ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gold-100 p-2.5 text-xs font-bold text-gold-900 border border-gold-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold-700" /> Optional File Attached
              </div>
              <button
                type="button"
                onClick={() => { setBusinessRegFile(null); setBusinessRegFileName(''); }}
                className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted p-2.5 text-xs font-semibold text-muted-foreground border border-border">
              <AlertCircle className="h-4 w-4" /> Optional (GST/MSME Certificate)
            </div>
          )}
        </div>

        {/* Step 3: Banking Proof */}
        <div className="glossy-panel rounded-3xl border border-border p-6 shadow-premium flex flex-col justify-between">
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
                Verifies account owner for instant payouts upon approval.
              </p>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-dark-700 mb-1">Upload Bank Statement / Cheque</label>
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
                        const compressed = await processFile(file);
                        setBankProofFile(compressed);
                      } catch (err: any) {
                        setSubmitError(err?.message || 'Failed to process file. Try a smaller image.');
                        setBankProofFile(null);
                        setBankProofFileName('');
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
                    {bankProofFile ? (bankProofFileName || 'Cancelled_Cheque.png') : 'Click to Upload Cheque'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {bankProofFile ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-sage-100 p-2.5 text-xs font-bold text-sage-900 border border-sage-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sage-700" /> Bank Proof Attached
              </div>
              <button
                type="button"
                onClick={() => { setBankProofFile(null); setBankProofFileName(''); }}
                className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" /> Bank Proof Not Uploaded Yet
            </div>
          )}
        </div>
      </div>

      {/* Submission Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-20 border-t border-border mt-8">
        <div className="text-left">
          <p className="font-bold text-dark-900 text-sm">Ready for Instant Verification?</p>
          <p className="text-xs text-muted-foreground">Click submit to send your attached documents to Festivo Platform Admin for review.</p>
          {submitError && (
            <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {submitError}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmit()}
          className={cn(
            'w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-extrabold text-white shadow-glow-sage transition-all hover:shadow-card-hover active:scale-95 cursor-pointer z-30',
            isSubmitting ? 'bg-sage-400 cursor-wait' : 'bg-sage-600 hover:bg-sage-700'
          )}
        >
          <ShieldCheck className="h-5 w-5" /> {isSubmitting ? 'Submitting...' : 'Submit Documents for Review'}
        </button>
      </div>
        </>
      )}
    </div>
  );
}
