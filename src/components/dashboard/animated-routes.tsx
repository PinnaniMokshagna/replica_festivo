import { motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';

export function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Routes location={location}>{children}</Routes>
    </motion.div>
  );
}
