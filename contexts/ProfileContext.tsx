import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import type { Profile, SubscriptionStatus } from '@/__mocks__/types/database.types';

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: string | null;
  displayName: string;
  avatarUrl: string | null;
  refreshProfile: () => Promise<void>;
  hasAccess: (feature: string) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: React.ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const subscriptionStatus = useMemo<SubscriptionStatus>(() => {
    return profile?.subscription_status ?? 'inactive';
  }, [profile?.subscription_status]);

  const subscriptionTier = useMemo(() => {
    return profile?.subscription_tier ?? null;
  }, [profile?.subscription_tier]);

  const displayName = useMemo(() => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
    }
    return 'Usuario';
  }, [profile?.full_name, profile?.email]);

  const avatarUrl = useMemo(() => {
    return profile?.avatar_url ?? null;
  }, [profile?.avatar_url]);

  const hasAccess = useCallback(
    (feature: string): boolean => {
      if (!profile?.access_tags) {
        return false;
      }
      return profile.access_tags.includes(feature);
    },
    [profile?.access_tags]
  );

  const value = useMemo<ProfileContextType>(
    () => ({
      profile,
      isLoading,
      error,
      subscriptionStatus,
      subscriptionTier,
      displayName,
      avatarUrl,
      refreshProfile,
      hasAccess,
    }),
    [
      profile,
      isLoading,
      error,
      subscriptionStatus,
      subscriptionTier,
      displayName,
      avatarUrl,
      refreshProfile,
      hasAccess,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
