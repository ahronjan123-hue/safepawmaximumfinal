import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    role?: string;
  };
}

export interface Session {
  user: User;
  access_token: string;
  expires_at?: number;
}

import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
  businessName?: string;
  isVerified?: boolean;
  vetStatus?: 'pending' | 'approved' | 'rejected';
  licenseNumber?: string;
  clinicId?: string;
  clinicName?: string;
  specialization?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isConfigured: boolean;
  signInWithGoogle: (
    role: UserRole,
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (
    emailOrPhone: string,
    password: string,
    role?: UserRole,
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    emailOrPhone: string,
    password: string,
    role: UserRole,
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  switchRole: (
    newRole: UserRole,
    vetDetails?: Partial<UserProfile>
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (
    role: UserRole | 'pending_vet',
    vetId?: string,
    providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter'
  ) => void;
  approvePendingVet: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  completeOAuthFromCallbackUrl: (urlOrHash: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  USER: 'safepaw_auth_user_v6',
  SESSION: 'safepaw_auth_session_v6',
  PROFILE: 'safepaw_auth_profile_v6',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = true;

  // Restore session from localStorage on initialization
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      const savedSessionStr = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION);
      const savedProfileStr = localStorage.getItem(AUTH_STORAGE_KEYS.PROFILE);

      if (savedUserStr && savedProfileStr) {
        const parsedUser = JSON.parse(savedUserStr);
        const parsedProfile: UserProfile = JSON.parse(savedProfileStr);
        const parsedSession = savedSessionStr ? JSON.parse(savedSessionStr) : null;

        setUser(parsedUser);
        setProfile(parsedProfile);
        setSession(parsedSession || { user: parsedUser, access_token: 'local_token' });
      }
    } catch (e) {
      console.warn('[SafePaw Auth] Error restoring local session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthState = useCallback((u: User | null, s: Session | null, p: UserProfile | null) => {
    setUser(u);
    setSession(s);
    setProfile(p);

    if (typeof window !== 'undefined') {
      try {
        if (u && p) {
          localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(u));
          localStorage.setItem(AUTH_STORAGE_KEYS.SESSION, JSON.stringify(s || { user: u, access_token: 'local_token' }));
          localStorage.setItem(AUTH_STORAGE_KEYS.PROFILE, JSON.stringify(p));
          localStorage.setItem('safepaw_role_v5_live', p.role);
          localStorage.removeItem('safepaw_intended_role');
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION);
          localStorage.removeItem(AUTH_STORAGE_KEYS.PROFILE);
          localStorage.removeItem('safepaw_intended_role');
          localStorage.removeItem('safepaw_intended_metadata');
        }
      } catch (err) {
        console.warn('[SafePaw Auth] Storage save warning:', err);
      }
    }
  }, []);

  // Sign In with Google
  const signInWithGoogle = async (
    role: UserRole,
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    const isPetOwner = role === 'pet_owner';
    const isVet = role === 'veterinarian';
    const isShelter = role === 'shelter_rescuer';
    const effectiveRole: UserRole = role;

    const defaultName = isPetOwner
      ? (extraData?.fullName || 'Sophia Rodriguez')
      : isVet
      ? (extraData?.fullName || 'Dr. Christian David, DVM')
      : isShelter
      ? (extraData?.fullName || 'Elena Gomez (PawHaven Rescue)')
      : (extraData?.fullName || 'Greenwood Care Management');

    const defaultEmail = isPetOwner
      ? 'sophia.rodriguez@example.com'
      : isVet
      ? 'dr.christian.david@greenwoodvet.ph'
      : isShelter
      ? 'director@pawhavenrescue.org'
      : 'management@greenwoodvet.ph';

    const userId = `usr-google-${Date.now().toString(36)}`;
    const mockUser: User = {
      id: userId,
      email: defaultEmail,
      user_metadata: {
        full_name: defaultName,
        name: defaultName,
        avatar_url: isPetOwner
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
          : isShelter
          ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
        role: effectiveRole,
      },
    };

    const newProfile: UserProfile = {
      id: userId,
      email: defaultEmail,
      fullName: defaultName,
      avatarUrl: mockUser.user_metadata?.avatar_url,
      role: effectiveRole,
      providerType: isPetOwner ? undefined : isShelter ? 'rescue_shelter' : (extraData?.providerType || 'veterinary_clinic'),
      businessName: isPetOwner ? undefined : isShelter ? 'PawHaven Animal Rescue Alliance & Sanctuary' : (extraData?.businessName || extraData?.clinicName || 'Greenwood Animal Hospital & Wellness Center'),
      isVerified: true,
      vetStatus: isVet ? 'approved' : undefined,
      licenseNumber: isVet ? (extraData?.licenseNumber || 'PRC-VET-0049182') : undefined,
      clinicId: extraData?.clinicId || (isPetOwner ? undefined : isShelter ? 'shelter-01' : '00000000-0000-0000-0000-000000000001'),
      clinicName: extraData?.clinicName || (isPetOwner ? undefined : isShelter ? 'PawHaven Animal Rescue Alliance' : 'Greenwood Animal Hospital & Wellness Center'),
      specialization: extraData?.specialization || (isVet ? 'Companion Animal Internal Medicine' : undefined),
      bio: isPetOwner
        ? 'Loving pet parent dedicated to optimal preventive care.'
        : isShelter
        ? 'Community rescue and foster alliance promoting ethical adoptions.'
        : 'Certified veterinary clinician providing modern compassionate care.',
      phone: '+63 917 555 0192',
      createdAt: new Date().toISOString(),
    };

    const sessionObj: Session = {
      user: mockUser,
      access_token: `token_${userId}`,
      expires_at: Date.now() + 86400000,
    };

    saveAuthState(mockUser, sessionObj, newProfile);
    return { success: true };
  };

  // Sign In with Email & Password or Phone
  const signInWithEmail = async (
    emailOrPhone: string,
    _password: string,
    role: UserRole = 'pet_owner',
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    const isPetOwner = role === 'pet_owner';
    const isVet = role === 'veterinarian';
    const isShelter = role === 'shelter_rescuer';
    const effectiveRole: UserRole = role;

    const isPhone = !emailOrPhone.includes('@') && /\d/.test(emailOrPhone);
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const cleanEmail = isPhone ? `${cleanIdentifier.replace(/[^0-9]/g, '')}@safepaw.user` : cleanIdentifier;
    const displayName = extraData?.fullName || (isPhone ? `Pet Parent (${cleanIdentifier})` : (cleanEmail.split('@')[0] ? cleanEmail.split('@')[0].replace(/[._]/g, ' ') : 'User'));
    const capitalName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const userId = `usr-${cleanIdentifier.replace(/[^a-z0-9]/g, '') || Date.now().toString(36)}`;
    const mockUser: User = {
      id: userId,
      email: cleanEmail,
      user_metadata: {
        full_name: capitalName,
        name: capitalName,
        role: effectiveRole,
      },
    };

    const newProfile: UserProfile = {
      id: userId,
      email: cleanEmail,
      fullName: capitalName,
      avatarUrl: isPetOwner
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
        : isShelter
        ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      role: effectiveRole,
      providerType: isPetOwner ? undefined : isShelter ? 'rescue_shelter' : (extraData?.providerType || 'veterinary_clinic'),
      businessName: isPetOwner ? undefined : isShelter ? 'PawHaven Animal Rescue Alliance & Sanctuary' : (extraData?.businessName || extraData?.clinicName || 'Greenwood Animal Hospital & Wellness Center'),
      isVerified: true,
      vetStatus: isVet ? 'approved' : undefined,
      licenseNumber: isVet ? (extraData?.licenseNumber || 'PRC-VET-0049182') : undefined,
      clinicId: extraData?.clinicId || (isPetOwner ? undefined : isShelter ? 'shelter-01' : '00000000-0000-0000-0000-000000000001'),
      clinicName: extraData?.clinicName || (isPetOwner ? undefined : isShelter ? 'PawHaven Animal Rescue Alliance' : 'Greenwood Animal Hospital & Wellness Center'),
      specialization: extraData?.specialization || (isVet ? 'Clinical Veterinary Medicine' : undefined),
      bio: isPetOwner ? 'Pet guardian account.' : isShelter ? 'Shelter & rescue operations coordinator.' : 'Professional animal care services.',
      phone: isPhone ? cleanIdentifier : '+63 917 555 0192',
      createdAt: new Date().toISOString(),
    };

    const sessionObj: Session = {
      user: mockUser,
      access_token: `token_${userId}`,
      expires_at: Date.now() + 86400000,
    };

    saveAuthState(mockUser, sessionObj, newProfile);
    return { success: true };
  };

  // Sign Up with Email
  const signUpWithEmail = async (
    emailOrPhone: string,
    password: string,
    role: UserRole,
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
      providerType?: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter';
      businessName?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    return signInWithEmail(emailOrPhone, password, role, extraData);
  };

  // Switch Role
  const switchRole = async (
    newRole: UserRole,
    vetDetails?: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'No active user session.' };

    const updatedProfile: UserProfile = {
      ...profile,
      role: newRole,
      ...(newRole === 'pet_owner'
        ? {
            providerType: undefined,
            vetStatus: undefined,
          }
        : newRole === 'shelter_rescuer'
        ? {
            providerType: 'rescue_shelter',
            businessName: 'PawHaven Animal Rescue Alliance & Sanctuary',
            isVerified: true,
          }
        : {
            providerType: vetDetails?.providerType || profile.providerType || 'veterinary_clinic',
            businessName: vetDetails?.businessName || profile.businessName || 'Greenwood Animal Hospital & Wellness Center',
            licenseNumber: vetDetails?.licenseNumber || profile.licenseNumber || 'PRC-VET-0049182',
            clinicId: vetDetails?.clinicId || profile.clinicId || '00000000-0000-0000-0000-000000000001',
            clinicName: vetDetails?.clinicName || profile.clinicName || 'Greenwood Animal Hospital & Wellness Center',
            specialization: vetDetails?.specialization || profile.specialization || 'Clinical Veterinary Medicine',
            vetStatus: 'approved',
          }),
      ...vetDetails,
      updatedAt: new Date().toISOString(),
    };

    const updatedUser: User = {
      ...user!,
      user_metadata: {
        ...user?.user_metadata,
        role: newRole,
      },
    };

    saveAuthState(updatedUser, session, updatedProfile);
    return { success: true };
  };

  // 1-Click Demo Login
  const loginAsDemoUser = (
    role: UserRole | 'pending_vet',
    _vetId?: string,
    providerType: 'veterinary_clinic' | 'grooming_salon' | 'rescue_shelter' | 'animal_shelter' = 'veterinary_clinic'
  ) => {
    if (role === 'pet_owner') {
      const demoUser: User = {
        id: 'usr-pet-owner-01',
        email: 'sophia.rodriguez@example.com',
        user_metadata: {
          full_name: 'Sophia Rodriguez',
          name: 'Sophia Rodriguez',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          role: 'pet_owner',
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        email: demoUser.email!,
        fullName: 'Sophia Rodriguez',
        avatarUrl: demoUser.user_metadata?.avatar_url,
        role: 'pet_owner',
        isVerified: true,
        phone: '+63 917 555 0192',
        bio: 'Pet parent to Buddy and Luna. Committed to preventive health and routine care.',
        createdAt: new Date().toISOString(),
      };

      saveAuthState(demoUser, { user: demoUser, access_token: 'token_pet_owner' }, demoProfile);
    } else if (role === 'service_provider') {
      const bName =
        providerType === 'veterinary_clinic'
          ? 'Greenwood Animal Hospital & Wellness Center'
          : providerType === 'grooming_salon'
          ? 'Paws & Bubbles Pet Luxury Spa & Grooming'
          : providerType === 'rescue_shelter'
          ? 'PawHaven Animal Rescue Alliance'
          : 'Metro Manila Municipal Animal Care Shelter';

      const demoUser: User = {
        id: 'usr-provider-01',
        email: 'provider.admin@greenwoodvet.ph',
        user_metadata: {
          full_name: 'Greenwood Care Management',
          name: 'Greenwood Care Management',
          avatar_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80',
          role: 'service_provider',
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        email: demoUser.email!,
        fullName: 'Greenwood Care Management',
        avatarUrl: demoUser.user_metadata?.avatar_url,
        role: 'service_provider',
        providerType,
        businessName: bName,
        isVerified: true,
        clinicId: '00000000-0000-0000-0000-000000000001',
        clinicName: bName,
        phone: '+63 2 8824 9912',
        bio: 'Comprehensive veterinary and pet wellness facility equipped with modern diagnostics.',
        createdAt: new Date().toISOString(),
      };

      saveAuthState(demoUser, { user: demoUser, access_token: 'token_provider' }, demoProfile);
    } else if (role === 'shelter_rescuer') {
      const demoUser: User = {
        id: 'usr-shelter-01',
        email: 'director@pawhavenrescue.org',
        user_metadata: {
          full_name: 'Elena Gomez (PawHaven Rescue)',
          name: 'Elena Gomez',
          avatar_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
          role: 'shelter_rescuer',
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        email: demoUser.email!,
        fullName: 'Elena Gomez (PawHaven Rescue Alliance)',
        avatarUrl: demoUser.user_metadata?.avatar_url,
        role: 'shelter_rescuer',
        providerType: 'rescue_shelter',
        businessName: 'PawHaven Animal Rescue Alliance & Sanctuary',
        isVerified: true,
        phone: '+63 928 889 4412',
        clinicName: 'PawHaven Animal Rescue Alliance',
        bio: 'Dedicated non-profit sanctuary providing shelter intake, medical rehabilitation, foster networks, and ethical pet adoption.',
        createdAt: new Date().toISOString(),
      };

      saveAuthState(demoUser, { user: demoUser, access_token: 'token_shelter' }, demoProfile);
    } else if (role === 'pending_vet') {
      const demoUser: User = {
        id: 'usr-vet-pending-01',
        email: 'dr.marcus.vance@example.com',
        user_metadata: {
          full_name: 'Dr. Marcus Vance, DVM',
          role: 'veterinarian',
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        email: demoUser.email!,
        fullName: 'Dr. Marcus Vance, DVM',
        role: 'veterinarian',
        providerType: 'veterinary_clinic',
        businessName: 'Greenwood Animal Hospital & Wellness Center',
        licenseNumber: 'PRC-VET-PENDING-99',
        clinicId: '00000000-0000-0000-0000-000000000001',
        clinicName: 'Greenwood Animal Hospital & Wellness Center',
        specialization: 'Equine & Companion Surgery',
        vetStatus: 'pending',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      saveAuthState(demoUser, { user: demoUser, access_token: 'token_pending' }, demoProfile);
    } else {
      // Approved Veterinarian
      const demoUser: User = {
        id: 'usr-vet-approved-01',
        email: 'dr.christian.david@greenwoodvet.ph',
        user_metadata: {
          full_name: 'Dr. Christian David, DVM',
          name: 'Dr. Christian David, DVM',
          avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
          role: 'veterinarian',
        },
      };

      const demoProfile: UserProfile = {
        id: demoUser.id,
        email: demoUser.email!,
        fullName: 'Dr. Christian David, DVM',
        avatarUrl: demoUser.user_metadata?.avatar_url,
        role: 'veterinarian',
        providerType: 'veterinary_clinic',
        businessName: 'Greenwood Animal Hospital & Wellness Center',
        licenseNumber: 'PRC-VET-0049182',
        clinicId: '00000000-0000-0000-0000-000000000001',
        clinicName: 'Greenwood Animal Hospital & Wellness Center',
        specialization: 'Internal Medicine & Ultrasound',
        vetStatus: 'approved',
        isVerified: true,
        phone: '+63 917 834 9210',
        bio: 'Attending Clinical Veterinarian with 10+ years in companion animal care and soft tissue surgery.',
        createdAt: new Date().toISOString(),
      };

      saveAuthState(demoUser, { user: demoUser, access_token: 'token_approved_vet' }, demoProfile);
    }
  };

  const approvePendingVet = () => {
    if (profile && profile.role === 'veterinarian') {
      const updated: UserProfile = { ...profile, vetStatus: 'approved', isVerified: true };
      saveAuthState(user, session, updated);
    }
  };

  const signOut = async () => {
    saveAuthState(null, null, null);
  };

  const refreshProfile = async () => {
    // Already in sync locally
  };

  const updateProfileDetails = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'No active profile.' };

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveAuthState(user, session, updatedProfile);
    return { success: true };
  };

  const completeOAuthFromCallbackUrl = async (_urlOrHash: string): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        authError,
        setAuthError,
        isConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        switchRole,
        loginAsDemoUser,
        approvePendingVet,
        signOut,
        refreshProfile,
        updateProfileDetails,
        completeOAuthFromCallbackUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
