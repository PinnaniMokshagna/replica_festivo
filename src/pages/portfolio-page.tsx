import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, Upload, Trash2, Plus, Eye, X, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { cn } from '@/lib/utils';
import { useData, type PortfolioProject } from '@/context/DataContext';

export function PortfolioPage() {
  const { portfolioItems, addPortfolioItem, deletePortfolioItem } = useData();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioProject | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Weddings');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const categories = ['All', 'Weddings', 'Decoration', 'Corporate', 'Pre-Wedding', 'Makeup'];

  const filteredItems = portfolioItems.filter(p =>
    categoryFilter === 'All' ? true : p.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addPortfolioItem({
      title,
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000',
      description: description || 'Luxury event showcase',
      date: 'Aug 2026',
    });
    setIsAddModalOpen(false);
    setTitle('');
    setImageUrl('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Portfolio Showcase" subtitle="Manage gallery projects, highlight recent events, and attract premium clients" icon={Images} />

      {/* Filter and Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((f) => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition-all',
                categoryFilter === f
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'border border-border bg-card text-dark-700 hover:bg-muted',
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow-sage transition-shadow hover:shadow-premium-lg"
        >
          <Upload className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add Project tile */}
        <motion.div
          onClick={() => setIsAddModalOpen(true)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sage-300 bg-sage-50/30 p-6 text-center text-sage-800 transition-colors hover:border-sage-500 hover:bg-sage-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 shadow-sm">
            <Plus className="h-6 w-6 text-sage-700" />
          </div>
          <p className="text-sm font-bold">Add Portfolio Showcase</p>
          <p className="text-xs text-muted-foreground">Upload high-res photography or video preview</p>
        </motion.div>

        <AnimatePresence>
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-premium"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end">
                  <span className="rounded-full bg-sage-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {item.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                  <p className="text-xs text-white/80 line-clamp-1">{item.description}</p>
                  
                  <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-dark-900 backdrop-blur-sm hover:bg-white"
                    >
                      <Eye className="h-3 w-3" /> Preview
                    </button>
                    <button
                      onClick={() => deletePortfolioItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/90 text-white backdrop-blur-sm hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: Lightbox Preview */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-md" onClick={() => setSelectedItem(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg"
          >
            <div className="relative aspect-video">
              <img src={selectedItem.imageUrl} alt={selectedItem.title} className="h-full w-full object-cover" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-dark-900/60 text-white backdrop-blur-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-dark-900">{selectedItem.title}</h3>
                <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-800">
                  {selectedItem.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Portfolio Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg p-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sage-600" />
                <h3 className="text-lg font-bold text-dark-900">Add Portfolio Showcase</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Project Title</label>
                <input
                  required
                  placeholder="e.g. Royal Palace Reception Decor"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="Weddings">Weddings</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Pre-Wedding">Pre-Wedding</option>
                  <option value="Makeup">Makeup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Image URL</label>
                <input
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the event, theme, lighting, and style..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700"
              >
                Save Project to Database
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
