import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type KycStatus = 'unverified' | 'pending' | 'verified';

export interface KycDocumentRecord {
  govtIdType: string;
  govtIdNumber: string;
  govtIdFile?: string;
  bankProofFile?: string;
  businessRegNumber?: string;
  businessRegFile?: string;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  businessName: string;
  category: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  upiId: string;
  bankAccount: string;
  ifsc: string;
  website: string;
  avatar: string;
  username: string;
  usernameHistory: number[];
}

export const DEFAULT_USER: UserProfile = {
  id: '',
  fullName: '',
  businessName: '',
  category: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  upiId: '',
  bankAccount: '',
  ifsc: '',
  website: '',
  avatar: 'VN',
  username: '',
  usernameHistory: [],
};

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  isAdminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;

  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, business: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  canChangeUsername: () => { allowed: boolean; remainingChanges: number; daysUntilReset?: number };
  changeUsername: (newUsername: string) => { success: boolean; message: string };

  kycStatus: KycStatus;
  setKycStatus: (status: KycStatus) => void;
  kycRecord: KycDocumentRecord | null;
  submitKycDocuments: (record: Omit<KycDocumentRecord, 'submittedAt'>) => Promise<void>;
  adminApproveKyc: () => Promise<void>;
  adminRejectKyc: (reason?: string) => Promise<void>;
  refreshKycStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getInitialUser = (): UserProfile => {
    try {
      const saved = localStorage.getItem('vendor_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Evict known stale fake-data profiles — these were injected by old DEFAULT_USER or auth.tsx
        const isStale = !parsed?.email ||
          parsed.email === 'vendor@festivo.com' ||
          parsed.bankAccount === '987654321098' ||
          parsed.upiId === 'flowersevents@okhdfcbank';
        if (isStale) {
          localStorage.removeItem('vendor_user_profile');
        } else {
          // Valid saved profile — restore it; Supabase will update any stale fields on mount
          return { ...DEFAULT_USER, ...parsed };
        }
      }

      const festivoUser = localStorage.getItem('festivo_user');
      if (festivoUser) {
        const u = JSON.parse(festivoUser);
        const festivoProfile = localStorage.getItem('festivo_profile');
        const p = festivoProfile ? JSON.parse(festivoProfile) : null;
        const name = p?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || '';
        return {
          ...DEFAULT_USER,
          id: u.id || '',
          email: u.email || '',
          fullName: name,
          businessName: '',
          username: (u.email?.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '.'),
          avatar: name.slice(0, 2).toUpperCase() || 'VN',
        };
      }
    } catch (e) {}
    return DEFAULT_USER;
  };

  const [user, setUser] = useState<UserProfile>(() => getInitialUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vendor_is_authenticated') === 'true' || !!localStorage.getItem('festivo_user');
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);

  const [kycStatus, setKycStatus] = useState<KycStatus>('unverified');
  const [kycRecord, setKycRecord] = useState<KycDocumentRecord | null>(null);

  // Load complete vendor profile from Supabase — always trust DB values, never fall back to fake defaults
  const loadUserProfileFromSupabase = useCallback(async (emailToFetch: string, authUser?: any) => {
    const emailLower = (emailToFetch || '').toLowerCase().trim();
    if (!emailLower) return;

    try {
      const { data: appData } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('email', emailLower)
        .maybeSingle();

      const customData = (appData?.data || {}) as Record<string, any>;
      const loadedFullName = appData?.owner_name || authUser?.user_metadata?.full_name || emailLower.split('@')[0];
      const loadedBusinessName = appData?.business_name || (loadedFullName ? `${loadedFullName} Events` : '');
      const loadedUsername = customData.username || (emailLower.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '.');

      setUser(prev => {
        const updated: UserProfile = {
          ...prev,
          id: authUser?.id || appData?.user_id || prev.id,
          email: emailLower,
          fullName: loadedFullName || prev.fullName,
          businessName: loadedBusinessName || prev.businessName,
          // Always use DB value; if DB returns empty string store empty string (no fake default)
          category: appData?.category ?? customData.category ?? prev.category,
          location: appData?.location ?? customData.location ?? prev.location,
          phone: appData?.phone ?? customData.phone ?? prev.phone,
          bio: customData.bio ?? prev.bio,
          website: customData.website ?? prev.website,
          upiId: customData.upiId ?? appData?.upi_id ?? prev.upiId,
          bankAccount: customData.bankAccount ?? appData?.bank_account ?? prev.bankAccount,
          ifsc: customData.ifsc ?? appData?.bank_ifsc ?? prev.ifsc,
          username: loadedUsername || prev.username,
          avatar: (loadedFullName || prev.fullName || 'VN').slice(0, 2).toUpperCase(),
        };
        localStorage.setItem('vendor_user_profile', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.warn('Error loading vendor profile from Supabase:', err);
    }
  }, []);

  // Canonical query directly from Supabase
  const refreshKycStatus = useCallback(async () => {
    const currentEmail = (user.email || '').toLowerCase().trim();
    if (!currentEmail) return;

    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('email', currentEmail)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching Supabase vendor application status:', error.message);
        return;
      }

      if (data) {
        if (data.status === 'approved') {
          setKycStatus('verified');
        } else if (data.status === 'kyc_submitted') {
          setKycStatus('pending');
        } else if (data.status === 'rejected') {
          setKycStatus('unverified');
        } else {
          const hasDocs = !!(data.govt_id_number || data.govt_id_file_url || data.bank_proof_file_url);
          setKycStatus(hasDocs ? 'pending' : 'unverified');
        }

        if (data.govt_id_number || data.govt_id_file_url) {
          setKycRecord({
            govtIdType: data.govt_id_type || 'Aadhaar Card',
            govtIdNumber: data.govt_id_number || '',
            govtIdFile: data.govt_id_file_url || undefined,
            bankProofFile: data.bank_proof_file_url || undefined,
            businessRegNumber: data.business_reg_number || undefined,
            businessRegFile: data.business_reg_file_url || undefined,
            submittedAt: data.kyc_submitted_at ? new Date(data.kyc_submitted_at).toLocaleDateString('en-IN') : 'Recently',
          });
        }
      } else {
        setKycStatus('unverified');
      }
    } catch (e) {
      console.warn('Failed to refresh Supabase KYC status:', e);
    }
  }, [user.email]);

  // Sync with Supabase Auth session & setup Realtime / focus listener
  useEffect(() => {
    refreshKycStatus();

    const channel = supabase
      .channel('public:vendor_applications_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendor_applications' },
        () => {
          refreshKycStatus();
          if (user.email) loadUserProfileFromSupabase(user.email);
        }
      )
      .subscribe();

    const onFocusOrStorage = () => {
      refreshKycStatus();
      if (user.email) loadUserProfileFromSupabase(user.email);
    };
    window.addEventListener('focus', onFocusOrStorage);
    window.addEventListener('storage', onFocusOrStorage);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocusOrStorage);
      window.removeEventListener('storage', onFocusOrStorage);
    };
  }, [refreshKycStatus, loadUserProfileFromSupabase, user.email]);

  // Check Supabase active auth session on mount & load complete profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const emailLower = (session.user.email || '').toLowerCase().trim();
        loadUserProfileFromSupabase(emailLower, session.user);
      } else if (user.email) {
        loadUserProfileFromSupabase(user.email);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const emailLower = (session.user.email || '').toLowerCase().trim();
        loadUserProfileFromSupabase(emailLower, session.user);
        refreshKycStatus();
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadUserProfileFromSupabase, refreshKycStatus, user.email]);

  // Instagram Username Rule Check: Max 2 changes within 14 days
  const canChangeUsername = () => {
    const now = Date.now();
    const history = user.usernameHistory || [];
    const recentChanges = history.filter(timestamp => now - timestamp < FOURTEEN_DAYS_MS);

    if (recentChanges.length >= 2) {
      const oldestInWindow = Math.min(...recentChanges);
      const daysUntilReset = Math.ceil((FOURTEEN_DAYS_MS - (now - oldestInWindow)) / (24 * 60 * 60 * 1000));
      return { allowed: false, remainingChanges: 0, daysUntilReset };
    }
    return { allowed: true, remainingChanges: 2 - recentChanges.length };
  };

  const changeUsername = (newUsername: string): { success: boolean; message: string } => {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (!cleanUsername) return { success: false, message: 'Invalid username format.' };
    if (cleanUsername === user.username) return { success: true, message: 'Username is unchanged.' };

    const check = canChangeUsername();
    if (!check.allowed) {
      return {
        success: false,
        message: `Username Rule: You can only change your @username handle twice every 14 days. Please wait ${check.daysUntilReset} more day(s).`,
      };
    }

    const now = Date.now();
    const updatedHistory = [...(user.usernameHistory || []), now];

    setUser(prev => {
      const updated = { ...prev, username: cleanUsername, usernameHistory: updatedHistory };
      localStorage.setItem('vendor_user_profile', JSON.stringify(updated));
      return updated;
    });

    // Also persist to Supabase
    if (user.email) {
      supabase.from('vendor_applications').select('data').eq('email', user.email.toLowerCase().trim()).maybeSingle().then(({ data }) => {
        const existingData = (data?.data || {}) as Record<string, any>;
        supabase.from('vendor_applications').update({
          data: { ...existingData, username: cleanUsername },
          updated_at: new Date().toISOString(),
        }).eq('email', user.email.toLowerCase().trim());
      });
    }

    return {
      success: true,
      message: `Username updated to @${cleanUsername}!`,
    };
  };

  const login = async (email: string, _pass: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    const emailPrefix = emailLower.split('@')[0];
    const derivedName = emailPrefix
      .replace(/[._\-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Vendor';

    setIsAuthenticated(true);
    localStorage.setItem('vendor_is_authenticated', 'true');

    // Ensure vendor row exists but do NOT overwrite existing data (ignoreDuplicates: true)
    try {
      await supabase.from('vendor_applications').upsert({
        email: emailLower,
        owner_name: derivedName,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email', ignoreDuplicates: true });

      // Always load from Supabase so saved data is restored, not overwritten
      await loadUserProfileFromSupabase(emailLower);
    } catch (e) {}

    await refreshKycStatus();
    return true;
  };

  const signup = async (email: string, name: string, business: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    const cleanUser = name.toLowerCase().replace(/\s+/g, '.');
    setIsAuthenticated(true);
    localStorage.setItem('vendor_is_authenticated', 'true');

    try {
      await supabase.from('vendor_applications').upsert({
        email: emailLower,
        business_name: business,
        owner_name: name,
        status: 'pending',
        updated_at: new Date().toISOString(),
        data: { username: cleanUser },
      }, { onConflict: 'email', ignoreDuplicates: true });
      await loadUserProfileFromSupabase(emailLower);
    } catch (e) {}

    await refreshKycStatus();
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(DEFAULT_USER);
    setKycStatus('unverified');
    setKycRecord(null);
    localStorage.removeItem('vendor_is_authenticated');
    localStorage.removeItem('vendor_user_profile');
    localStorage.removeItem('festivo_user');
    localStorage.removeItem('festivo_profile');
    localStorage.removeItem('festivo_admin_authenticated');
    window.dispatchEvent(new Event('storage'));
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    const updatedUser: UserProfile = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('vendor_user_profile', JSON.stringify(updatedUser));

    const emailLower = (updatedUser.email || '').toLowerCase().trim();
    if (!emailLower) return;

    try {
      // 1. Fetch current application data jsonb
      const { data: existingApp } = await supabase
        .from('vendor_applications')
        .select('data')
        .eq('email', emailLower)
        .maybeSingle();

      const existingData = (existingApp?.data || {}) as Record<string, any>;
      const mergedData = {
        ...existingData,
        upiId: updatedUser.upiId ?? existingData.upiId ?? '',
        bankAccount: updatedUser.bankAccount ?? existingData.bankAccount ?? '',
        ifsc: updatedUser.ifsc ?? existingData.ifsc ?? '',
        website: updatedUser.website ?? existingData.website ?? '',
        bio: updatedUser.bio ?? existingData.bio ?? '',
        username: updatedUser.username ?? existingData.username ?? '',
      };

      // 2. Persist to Supabase vendor_applications table
      await supabase
        .from('vendor_applications')
        .upsert({
          user_id: updatedUser.id && updatedUser.id.length > 20 ? updatedUser.id : undefined,
          email: emailLower,
          business_name: updatedUser.businessName || '',
          owner_name: updatedUser.fullName || '',
          category: updatedUser.category || '',
          location: updatedUser.location || '',
          phone: updatedUser.phone || '',
          data: mergedData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      // 3. Persist to Supabase profiles table if user ID exists
      if (updatedUser.id && updatedUser.id.length > 20) {
        await supabase.from('profiles').upsert({
          id: updatedUser.id,
          full_name: updatedUser.fullName,
          phone: updatedUser.phone,
          city: updatedUser.location,
          role: 'vendor',
        });
      }
    } catch (err) {
      console.warn('Error saving profile to Supabase:', err);
    }
  };

  // Vendor submits documents directly into Supabase vendor_applications
  const submitKycDocuments = async (record: Omit<KycDocumentRecord, 'submittedAt'>) => {
    const emailLower = (user.email || '').toLowerCase().trim();
    const submittedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const fullRecord: KycDocumentRecord = {
      ...record,
      submittedAt: submittedDate,
    };
    setKycRecord(fullRecord);
    setKycStatus('pending');

    try {
      const { error } = await supabase
        .from('vendor_applications')
        .upsert({
          user_id: user.id && user.id.length > 20 ? user.id : undefined,
          email: emailLower,
          business_name: user.businessName || `${user.fullName} Events`,
          owner_name: user.fullName || 'Vendor',
          category: user.category || 'Event Provider',
          location: user.location || 'Hyderabad, India',
          phone: user.phone || '',
          govt_id_type: record.govtIdType || 'Aadhaar Card',
          govt_id_number: record.govtIdNumber || '',
          govt_id_file_url: record.govtIdFile || '',
          bank_proof_file_url: record.bankProofFile || '',
          business_reg_number: record.businessRegNumber || '',
          business_reg_file_url: record.businessRegFile || '',
          status: 'kyc_submitted',
          kyc_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });

      if (error) {
        console.error('Supabase vendor_applications submit error:', error);
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.warn('Submission error:', e);
      throw e;
    }
  };

  const adminApproveKyc = async () => {
    const emailLower = (user.email || '').toLowerCase().trim();
    setKycStatus('verified');
    try {
      await supabase
        .from('vendor_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('email', emailLower);
    } catch (e) {}
  };

  const adminRejectKyc = async () => {
    const emailLower = (user.email || '').toLowerCase().trim();
    setKycStatus('unverified');
    try {
      await supabase
        .from('vendor_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('email', emailLower);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthModalOpen,
        setAuthModalOpen,

        isAdminModalOpen,
        setAdminModalOpen,

        login,
        signup,
        logout,
        updateProfile,

        canChangeUsername,
        changeUsername,

        kycStatus,
        setKycStatus,
        kycRecord,
        submitKycDocuments,
        adminApproveKyc,
        adminRejectKyc,
        refreshKycStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
