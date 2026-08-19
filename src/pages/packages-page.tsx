import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package as PackageIcon, Check, Pencil, Trash2, Plus, Sparkles, X, Star,
  Upload, Image as ImageIcon, Video, AlertCircle, CreditCard, ShieldAlert, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { type Package } from '@/lib/dashboard-data';
import { readAndCompressImage, safeSetItem } from '@/lib/storageUtils';
import { syncVendorToCustomerDirectory } from '@/lib/vendorSync';

import { CATEGORY_LABELS } from '@/lib/categories';

const CATEGORIES = CATEGORY_LABELS;

const PACKAGE_TYPES: Array<'Basic' | 'Standard' | 'Premium' | 'Custom'> = [
  'Basic', 'Standard', 'Premium', 'Custom'
];

export function PackagesPage() {
  const navigate = useNavigate();
  const { packagesList, addPackageItem, editPackageItem, deletePackageItem, togglePackagePopular, showToast } = useData();
  const { user, kycRecord } = useAuth();

  // Check strictly if vendor has submitted payment details (Bank Account or UPI ID) in settings
  const hasBankDetails = Boolean(
    (user.bankAccount && user.bankAccount.trim()) ||
    (user.upiId && user.upiId.trim()) ||
    (user.ifsc && user.ifsc.trim())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBankPromptModal, setShowBankPromptModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(user.category || 'Photography');
  const [packageType, setPackageType] = useState<'Basic' | 'Standard' | 'Premium' | 'Custom'>('Premium');
  const [price, setPrice] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [servicesRaw, setServicesRaw] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const openAddModal = () => {
    if (!hasBankDetails) {
      setShowBankPromptModal(true);
      return;
    }

    setEditingPkg(null);
    setName('');
    setCategory(user.category || 'Photography');
    setPackageType('Premium');
    setPrice('');
    setShortDescription('');
    setDetailedDescription('');
    setCoverImage('');
    setGalleryImages([]);
    setServicesRaw('');
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setCategory(pkg.category || user.category || 'Photography');
    setPackageType(pkg.packageType || 'Premium');
    setPrice(pkg.price);
    setShortDescription(pkg.shortDescription || '');
    setDetailedDescription(pkg.detailedDescription || '');
    setCoverImage(pkg.coverImage || '');
    setGalleryImages(pkg.galleryImages || []);
    setServicesRaw(pkg.services.join(', '));
    setIsPopular(!!pkg.popular);
    setIsModalOpen(true);
  };

  // Handle Cover Photo Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const dataUrl = await readAndCompressImage(file, 900, 0.75);
      setCoverImage(dataUrl);
    } catch (err) {
      console.error('Cover photo upload error:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Gallery Photos Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await readAndCompressImage(files[i], 800, 0.7);
        newUrls.push(url);
      }
      setGalleryImages(prev => [...prev, ...newUrls]);
    } catch (err) {
      console.error('Gallery photos upload error:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    if (!hasBankDetails) {
      setIsModalOpen(false);
      setShowBankPromptModal(true);
      return;
    }

    const servicesList = servicesRaw.split(',').map(s => s.trim()).filter(Boolean);

    const vId = user.id || 'active_vendor';
    const vEmail = (user.email || '').toLowerCase().trim();
    const vName = (user.businessName || user.fullName || 'FLOWERS Events').trim();
    const vSlug = (
      user.username ||
      vName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ).toLowerCase().trim().replace(/^@+/, '') || 'flowers-events';

    const payload = {
      vendorId: vId,
      vendorEmail: vEmail,
      vendorSlug: vSlug,
      name,
      category,
      packageType,
      price: price.startsWith('₹') ? price : `₹${price}`,
      shortDescription: shortDescription || `${packageType} tier package for ${category} services.`,
      detailedDescription,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      galleryImages,
      services: servicesList.length > 0 ? servicesList : ['Full Event Coverage', 'Professional Team & Equipment'],
      popular: isPopular,
    };

    if (editingPkg) {
      editPackageItem(editingPkg.id, payload);
    } else {
      addPackageItem(payload);
    }

    setIsModalOpen(false);
    showToast(`Package "${name}" under "${category}" is now live in Supabase!`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Packages"
        subtitle="Manage package names, categories, pricing tiers, descriptions, cover photos & galleries"
        icon={PackageIcon}
      />

      {/* Bank Account Verification Warning Banner */}
      {!hasBankDetails && (
        <div className="bg-gold-50 border border-gold-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-dark-900 text-sm">Payout & Bank Details Required</h3>
              <p className="text-xs text-dark-600 mt-0.5 max-w-xl">
                To create and publish service packages for clients, you must first add your Bank Account Number or UPI ID in Settings so client payments can be deposited.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/vendor-dashboard/settings')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm whitespace-nowrap cursor-pointer"
          >
            Complete Payout Settings <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Package Card */}
        <motion.button
          onClick={openAddModal}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-sage-300 bg-sage-50/30 p-6 text-center text-sage-800 transition-all hover:border-sage-500 hover:bg-sage-50 shadow-sm cursor-pointer"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-600 text-white shadow-glow-sage">
            <Plus className="h-8 w-8" />
          </div>
          <p className="font-display font-black text-dark-900 text-lg">Create Custom Package</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add package details, category, tier type, pricing, descriptions & upload photos/videos.
          </p>
        </motion.button>

        <AnimatePresence>
          {packagesList.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl border shadow-premium transition-shadow hover:shadow-premium-lg',
                pkg.popular ? 'border-sage-400 bg-card ring-2 ring-sage-300/60' : 'border-border bg-card',
              )}
            >
              {/* Cover Photo Header */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img
                  src={pkg.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800'}
                  alt={pkg.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />

                {/* Most Popular Badge */}
                {pkg.popular && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-bold text-white shadow-glow">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                )}

                {/* Category & Tier Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-sage-800 uppercase tracking-wider shadow-sm">
                    {pkg.category || 'Package'}
                  </span>
                  <span className="rounded-full bg-gold-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                    {pkg.packageType || 'Standard'}
                  </span>
                </div>

                {/* Title & Price overlay */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <h4 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">{pkg.name}</h4>
                  <p className="text-xl font-black text-gold-300 drop-shadow-md">{pkg.price}</p>
                </div>
              </div>

              {/* Package Content */}
              <div className="flex flex-1 flex-col p-5 space-y-4">
                {/* Short Description */}
                {pkg.shortDescription && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                    "{pkg.shortDescription}"
                  </p>
                )}

                {/* Gallery Images Preview (if uploaded) */}
                {pkg.galleryImages && pkg.galleryImages.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-dark-500 block mb-1.5 uppercase tracking-wider">
                      Gallery ({pkg.galleryImages.length} items)
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {pkg.galleryImages.slice(0, 4).map((imgUrl, idx) => (
                        <div key={idx} className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                          {imgUrl.startsWith('data:video') ? (
                            <div className="flex h-full w-full items-center justify-center bg-dark-800 text-white">
                              <Video className="h-5 w-5" />
                            </div>
                          ) : (
                            <img src={imgUrl} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                          )}
                        </div>
                      ))}
                      {pkg.galleryImages.length > 4 && (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-xs font-bold text-sage-800">
                          +{pkg.galleryImages.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Services Inclusions */}
                <ul className="flex-1 space-y-2">
                  {pkg.services.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-dark-700">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-100">
                        <Check className="h-3 w-3 text-sage-700" />
                      </span>
                      <span className="font-medium">{s}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-sage-700 shadow-sm cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Package
                  </button>
                  <button
                    onClick={() => togglePackagePopular(pkg.id)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors cursor-pointer',
                      pkg.popular ? 'bg-gold-100 border-gold-300 text-gold-700' : 'border-border bg-card text-muted-foreground hover:text-dark-900',
                    )}
                    title="Toggle Most Popular"
                  >
                    <Star className="h-4 w-4" fill={pkg.popular ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => deletePackageItem(pkg.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-dark-600 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: Bank Details Block Prompt */}
      {showBankPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage-100 relative">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sage-900 text-lg">Payment Details Required</h3>
              <p className="text-xs text-dark-500 mt-1.5 leading-relaxed">
                You cannot create packages without adding your payment details. Please complete your Bank Account or UPI ID in Settings so you can receive payouts from customer bookings.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowBankPromptModal(false)}
                className="flex-1 py-2.5 bg-cream-100 hover:bg-cream-200 text-dark-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBankPromptModal(false);
                  navigate('/vendor-dashboard/settings?tab=payments');
                }}
                className="flex-1 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-glow-sage"
              >
                Add Payment Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-premium-lg p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-dark-900">
                  {editingPkg ? 'Edit Service Package' : 'Create New Package Tier'}
                </h3>
                <p className="text-xs text-muted-foreground">Add pricing, category, descriptions & upload package photos</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Package Name & Price */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-dark-800 mb-1">Package Name *</label>
                  <input
                    required
                    placeholder="e.g. Premium Wedding Photography"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-sage-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-800 mb-1">Package Price (₹) *</label>
                  <input
                    required
                    placeholder="₹1,50,000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-sage-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category & Package Type */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-dark-800 mb-1">Package Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-sage-500 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-800 mb-1">Package Type / Tier</label>
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {PACKAGE_TYPES.map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setPackageType(type)}
                        className={cn(
                          'py-2 text-[11px] font-bold rounded-xl border transition-all text-center cursor-pointer',
                          packageType === type
                            ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                            : 'bg-muted/50 border-border text-dark-700 hover:bg-muted'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-dark-800 mb-1">Short Description</label>
                <input
                  placeholder="e.g. Complete 2-day wedding coverage with candid album & drone video"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-sage-500 focus:outline-none"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-dark-800 mb-1">Detailed Description & Inclusions</label>
                <textarea
                  rows={3}
                  placeholder="Detailed breakdown of services, deliverables, album specifications, equipment used, and terms..."
                  value={detailedDescription}
                  onChange={e => setDetailedDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-sage-500 focus:outline-none"
                />
              </div>

              {/* Inclusions List (Comma Separated) */}
              <div>
                <label className="block text-xs font-bold text-dark-800 mb-1">Included Services (comma separated)</label>
                <input
                  placeholder="Full Day Coverage, 2 Photographers, Cinematic Film, Drone Shots, Printed Album"
                  value={servicesRaw}
                  onChange={e => setServicesRaw(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-sage-500 focus:outline-none"
                />
              </div>

              {/* Package Cover Image Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark-800">Package Cover Photo (Upload Photo)</label>
                <div className="flex items-center gap-4">
                  {coverImage ? (
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-muted group">
                      <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-90 hover:opacity-100 cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/40 p-4 text-center hover:border-sage-500 hover:bg-sage-50 transition-colors">
                    <ImageIcon className="h-6 w-6 text-sage-600 mb-1" />
                    <span className="text-xs font-bold text-sage-800">
                      {uploadingCover ? 'Processing Photo...' : 'Click to Upload Cover Photo'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG or WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Gallery Images / Videos Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-dark-800">Gallery Photos / Videos (Upload Multiple)</label>
                
                {/* Uploaded Gallery Grid */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {galleryImages.map((url, idx) => (
                      <div key={idx} className="relative group h-16 w-full overflow-hidden rounded-xl border border-border bg-muted">
                        {url.startsWith('data:video') ? (
                          <div className="flex h-full w-full items-center justify-center bg-dark-800 text-white">
                            <Video className="h-6 w-6" />
                          </div>
                        ) : (
                          <img src={url} alt={`Gallery ${idx}`} className="h-full w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove item"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-4 text-center hover:border-sage-400 hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-dark-600 mb-1" />
                  <span className="text-xs font-bold text-dark-800">
                    {uploadingGallery ? 'Processing Uploads...' : 'Click to Upload Gallery Photos / Videos'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Select multiple images or video clips</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Checkbox: Most Popular */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-sage-600 focus:ring-sage-500"
                />
                <label htmlFor="popularCheck" className="text-xs font-bold text-dark-900 cursor-pointer flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-gold-500" /> Feature as "Most Popular" Tier
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-sage-600 py-3 text-sm font-bold text-white transition-all hover:bg-sage-700 shadow-glow-sage cursor-pointer"
              >
                {editingPkg ? 'Update Package Details' : 'Save & Publish Package'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
