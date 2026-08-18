import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Building, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, user, isAuthenticated, login, signup, logout } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email || 'vendor@luxuryweddings.in', password || 'password');
      } else {
        await signup(email || 'vendor@luxuryweddings.in', fullName || 'Vendor Name', businessName || 'Luxury Studio');
      }
      setAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModalOpen(false)}
          className="absolute inset-0 bg-dark-900/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-premium-lg"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-dark-900">
                {isAuthenticated ? 'Vendor Account' : 'Next.js & Supabase Auth'}
              </h3>
            </div>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-dark-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {isAuthenticated ? (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-2xl font-bold text-sage-800 border-2 border-sage-300 shadow-inner">
                  {user.avatar}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark-900">{user.fullName}</h4>
                  <p className="text-sm font-medium text-sage-700">{user.businessName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                </div>

                <div className="rounded-2xl border border-sage-200 bg-sage-50/50 p-4 text-left text-xs space-y-2">
                  <p className="flex items-center justify-between text-dark-800">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold">{user.category}</span>
                  </p>
                  <p className="flex items-center justify-between text-dark-800">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-semibold">{user.location}</span>
                  </p>
                  <p className="flex items-center justify-between text-dark-800">
                    <span className="text-muted-foreground">Backend Sync:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-sage-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> PostgreSQL Ready
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setAuthModalOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div>
                {/* Tabs */}
                <div className="mb-6 flex rounded-xl border border-border bg-muted p-1">
                  <button
                    onClick={() => setTab('login')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                      tab === 'login'
                        ? 'bg-card text-dark-900 shadow-sm'
                        : 'text-muted-foreground hover:text-dark-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setTab('signup')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                      tab === 'signup'
                        ? 'bg-card text-dark-900 shadow-sm'
                        : 'text-muted-foreground hover:text-dark-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {tab === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            required
                            type="text"
                            placeholder="Aarav Sharma"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">Business Name</label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            required
                            type="text"
                            placeholder="Royal Moments Studio"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Vendor Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        required
                        type="email"
                        placeholder="aarav@luxuryweddings.in"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-dark-900 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-sage-600 py-3 text-sm font-semibold text-white transition-all hover:bg-sage-700 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
