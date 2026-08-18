import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ToastBanner() {
  const { toast } = useData();

  if (!toast) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex items-center gap-3 rounded-2xl border border-sage-200 bg-dark-900/95 px-5 py-3.5 text-white shadow-premium-lg backdrop-blur-md"
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-sage-400" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-gold-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
