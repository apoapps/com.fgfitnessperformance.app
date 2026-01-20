import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { mockProfile, mockProfileInactive, mockProfileTrialing } from '../../__mocks__/data/mock-profile';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

// Mock AuthContext to provide user
const mockUser = { id: 'mock-user-uuid-12345', email: 'apocor.alex@gmail.com' };

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    clearError: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Setup mock chain
const setupMockChain = () => {
  mockFrom.mockReturnValue({
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle,
      }),
    }),
  });
};

// Test consumer component
const TestConsumer = ({ onRefresh }: { onRefresh?: (fn: () => Promise<void>) => void }) => {
  const {
    profile,
    isLoading,
    error,
    subscriptionStatus,
    subscriptionTier,
    displayName,
    avatarUrl,
    refreshProfile,
    hasAccess,
  } = useProfile();

  // Pass refreshProfile to parent for testing
  React.useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshProfile);
    }
  }, [onRefresh, refreshProfile]);

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
      <Text testID="profile">{profile ? JSON.stringify(profile.id) : 'no-profile'}</Text>
      <Text testID="subscriptionStatus">{subscriptionStatus}</Text>
      <Text testID="subscriptionTier">{subscriptionTier || 'no-tier'}</Text>
      <Text testID="displayName">{displayName}</Text>
      <Text testID="avatarUrl">{avatarUrl || 'no-avatar'}</Text>
      <Text testID="hasWorkout">{hasAccess('workout') ? 'true' : 'false'}</Text>
      <Text testID="hasNutrition">{hasAccess('nutrition') ? 'true' : 'false'}</Text>
      <TouchableOpacity testID="refresh" onPress={refreshProfile} />
    </>
  );
};

const renderProfileContext = (onRefresh?: (fn: () => Promise<void>) => void) => {
  return render(
    <ThemeProvider>
      <ProfileProvider>
        <TestConsumer onRefresh={onRefresh} />
      </ProfileProvider>
    </ThemeProvider>
  );
};

describe('ProfileContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
  });

  describe('initial state and loading', () => {
    it('starts with loading true and transitions to loaded', async () => {
      // This test verifies the loading state transitions correctly
      const { getByTestId } = renderProfileContext();

      // After the async operation completes, loading should be false
      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });
    });

    it('has no error initially', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('error').props.children).toBe('no-error');
    });
  });

  describe('loading profile', () => {
    it('fetches profile from Supabase when user is authenticated', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('sets profile data after successful fetch', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockProfile.id));
      });
    });

    it('sets error when fetch fails', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Network error');
      });

      expect(getByTestId('profile').props.children).toBe('no-profile');
    });
  });

  describe('derived state', () => {
    it('derives subscription status from profile', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('subscriptionStatus').props.children).toBe('active');
      });
    });

    it('returns inactive status when profile is null', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('subscriptionStatus').props.children).toBe('inactive');
    });

    it('correctly identifies premium tier', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('subscriptionTier').props.children).toBe('premium');
      });
    });

    it('correctly identifies trialing status', async () => {
      mockSingle.mockResolvedValue({ data: mockProfileTrialing, error: null });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('subscriptionStatus').props.children).toBe('trialing');
        expect(getByTestId('subscriptionTier').props.children).toBe('fitness');
      });
    });

    it('correctly identifies inactive status', async () => {
      mockSingle.mockResolvedValue({ data: mockProfileInactive, error: null });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('subscriptionStatus').props.children).toBe('inactive');
      });
    });

    it('checks if user has access to workout feature', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('hasWorkout').props.children).toBe('true');
        expect(getByTestId('hasNutrition').props.children).toBe('true');
      });
    });

    it('returns false for features not in access_tags', async () => {
      mockSingle.mockResolvedValue({ data: mockProfileInactive, error: null });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('hasWorkout').props.children).toBe('false');
        expect(getByTestId('hasNutrition').props.children).toBe('false');
      });
    });
  });

  describe('refresh profile', () => {
    it('refetches profile when refreshProfile is called', async () => {
      let refreshFn: (() => Promise<void>) | undefined;

      const { getByTestId } = renderProfileContext((fn) => {
        refreshFn = fn;
      });

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Clear the mock to count new calls
      mockFrom.mockClear();
      setupMockChain();
      mockSingle.mockResolvedValue({ data: mockProfile, error: null });

      // Call refresh
      await act(async () => {
        await refreshFn?.();
      });

      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });
  });

  describe('display helpers', () => {
    it('provides displayName from full_name', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('displayName').props.children).toBe('Alex Forge');
      });
    });

    it('falls back to email username when full_name is null', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockProfile, full_name: null },
        error: null,
      });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('displayName').props.children).toBe('apocor.alex');
      });
    });

    it('provides avatar URL', async () => {
      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('avatarUrl').props.children).toBe(mockProfile.avatar_url);
      });
    });

    it('returns no-avatar when profile has no avatar', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockProfile, avatar_url: null },
        error: null,
      });

      const { getByTestId } = renderProfileContext();

      await waitFor(() => {
        expect(getByTestId('avatarUrl').props.children).toBe('no-avatar');
      });
    });
  });
});

describe('useProfile outside provider', () => {
  it('throws error when used outside ProfileProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestThrow = () => {
      useProfile();
      return null;
    };

    expect(() => {
      render(<TestThrow />);
    }).toThrow('useProfile must be used within a ProfileProvider');

    consoleSpy.mockRestore();
  });
});
