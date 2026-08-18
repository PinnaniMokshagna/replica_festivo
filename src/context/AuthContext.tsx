import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client';

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
  usernameHistory: number[]; // Timestamps of username modifications
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_default_01',
  email: 'vendor@festivo.com',
  fullName: 'Vendor Partner',
  username: 'vendor.partner',
  website: '',
  businessName: 'Vendor Events',
  category: 'Event Provider',
  phone: '+91 90000 00000',
  location: 'Hyderabad, India',
  bio: 'Event services provider on Festivo Platform.',
  avatar: 'VP',
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

  // Instagram Username Rules
  canChangeUsername: () => { allowed: boolean; remainingChanges: number; daysUntilReset?: number };
  changeUsername: (newUsername: string) => { success: boolean; message: string };

  // Admin KYC Approval State
  kycStatus: KycStatus;
  setKycStatus: (status: KycStatus) => void;
  kycRecord: KycDocumentRecord | null;
  submitKycDocuments: (record: Omit<KycDocumentRecord, 'submittedAt'>) => void;
  adminApproveKyc: () => void;
  adminRejectKyc: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getResolvedUserProfile = (): UserProfile => {
    const mainUser = localStorage.getItem('festivo_user');
    const mainProfile = localStorage.getItem('festivo_profile');
    const saved = localStorage.getItem('vendor_user_profile');

    if (mainUser) {
      try {
        const userObj = JSON.parse(mainUser);
        const emailLower = (userObj.email || '').toLowerCase().trim();
        let profileObj: any = null;
        if (mainProfile) {
          try { profileObj = JSON.parse(mainProfile); } catch (e) {}
        }

        let vSavedObj: any = null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if ((parsed.email || '').toLowerCase().trim() === emailLower) {
              vSavedObj = parsed;
            }
          } catch (e) {}
        }

        let registeredPending: any = null;
        try {
          const pendingRaw = localStorage.getItem('festivo_pending_vendors');
          if (pendingRaw) {
            const pendingList = JSON.parse(pendingRaw);
            registeredPending = pendingList.find(
              (v: any) => (v.details?.email || v.email || '').toLowerCase().trim() === emailLower
            );
          }
        } catch (e) {}

        const rawName = profileObj?.full_name?.trim() || registeredPending?.name || vSavedObj?.fullName || userObj.user_metadata?.full_name || 'Vendor';
        const nameParts = rawName.split(' ');
        const first = nameParts[0] || 'Vendor';
        const last = nameParts.slice(1).join(' ') || '';
        const initials = (first[0] + (last[0] || '')).toUpperCase();
        const cleanUser = rawName.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const isStudio = rawName.toLowerCase().includes('studio') || rawName.toLowerCase().includes('events') || rawName.toLowerCase().includes('photography');
        const bName = registeredPending?.name || vSavedObj?.businessName || (isStudio ? rawName : `${rawName} Events`);

        return {
          ...DEFAULT_USER,
          id: userObj.id || vSavedObj?.id || registeredPending?.id || 'usr_dynamic',
          email: userObj.email || DEFAULT_USER.email,
          fullName: rawName,
          username: cleanUser,
          businessName: bName,
          category: registeredPending?.category || vSavedObj?.category || 'Event Provider',
          location: registeredPending?.location || vSavedObj?.location || 'Hyderabad, India',
          phone: registeredPending?.details?.phone || vSavedObj?.phone || '+91 98765 43210',
          avatar: initials,
        };
      } catch (e) {}
    }

    if (saved) {
      try {
        return { ...DEFAULT_USER, ...JSON.parse(saved) };
      } catch (e) {}
    }

    return DEFAULT_USER;
  };

  const [user, setUser] = useState<UserProfile>(() => getResolvedUserProfile());

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const mainUser = localStorage.getItem('festivo_user');
    const mainProfile = localStorage.getItem('festivo_profile');
    if (mainUser && mainProfile) {
      try {
        const profileObj = JSON.parse(mainProfile);
        if (profileObj.role === 'vendor') {
          return true;
        }
      } catch (e) {}
    }
    return localStorage.getItem('vendor_is_authenticated') === 'true';
  });

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);

  const resolveKycStatus = (userObj: any): KycStatus => {
    if (!userObj) return 'unverified';
    const emailLower = (userObj?.email || '').toLowerCase().trim();
    if (!emailLower) return 'unverified';

    // 1. Check if explicitly Approved by Admin
    if (localStorage.getItem(`festivo_kyc_status_${emailLower}`) === 'Approved') return 'verified';

    // 2. Check festivo_approved_vendors list
    const approvedRaw = localStorage.getItem('festivo_approved_vendors');
    if (approvedRaw) {
      try {
        const approvedList = JSON.parse(approvedRaw);
        if (Array.isArray(approvedList)) {
          const hasApproved = approvedList.some((v: any) =>
            (v.details?.email && v.details.email.toLowerCase().trim() === emailLower) ||
            (v.id && userObj.id && v.id === userObj.id)
          );
          if (hasApproved) return 'verified';
        }
      } catch (e) {}
    }

    // 3. Check if explicitly Rejected
    if (localStorage.getItem(`festivo_kyc_status_${emailLower}`) === 'Rejected') return 'unverified';

    // 4. Check if KYC submitted (Pending Verification)
    if (localStorage.getItem(`festivo_kyc_status_${emailLower}`) === 'Pending Verification') return 'pending';

    // 5. Check festivo_pending_vendors for this specific vendor
    const pendingRaw = localStorage.getItem('festivo_pending_vendors');
    if (pendingRaw) {
      try {
        const pendingList = JSON.parse(pendingRaw);
        if (Array.isArray(pendingList)) {
          const matched = pendingList.find((v: any) =>
            (v.details?.email && v.details.email.toLowerCase().trim() === emailLower) ||
            (v.id && userObj.id && v.id === userObj.id)
          );
          if (matched) {
            if (matched.verified === true || matched.details?.status === 'Approved') return 'verified';
            if (matched.details?.status === 'KYC Submitted' || matched.details?.status === 'Pending Verification') {
              // If documents were uploaded or entered in details.kyc
              const hasDocs = matched.details?.kyc?.idNumber && matched.details.kyc.idNumber !== 'Not submitted';
              if (hasDocs) return 'pending';
            }
          }
        }
      } catch (e) {}
    }

    // 6. Check vendor_kyc_record for this session
    const kRecordRaw = localStorage.getItem('vendor_kyc_record');
    if (kRecordRaw) {
      try {
        const parsed = JSON.parse(kRecordRaw);
        if (parsed && parsed.govtIdNumber && parsed.govtIdNumber !== '5482 9912 3014') {
          return 'pending';
        }
      } catch (e) {}
    }

    return 'unverified';
  };

  // KYC Verification State
  const [kycStatus, setKycStatus] = useState<KycStatus>(() => {
    const mainUser = localStorage.getItem('vendor_user_profile') || localStorage.getItem('festivo_user');
    let uObj = null;
    if (mainUser) {
      try { uObj = JSON.parse(mainUser); } catch (e) {}
    }
    return resolveKycStatus(uObj || user);
  });

  const [kycRecord, setKycRecord] = useState<KycDocumentRecord | null>(() => {
    const saved = localStorage.getItem('vendor_kyc_record');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          !parsed ||
          parsed.govtIdNumber === '5482 9912 3014' ||
          parsed.govtIdFile === 'identity_document.png' ||
          parsed.bankProofFile === 'cancelled_cheque.png'
        ) {
          localStorage.removeItem('vendor_kyc_record');
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Cross-tab and live sync
  useEffect(() => {
    const syncAuthAndKyc = () => {
      const resolvedUser = getResolvedUserProfile();
      setUser(prev => {
        if (
          prev.email !== resolvedUser.email ||
          prev.fullName !== resolvedUser.fullName ||
          prev.businessName !== resolvedUser.businessName ||
          prev.id !== resolvedUser.id
        ) {
          return resolvedUser;
        }
        return prev;
      });

      const mainProfile = localStorage.getItem('festivo_profile');
      let isVendorUser = false;
      if (mainProfile) {
        try {
          const profileObj = JSON.parse(mainProfile);
          isVendorUser = profileObj.role === 'vendor';
        } catch (e) {}
      }
      setIsAuthenticated(isVendorUser || localStorage.getItem('vendor_is_authenticated') === 'true');

      const resolved = resolveKycStatus(resolvedUser);
      setKycStatus(resolved);

      const kRecordSaved = localStorage.getItem('vendor_kyc_record');
      if (kRecordSaved) {
        try {
          const parsed = JSON.parse(kRecordSaved);
          if (parsed && parsed.govtIdNumber !== '5482 9912 3014') {
            setKycRecord(parsed);
          }
        } catch (err) {}
      }
    };

    // 1. BroadcastChannel for zero-latency multi-tab updates
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('festivo_auth_channel');
      channel.onmessage = (e) => {
        if (e.data?.type === 'KYC_STATUS_CHANGED' && e.data.status) {
          setKycStatus(e.data.status as KycStatus);
        } else {
          syncAuthAndKyc();
        }
      };
    } catch (err) {}

    // 2. Native window events
    window.addEventListener('storage', syncAuthAndKyc);
    window.addEventListener('focus', syncAuthAndKyc);
    window.addEventListener('festivo_vendor_approved' as any, syncAuthAndKyc);

    // 3. Fallback active polling every 800ms
    const interval = setInterval(syncAuthAndKyc, 800);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', syncAuthAndKyc);
      window.removeEventListener('focus', syncAuthAndKyc);
      window.removeEventListener('festivo_vendor_approved' as any, syncAuthAndKyc);
      clearInterval(interval);
    };
  }, []);

  // Sync with Supabase Auth if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || prev.email,
          }));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || prev.email,
          }));
        } else {
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Instagram Username Rule Check: Max 2 changes within 14 days
  const canChangeUsername = () => {
    const now = Date.now();
    const history = user.usernameHistory || [];
    // Filter history to last 14 days
    const recentChanges = history.filter(timestamp => now - timestamp < FOURTEEN_DAYS_MS);

    if (recentChanges.length >= 2) {
      const oldestInWindow = Math.min(...recentChanges);
      const daysUntilReset = Math.ceil((FOURTEEN_DAYS_MS - (now - oldestInWindow)) / (24 * 60 * 60 * 1000));
      return {
        allowed: false,
        remainingChanges: 0,
        daysUntilReset,
      };
    }

    return {
      allowed: true,
      remainingChanges: 2 - recentChanges.length,
    };
  };

  const changeUsername = (newUsername: string): { success: boolean; message: string } => {
    const cleanUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (!cleanUsername) {
      return { success: false, message: 'Invalid username format.' };
    }

    if (cleanUsername === user.username) {
      return { success: true, message: 'Username is unchanged.' };
    }

    const check = canChangeUsername();
    if (!check.allowed) {
      return {
        success: false,
        message: `Username Rule: You can only change your @username handle twice every 14 days. Please wait ${check.daysUntilReset} more day(s).`,
      };
    }

    const now = Date.now();
    const updatedHistory = [...(user.usernameHistory || []), now];

    setUser(prev => ({
      ...prev,
      username: cleanUsername,
      usernameHistory: updatedHistory,
    }));

    return {
      success: true,
      message: `Username updated to @${cleanUsername}! (${2 - updatedHistory.filter(t => now - t < FOURTEEN_DAYS_MS).length} changes remaining in 14 days)`,
    };
  };

  const login = async (email: string, _pass: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithPassword({ email, password: _pass });
    }

    const emailLower = email.trim().toLowerCase();
    const emailPrefix = emailLower.split('@')[0];
    // Build readable name from email prefix: "kk" -> "Kk", "john.doe" -> "John Doe"
    const derivedName = emailPrefix
      .replace(/[._\-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Vendor';
    const isStudio = derivedName.toLowerCase().includes('studio') ||
      derivedName.toLowerCase().includes('events') ||
      derivedName.toLowerCase().includes('photography');
    const businessName = isStudio ? derivedName : `${derivedName} Events`;
    const username = emailPrefix.replace(/[^a-z0-9]/gi, '.').toLowerCase();

    setIsAuthenticated(true);
    setUser(prev => ({
      ...prev,
      email: emailLower,
      fullName: derivedName,
      businessName,
      username,
      avatar: derivedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'VN',
    }));

    // Ensure the vendor appears in Admin pending applications
    try {
      const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
      const alreadyExists = pendingList.some(
        (v: any) => (v.details?.email || '').toLowerCase().trim() === emailLower
      );
      if (!alreadyExists) {
        const vendorId = `VND-${Math.floor(100000 + Math.random() * 900000)}`;
        const newEntry = {
          id: vendorId,
          name: businessName,
          category: 'Event Provider',
          location: 'Hyderabad, India',
          price_amount: 25000,
          price_label: 'Starting Package',
          price_unit: 'event',
          rating: 5.0,
          reviews: 0,
          image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
          logo: derivedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'VN',
          verified: false,
          badge: 'Pending Review',
          badge_color: 'bg-gold-500',
          slug: username,
          details: {
            email: emailLower,
            phone: '',
            owner: derivedName,
            address: 'Hyderabad, India',
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'Pending Verification',
            kyc: {
              idNumber: 'Not submitted',
              aadhaarFront: '',
              cancelledCheque: '',
            },
          },
        };
        pendingList.unshift(newEntry);
        localStorage.setItem('festivo_pending_vendors', JSON.stringify(pendingList));

        // Notify admin
        const notifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
        notifications.unshift({
          id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
          type: 'new_application',
          vendorId,
          vendorName: businessName,
          message: `New vendor logged in: "${businessName}" (${emailLower}).`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem('festivo_admin_notifications', JSON.stringify(notifications));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('Could not enqueue vendor to pending list:', e);
    }

    return true;
  };


  const signup = async (email: string, name: string, business: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signUp({ email, password: 'password123' });
    }
    setIsAuthenticated(true);
    setUser(prev => ({
      ...prev,
      email,
      fullName: name,
      businessName: business,
      username: name.toLowerCase().replace(/\s+/g, '.'),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase() || 'VN',
    }));
    return true;
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem('vendor_is_authenticated');
    localStorage.removeItem('vendor_user_profile');
    localStorage.removeItem('festivo_user');
    localStorage.removeItem('festivo_profile');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  // Vendor submits documents -> status moves to 'pending' for Admin approval
  const submitKycDocuments = (record: Omit<KycDocumentRecord, 'submittedAt'>) => {
    const submittedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const fullRecord: KycDocumentRecord = {
      ...record,
      submittedAt: submittedDate,
    };
    setKycRecord(fullRecord);
    setKycStatus('pending');
    localStorage.setItem('vendor_kyc_status', 'pending');
    localStorage.setItem('vendor_kyc_record', JSON.stringify(fullRecord));

    // 1. Add/update the vendor application in `festivo_pending_vendors` for Admin approval
    const localPending = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
    const existingIndex = localPending.findIndex((v: any) => v.details?.email?.toLowerCase() === user.email.toLowerCase());

    const pendingVendor = {
      id: user.id || `VND-${Math.floor(100000 + Math.random() * 900000)}`,
      name: user.businessName,
      category: user.category || 'Photographer',
      location: user.location,
      price_amount: 48250,
      price_label: 'Starting Package',
      price_unit: 'day',
      rating: 4.9,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
      logo: 'AS',
      verified: false,
      badge: 'KYC Submitted',
      badge_color: 'bg-gold-500',
      slug: user.username || 'aarav-photography',
      details: {
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        owner: user.fullName,
        address: user.location,
        serviceAreas: ['Mumbai', 'Udaipur'],
        languages: ['English', 'Hindi'],
        teamSize: '2–5 Members',
        experience: '3–5 Years',
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'KYC Submitted',
        kyc: {
          idNumber: record.govtIdNumber,
          aadhaarFront: record.govtIdFile || '',
          aadhaarBack: record.govtIdFile || '',
          pan: record.govtIdFile || '',
          cancelledCheque: record.bankProofFile || '',
          gst: record.businessRegFile || undefined
        }
      }
    };

    if (existingIndex > -1) {
      const existingVendor = localPending[existingIndex];
      const updatedVendor = {
        ...existingVendor,
        badge: 'KYC Submitted',
        badge_color: 'bg-gold-500',
        details: {
          ...(existingVendor.details || {}),
          status: 'KYC Submitted',
          kyc: {
            idNumber: record.govtIdNumber,
            aadhaarFront: record.govtIdFile || '',
            aadhaarBack: record.govtIdFile || '',
            pan: record.govtIdFile || '',
            cancelledCheque: record.bankProofFile || '',
            gst: record.businessRegFile || undefined
          }
        }
      };
      localPending[existingIndex] = updatedVendor;
    } else {
      localPending.unshift(pendingVendor);
    }
    localStorage.setItem('festivo_pending_vendors', JSON.stringify(localPending));

    // Also sync the specific flag read by tab 3 of AdminDashboard
    localStorage.setItem(`festivo_kyc_status_${user.email.toLowerCase()}`, 'Pending Verification');

    const vendorName = existingIndex > -1 ? localPending[existingIndex].name : user.businessName;
    const vendorCategory = existingIndex > -1 ? localPending[existingIndex].category : (user.category || 'Photographer');
    const vendorId = existingIndex > -1 ? localPending[existingIndex].id : pendingVendor.id;

    // 2. Create Admin Notification
    const notifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
    const newNotif = {
      id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'new_application',
      vendorId: vendorId,
      vendorName: vendorName,
      message: `KYC documents submitted by "${vendorName}" (${vendorCategory}) for review.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('festivo_admin_notifications', JSON.stringify([newNotif, ...notifications]));

    // Dispatch storage event to notify other open tabs
    window.dispatchEvent(new Event('storage'));
  };

  // Admin Portal functions
  const adminApproveKyc = () => {
    setKycStatus('verified');
  };

  const adminRejectKyc = () => {
    setKycStatus('unverified');
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
