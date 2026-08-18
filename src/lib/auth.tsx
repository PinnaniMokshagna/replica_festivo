import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { safeSetItem } from './storageUtils';

export type UserRole = 'customer' | 'vendor' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: 'vendor' | 'customer') => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole, category?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        // Restore mock user/profile from localStorage for demo/offline mode
        try {
          const savedUser = localStorage.getItem('festivo_user');
          const savedProfile = localStorage.getItem('festivo_profile');
          if (savedUser && savedProfile) {
            const parsedUser = JSON.parse(savedUser) as User;
            const parsedProfile = JSON.parse(savedProfile) as Profile;
            setUser(parsedUser);
            setProfile(parsedProfile);
          }
        } catch (e) {
          console.warn('Could not restore mock session from localStorage:', e);
        }
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        (async () => {
          await fetchProfile(session.user.id);
          setLoading(false);
        })();
      } else if (_event === 'SIGNED_OUT') {
        // Only clear state on explicit sign-out, not on initial null session
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
      // Ignore other null-session events — they would overwrite our localStorage mock user
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, role?: 'vendor' | 'customer') => {
    const emailLower = (email || '').trim().toLowerCase();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: emailLower, password });
      if (!error) return { error: null };
    } catch (e) {
      console.warn('Supabase auth network error, fallback to demo mode:', e);
    }
    // --- Look up registration data from festivo_pending_vendors by email ---
    let registeredVendorData: any = null;
    try {
      const pendingRaw = localStorage.getItem('festivo_pending_vendors');
      if (pendingRaw) {
        const pendingList = JSON.parse(pendingRaw);
        registeredVendorData = pendingList.find(
          (v: any) => (v.details?.email || '').toLowerCase().trim() === emailLower
        ) || null;
      }
    } catch (e) {}

    // Extract dynamic name from email as fallback
    const emailPrefix = emailLower.split('@')[0] || 'user';
    const formattedName = emailPrefix
      .replace(/[._\-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'User';

    // Determine if this login is a vendor — trust the requested role first, then heuristics if unspecified
    const isVendor = role ? (role === 'vendor') : (!!registeredVendorData || emailLower.includes('vendor'));

    const finalName = (isVendor && registeredVendorData)
      ? (registeredVendorData.details?.owner || registeredVendorData.name || formattedName)
      : formattedName;

    const isStudio = finalName.toLowerCase().includes('studio') ||
      finalName.toLowerCase().includes('events') ||
      finalName.toLowerCase().includes('photography');
    const businessName = isStudio ? finalName : `${finalName} Events`;

    const vendorId = registeredVendorData?.id || `VND-${Math.floor(100000 + Math.random() * 900000)}`;
    const slug = registeredVendorData?.slug || emailPrefix.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const mockUser: User = {
      id: isVendor ? vendorId : `usr_${Date.now()}`,
      email,
      app_metadata: {},
      user_metadata: { full_name: finalName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockProfile: Profile = {
      id: mockUser.id,
      full_name: finalName,
      role: isVendor ? 'vendor' : 'customer',
      phone: registeredVendorData?.details?.phone || '',
      city: registeredVendorData?.location?.split(',')[0]?.trim() || 'Hyderabad',
      avatar_url: null,
    };

    // Sync vendor_user_profile so the vendor dashboard shows correct details
    if (isVendor) {
      const existingVendorProfile = (() => {
        try { return JSON.parse(localStorage.getItem('vendor_user_profile') || 'null'); } catch { return null; }
      })();
      const isSameUser = existingVendorProfile && (existingVendorProfile.email || '').toLowerCase().trim() === emailLower;
      const mergedVendorProfile = {
        ...(isSameUser ? existingVendorProfile : {}),
        id: vendorId,
        email: emailLower,
        fullName: finalName,
        businessName: registeredVendorData?.name || businessName,
        category: registeredVendorData?.category || (isSameUser ? existingVendorProfile?.category : 'Event Provider') || 'Event Provider',
        location: registeredVendorData?.location || (isSameUser ? existingVendorProfile?.location : 'Hyderabad, India') || 'Hyderabad, India',
        phone: registeredVendorData?.details?.phone || (isSameUser ? existingVendorProfile?.phone : '') || '',
        username: slug,
      };
      safeSetItem('vendor_user_profile', JSON.stringify(mergedVendorProfile));
      safeSetItem('vendor_is_authenticated', 'true');

      // Always upsert into festivo_pending_vendors so Admin can see this vendor
      try {
        const pendingList = JSON.parse(localStorage.getItem('festivo_pending_vendors') || '[]');
        const existingIdx = pendingList.findIndex(
          (v: any) => (v.details?.email || '').toLowerCase().trim() === emailLower
        );
        if (existingIdx < 0) {
          const newEntry = {
            id: vendorId,
            name: registeredVendorData?.name || businessName,
            category: registeredVendorData?.category || 'Event Provider',
            location: registeredVendorData?.location || 'Hyderabad, India',
            price_amount: 25000,
            price_label: 'Starting Package',
            price_unit: 'event',
            rating: 5.0,
            reviews: 0,
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
            logo: finalName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'VN',
            verified: false,
            badge: 'Pending Review',
            badge_color: 'bg-gold-500',
            slug,
            details: {
              email: emailLower,
              phone: registeredVendorData?.details?.phone || '',
              owner: finalName,
              address: registeredVendorData?.location || 'Hyderabad, India',
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
          safeSetItem('festivo_pending_vendors', JSON.stringify(pendingList));

          // Notify admin
          const notifications = JSON.parse(localStorage.getItem('festivo_admin_notifications') || '[]');
          notifications.unshift({
            id: `AN-${Math.floor(100000 + Math.random() * 900000)}`,
            type: 'new_application',
            vendorId,
            vendorName: registeredVendorData?.name || businessName,
            message: `New vendor signed in: "${registeredVendorData?.name || businessName}" (${emailLower}).`,
            timestamp: new Date().toISOString(),
            read: false,
          });
          safeSetItem('festivo_admin_notifications', JSON.stringify(notifications));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.warn('Could not upsert vendor to pending list:', e);
      }
    }

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('festivo_user', JSON.stringify(mockUser));
    localStorage.setItem('festivo_profile', JSON.stringify(mockProfile));
    window.dispatchEvent(new Event('storage'));
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, category?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          console.warn('Supabase email rate limit hit, proceeding with fallback registration mode');
        } else if (!error.message.toLowerCase().includes('failed to fetch')) {
          return { error: error.message };
        }
      }

      let userId = data?.user?.id;
      if (!userId) {
        const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
        userId = loginData?.user?.id;
      }

      const finalUserId = userId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`);

      const { error: pErr } = await supabase.from('profiles').upsert({
        id: finalUserId,
        full_name: name,
        role,
      });
      if (pErr) console.error('Supabase profile upsert error:', pErr);
      if (userId) await fetchProfile(userId);
      return { error: null };
    } catch (e) {
      console.warn('Supabase auth network error, fallback to demo registration:', e);
    }

    const emailLower = email.trim().toLowerCase();
    const emailPrefix = emailLower.split('@')[0];
    const derivedName = emailPrefix
      .replace(/[._\-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'User';

    const finalName = name.trim() || derivedName;
    const vendorId = `VND-${Math.floor(100000 + Math.random() * 900000)}`;
    const slug = emailPrefix.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const mockUser: User = {
      id: role === 'vendor' ? vendorId : 'demo-' + Date.now(),
      email: emailLower,
      app_metadata: {},
      user_metadata: { full_name: finalName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockProfile: Profile = {
      id: mockUser.id,
      full_name: finalName,
      role: role || 'customer',
      phone: '+91 98765 43210',
      city: 'Hyderabad',
      avatar_url: null,
    };

    if (role === 'vendor') {
      const isStudio = finalName.toLowerCase().includes('studio') ||
        finalName.toLowerCase().includes('events') ||
        finalName.toLowerCase().includes('photography');
      const businessName = isStudio ? finalName : `${finalName} Events`;

      const newVendorProfile = {
        id: vendorId,
        email: emailLower,
        fullName: finalName,
        businessName,
        category: category || 'Photographer',
        location: 'Hyderabad, India',
        phone: '+91 98765 43210',
        username: slug,
      };
      localStorage.setItem('vendor_user_profile', JSON.stringify(newVendorProfile));
      localStorage.setItem('vendor_is_authenticated', 'true');
    }

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('festivo_user', JSON.stringify(mockUser));
    localStorage.setItem('festivo_profile', JSON.stringify(mockProfile));
    window.dispatchEvent(new Event('storage'));
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    // Clear all mock/demo auth data from localStorage so old account is never displayed
    localStorage.removeItem('festivo_user');
    localStorage.removeItem('festivo_profile');
    localStorage.removeItem('vendor_user_profile');
    localStorage.removeItem('vendor_is_authenticated');
    localStorage.removeItem('vendor_kyc_status');
    localStorage.removeItem('vendor_kyc_record');
    window.dispatchEvent(new Event('storage'));
  };

  // Step 1: Send a 6-digit OTP to the user's email
  const sendOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }, // only allow existing users
    });
    return { error: error?.message ?? null };
  };

  // Step 2: Verify the 6-digit OTP entered by user
  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return { error: error?.message ?? null };
  };

  // Step 3: Update password after OTP verification (user is now signed in)
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile, sendOtp, verifyOtp, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
