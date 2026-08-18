import { motion } from 'framer-motion';
import { Upload, Images } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';

export function PortfolioPreview() {
  const { portfolioItems } = useData();
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Portfolio Showcase</h3>
          <p className="text-sm text-muted-foreground">Showcase your best work to clients</p>
        </div>
        <button
          onClick={() => navigate('/vendor-dashboard/portfolio')}
          className="flex items-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Add / Manage
        </button>
      </div>

      {portfolioItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-sage-200 bg-cream-50/50">
          <Images className="h-10 w-10 text-sage-400 mb-2" />
          <p className="font-semibold text-dark-900 text-sm">No portfolio items uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-0.5">Click "Add / Manage" to upload your event photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {portfolioItems.map((item, i) => (
            <motion.div
              key={item.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-cream-100 cursor-pointer"
              onClick={() => navigate('/vendor-dashboard/portfolio')}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-3">
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
