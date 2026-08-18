import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, Eye, Sparkles } from 'lucide-react';
import { packages } from '@/lib/dashboard-data';
import { cn } from '@/lib/utils';

export function PackagesSection() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-900">Packages</h3>
          <p className="text-sm text-muted-foreground">Your service offerings</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">Add package</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className={cn(
              'relative flex flex-col rounded-2xl border p-5 transition-shadow hover:shadow-md',
              pkg.popular ? 'border-sage-300 bg-sage-50/40' : 'border-border bg-cream-50/50',
            )}
          >
            {pkg.popular && (
              <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <Sparkles className="h-2.5 w-2.5" />
                Popular
              </span>
            )}

            <h4 className="text-base font-bold text-dark-900">{pkg.name}</h4>
            <p className="mt-1 text-2xl font-bold text-gold-700">{pkg.price}</p>

            <ul className="mt-4 flex-1 space-y-2">
              {pkg.services.map((service) => (
                <li key={service} className="flex items-start gap-2 text-sm text-dark-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage-100">
                    <Check className="h-2.5 w-2.5 text-sage-700" />
                  </span>
                  {service}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sage-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-sage-700">
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 transition-colors hover:bg-muted">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-dark-600 transition-colors hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
