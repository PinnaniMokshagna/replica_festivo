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

    if (data) {
      localStorage.setItem('festivo_profile', JSON.stringify(data));
      const s = await supabase.auth.getSession();
      const currentUser = s?.data?.session?.user;
      if (currentUser) {
        localStorage.setItem('festivo_user', JSON.stringify(currentUser));
        const userFullName = data.full_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '';
        const slug = (userFullName || currentUser.email?.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9]+/g, '.');

        if (data.role === 'vendor' || currentUser.email?.includes('vendor')) {
          // Write MINIMAL identity only — DashboardAuthProvider loads full profile from Supabase
          const existingProfile = (() => {
            try { return JSON.parse(localStorage.getItem('vendor_user_profile') || 'null'); } catch { return null; }
          })();
          const isSameUser = existingProfile && (existingProfile.email || '').toLowerCase().trim() === (currentUser.email || '').toLowerCase().trim();
          const vendorProfile = {
            ...(isSameUser ? existingProfile : {}),
            id: currentUser.id,
            email: (currentUser.email || '').toLowerCase().trim(),
            fullName: userFullName || existingProfile?.fullName || '',
            username: existingProfile?.username || slug,
          };
          localStorage.setItem('vendor_user_profile', JSON.stringify(vendorProfile));
          localStorage.setItem('vendor_is_authenticated', 'true');
        }
        window.dispatchEvent(new Event('storage'));
      }
    }
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
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailLower, password });
      if (data?.session) {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();

        const finalProfile = dbProfile || {
          id: data.session.user.id,
          full_name: data.session.user.user_metadata?.full_name || emailLower.split('@')[0],
          role: role || 'vendor',
          phone: '',
          city: '',
          avatar_url: null
        };

        setSession(data.session);
        setUser(data.session.user);
        setProfile(finalProfile);

        localStorage.setItem('festivo_user', JSON.stringify(data.session.user));
        localStorage.setItem('festivo_profile', JSON.stringify(finalProfile));

        const userFullName = finalProfile.full_name || data.session.user.user_metadata?.full_name || emailLower.split('@')[0];
        const slug = (userFullName || emailLower.split('@')[0]).toLowerCase().replace(/[^a-z0-9]+/g, '.');

        // Write MINIMAL identity only — DashboardAuthProvider.loadUserProfileFromSupabase() fills the rest
        const existingVP = (() => { try { return JSON.parse(localStorage.getItem('vendor_user_profile') || 'null'); } catch { return null; } })();
        const isSameVP = existingVP && (existingVP.email || '').toLowerCase().trim() === emailLower;
        const vendorProfile = {
          ...(isSameVP ? existingVP : {}),
          id: data.session.user.id,
          email: emailLower,
          fullName: userFullName || existingVP?.fullName || '',
          username: existingVP?.username || slug,
        };

        localStorage.setItem('vendor_user_profile', JSON.stringify(vendorProfile));
        localStorage.setItem('vendor_is_authenticated', 'true');

        // --- Ensure vendor row exists in vendor_applications (ignoreDuplicates=true = never overwrites saved data) ---
        if (role === 'vendor' || !role) {
          try {
            await supabase
              .from('vendor_applications')
              .upsert({
                user_id: data.session.user.id,
                email: emailLower,
                owner_name: userFullName,
                status: 'pending',
                updated_at: new Date().toISOString(),
              }, { onConflict: 'email', ignoreDuplicates: true });
          } catch (e) {
            console.warn('Could not create vendor_applications entry:', e);
          }
        }

        window.dispatchEvent(new Event('storage'));
        try {
          const channel = new BroadcastChannel('festivo_auth_channel');
          channel.postMessage({ type: 'AUTH_STATE_CHANGED', user: vendorProfile });
          channel.close();
        } catch (e) {}

        return { error: null };

      }
      if (error && !error.message.toLowerCase().includes('failed to fetch')) {
        return { error: error.message };
      }
    } catch (e) {
      console.warn('Supabase auth network error:', e);
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
      city: registeredVendorData?.location?.split(',')[0]?.trim() || '',
      avatar_url: null,
    };

    // Write MINIMAL vendor identity — DashboardAuthProvider loads the rest from Supabase
    if (isVendor) {
      const existingVendorProfile = (() => {
        try { return JSON.parse(localStorage.getItem('vendor_user_profile') || 'null'); } catch { return null; }
      })();
      const isSameUser = existingVendorProfile && (existingVendorProfile.email || '').toLowerCase().trim() === emailLower;
      const mergedVendorProfile = {
        ...(isSameUser ? existingVendorProfile : {}),
        id: vendorId,
        email: emailLower,
        fullName: finalName || existingVendorProfile?.fullName || '',
        // Only carry forward user-saved fields — never inject fake defaults
        businessName: existingVendorProfile?.businessName || (registeredVendorData?.name || ''),
        category: existingVendorProfile?.category || registeredVendorData?.category || '',
        location: existingVendorProfile?.location || registeredVendorData?.location || '',
        phone: existingVendorProfile?.phone || registeredVendorData?.details?.phone || '',
        username: existingVendorProfile?.username || slug,
      };
      safeSetItem('vendor_user_profile', JSON.stringify(mergedVendorProfile));
      safeSetItem('vendor_is_authenticated', 'true');

      // Upsert to Supabase vendor_applications (ignoreDuplicates = never overwrite saved data)
      try {
        await supabase
          .from('vendor_applications')
          .upsert({
            email: emailLower,
            owner_name: finalName,
            status: 'pending',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email', ignoreDuplicates: true });
      } catch (e) {
        console.warn('Could not upsert vendor to vendor_applications:', e);
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
      phone: null,
      city: null,
      avatar_url: null,
    };

    if (role === 'vendor') {
      const slug = emailPrefix.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const newVendorProfile = {
        id: vendorId,
        email: emailLower,
        fullName: finalName,
        // Do NOT inject fake businessName, category, location, or phone
        // DashboardAuthProvider will load real values from Supabase
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
