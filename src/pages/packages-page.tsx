import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package as PackageIcon, Check, Pencil, Trash2, Plus, Sparkles, X, Star } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { type Package } from '@/lib/dashboard-data';

export function PackagesPage() {
  const { packagesList, addPackageItem, editPackageItem, deletePackageItem, togglePackagePopular } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [servicesRaw, setServicesRaw] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  const openAddModal = () => {
    setEditingPkg(null);
    setName('');
    setPrice('');
    setServicesRaw('');
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setPrice(pkg.price);
    setServicesRaw(pkg.services.join(', '));
    setIsPopular(!!pkg.popular);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    const servicesList = servicesRaw.split(',').map(s => s.trim()).filter(Boolean);

    if (editingPkg) {
      editPackageItem(editingPkg.id, {
        name,
        price: price.startsWith('₹') ? price : `₹${price}`,
        services: servicesList.length > 0 ? servicesList : ['Full Day Coverage', 'Professional Editing'],
        popular: isPopular,
      });
    } else {
      addPackageItem({
        name,
        price: price.startsWith('₹') ? price : `₹${price}`,
        services: servicesList.length > 0 ? servicesList : ['Full Day Coverage', 'Professional Editing'],
        popular: isPopular,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Service Packages" subtitle="Create pricing Tiers, edit inclusions, and feature popular offerings" icon={PackageIcon} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Package Card */}
        <motion.button
          onClick={openAddModal}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/30 p-6 text-center text-sage-800 transition-colors hover:border-sage-500 hover:bg-sage-50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 shadow-sm">
            <Plus className="h-7 w-7 text-sage-700" />
          </div>
          <p className="font-bold text-dark-900 text-base">Create Custom Package</p>
          <p className="text-xs text-muted-foreground">Add customized tier for weddings or corporate events</p>
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
                'relative flex flex-col rounded-2xl border p-5 shadow-premium transition-shadow hover:shadow-premium-lg',
                pkg.popular ? 'border-sage-400 bg-sage-50/40 ring-2 ring-sage-300' : 'border-border bg-card',
              )}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-0.5 text-[11px] font-bold text-white shadow-glow-sage">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-dark-900">{pkg.name}</h4>
                  <p className="mt-1 text-2xl font-extrabold text-gold-700">{pkg.price}</p>
                </div>
                <button
                  onClick={() => togglePackagePopular(pkg.id)}
                  className={cn(
                    'rounded-full p-1.5 transition-colors',
                    pkg.popular ? 'bg-gold-100 text-gold-700' : 'bg-muted text-muted-foreground hover:text-dark-900',
                  )}
                  title="Toggle Popular Badge"
                >
                  <Star className="h-4 w-4" fill={pkg.popular ? 'currentColor' : 'none'} />
                </button>
              </div>

              <ul className="mt-4 flex-1 space-y-2.5">
                {pkg.services.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-dark-700">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-100">
                      <Check className="h-3 w-3 text-sage-700" />
                    </span>
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sage-700 shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Details
                </button>
                <button
                  onClick={() => deletePackageItem(pkg.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-dark-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete Package"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: Create or Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-dark-900">
                {editingPkg ? 'Edit Package Details' : 'Create New Package Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Package Name</label>
                <input
                  required
                  placeholder="e.g. Destination Luxury Royal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Price (₹)</label>
                <input
                  required
                  placeholder="₹1,50,000"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Services (comma separated)</label>
                <textarea
                  rows={3}
                  placeholder="Full Day Coverage, 2 Photographers, Cinematic Video, Drone Shots"
                  value={servicesRaw}
                  onChange={e => setServicesRaw(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-sage-600 focus:ring-sage-500"
                />
                <label htmlFor="popularCheck" className="text-xs font-semibold text-dark-900 cursor-pointer">
                  Tag as "Most Popular"
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 shadow-sm"
              >
                {editingPkg ? 'Update Package' : 'Save Package'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
