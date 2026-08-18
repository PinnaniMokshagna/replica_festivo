import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PageHeader({ title, subtitle, icon: Icon }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4"
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-sage">
          <Icon className="h-7 w-7 text-white" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
    </motion.div>
  );
}
