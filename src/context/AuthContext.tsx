import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type KycStatus = 'unverified' | 'pending' | 'verified';

export interface KycDocumentRecord {
  govtIdType: string;
  govtIdNumber: string;
  govtIdFile?: string;
  businessRegNumber?: string;
  businessRegFile?: string;
  bankProofFile?: string;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  website: string;
  businessName: string;
  category: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  upiId: string;
  bankAccount: string;
  ifsc: string;
  usernameHistory: number[];
}

const DEFAULT_USER: UserProfile = {
  id: '',
  email: '',
  fullName: '',
  username: '',
  website: '',
  businessName: '',
  category: '',
  phone: '',
  location: '',
  bio: '',
  avatar: 'VN',
  upiId: '',
  bankAccount: '',
  ifsc: '',
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
  updateProfile: (data: Partial<UserProfile>) => void;

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
      if (saved) return { ...DEFAULT_USER, ...JSON.parse(saved) };

      const festivoUser = localStorage.getItem('festivo_user');
      const festivoProfile = localStorage.getItem('festivo_profile');
      if (festivoUser) {
        const u = JSON.parse(festivoUser);
        const p = festivoProfile ? JSON.parse(festivoProfile) : null;
        const name = p?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Vendor';
        const nameInitials = name.slice(0, 2).toUpperCase();
        return {
          ...DEFAULT_USER,
          id: u.id || DEFAULT_USER.id,
          email: u.email || DEFAULT_USER.email,
          fullName: name,
          businessName: `${name} Events`,
          username: (u.email?.split('@')[0] || 'vendor').toLowerCase().replace(/[^a-z0-9]/g, '.'),
          avatar: nameInitials,
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
        // Map database status
        if (data.status === 'approved') {
          setKycStatus('verified');
        } else if (data.status === 'kyc_submitted') {
          setKycStatus('pending');
        } else if (data.status === 'rejected') {
          setKycStatus('unverified');
        } else {
          // pending registration without docs submitted
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

  // Sync with Supabase Auth session & setup Realtime / polling
  useEffect(() => {
    // 1. Initial KYC status check
    refreshKycStatus();

    // 2. Poll Supabase every 3 seconds for live approval updates across devices
    const interval = setInterval(refreshKycStatus, 3000);

    // 3. Supabase Realtime channel for instant push updates
    const channel = supabase
      .channel('public:vendor_applications_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendor_applications' },
        () => {
          refreshKycStatus();
        }
      )
      .subscribe();

    // 4. Also listen to focus and storage events
    const onFocusOrStorage = () => refreshKycStatus();
    window.addEventListener('focus', onFocusOrStorage);
    window.addEventListener('storage', onFocusOrStorage);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocusOrStorage);
      window.removeEventListener('storage', onFocusOrStorage);
    };
  }, [refreshKycStatus]);

  // Check Supabase active auth session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const emailLower = (session.user.email || '').toLowerCase().trim();
        const derivedName = session.user.user_metadata?.full_name || emailLower.split('@')[0] || 'Vendor';
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          email: emailLower || prev.email,
          fullName: derivedName,
          businessName: `${derivedName} Events`,
          avatar: derivedName.slice(0, 2).toUpperCase(),
        }));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const emailLower = (session.user.email || '').toLowerCase().trim();
        const derivedName = session.user.user_metadata?.full_name || emailLower.split('@')[0] || 'Vendor';
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          email: emailLower,
          fullName: derivedName,
          businessName: `${derivedName} Events`,
          avatar: derivedName.slice(0, 2).toUpperCase(),
        }));
        refreshKycStatus();
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [refreshKycStatus]);

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
    const businessName = `${derivedName} Events`;
    const username = emailPrefix.replace(/[^a-z0-9]/gi, '.').toLowerCase();

    setIsAuthenticated(true);
    const newProfile: UserProfile = {
      ...DEFAULT_USER,
      email: emailLower,
      fullName: derivedName,
      businessName,
      username,
      avatar: derivedName.slice(0, 2).toUpperCase(),
    };
    setUser(newProfile);
    localStorage.setItem('vendor_user_profile', JSON.stringify(newProfile));
    localStorage.setItem('vendor_is_authenticated', 'true');

    // Make sure vendor exists in Supabase
    try {
      await supabase.from('vendor_applications').upsert({
        email: emailLower,
        business_name: businessName,
        owner_name: derivedName,
        category: 'Event Provider',
        location: 'Hyderabad, India',
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email', ignoreDuplicates: true });
    } catch (e) {}

    await refreshKycStatus();
    return true;
  };

  const signup = async (email: string, name: string, business: string): Promise<boolean> => {
    const emailLower = email.trim().toLowerCase();
    const cleanUser = name.toLowerCase().replace(/\s+/g, '.');
    const newProfile: UserProfile = {
      ...DEFAULT_USER,
      email: emailLower,
      fullName: name,
      businessName: business,
      username: cleanUser,
      avatar: name.slice(0, 2).toUpperCase() || 'VN',
    };
    setIsAuthenticated(true);
    setUser(newProfile);
    localStorage.setItem('vendor_user_profile', JSON.stringify(newProfile));
    localStorage.setItem('vendor_is_authenticated', 'true');

    try {
      await supabase.from('vendor_applications').upsert({
        email: emailLower,
        business_name: business,
        owner_name: name,
        category: 'Event Provider',
        location: 'Hyderabad, India',
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
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

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('vendor_user_profile', JSON.stringify(updated));
      return updated;
    });
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
