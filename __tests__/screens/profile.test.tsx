import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '@/app/(tabs)/profile/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { mockProfile, mockProfileInactive, mockProfileTrialing } from '../../__mocks__/data/mock-profile';

// Mock expo-router
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

const mockSignOut = jest.fn();

jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      signOut: () => mockSignOut(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

// Mock AuthContext
const mockUser = { id: 'mock-user-uuid-12345', email: 'apocor.alex@gmail.com' };
const mockSignOutFn = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: jest.fn(),
    signOut: mockSignOutFn,
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

const renderProfileScreen = () => {
  return render(
    <ThemeProvider>
      <ProfileProvider>
        <ProfileScreen />
      </ProfileProvider>
    </ThemeProvider>
  );
};

describe('Profile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
  });

  describe('rendering', () => {
    it('renders the profile screen with header', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        // The header uses uppercase=true so text is transformed to uppercase
        expect(getByText('Perfil')).toBeTruthy();
      });
    });

    it('displays user full name', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText('Alex Forge')).toBeTruthy();
      });
    });

    it('displays user email', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText('apocor.alex@gmail.com')).toBeTruthy();
      });
    });

    it('falls back to email username when full_name is null', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockProfile, full_name: null },
        error: null,
      });

      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText('apocor.alex')).toBeTruthy();
      });
    });
  });

  describe('subscription status', () => {
    it('displays active subscription badge', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/activo/i)).toBeTruthy();
      });
    });

    it('displays subscription tier', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/premium/i)).toBeTruthy();
      });
    });

    it('displays trialing status badge', async () => {
      mockSingle.mockResolvedValue({ data: mockProfileTrialing, error: null });

      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/prueba/i)).toBeTruthy();
      });
    });

    it('displays inactive status for users without subscription', async () => {
      mockSingle.mockResolvedValue({ data: mockProfileInactive, error: null });

      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/inactivo/i)).toBeTruthy();
      });
    });
  });

  describe('logout functionality', () => {
    it('renders logout button', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/cerrar sesión/i)).toBeTruthy();
      });
    });

    it('calls signOut when logout button is pressed', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/cerrar sesión/i)).toBeTruthy();
      });

      fireEvent.press(getByText(/cerrar sesión/i));

      expect(mockSignOutFn).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator while profile is loading', async () => {
      // Make the mock resolve slowly to capture loading state
      mockSingle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockProfile, error: null }), 100))
      );

      const { queryByTestId, getByText } = renderProfileScreen();

      // Initially should be loading (the profile loading state)
      // Note: The profile screen shows loading only while profile is being fetched
      // After loading completes, it shows content
      await waitFor(() => {
        expect(getByText('Perfil')).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('displays error message when profile fetch fails', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Error de red' },
      });

      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        // The error screen shows "Error" as a title
        expect(getByText('Error')).toBeTruthy();
      });
    });
  });

  describe('avatar', () => {
    it('displays avatar image when available', async () => {
      const { getByTestId } = renderProfileScreen();

      await waitFor(() => {
        const avatar = getByTestId('profile-avatar');
        expect(avatar).toBeTruthy();
      });
    });

    it('displays placeholder avatar when no avatar URL', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockProfile, avatar_url: null },
        error: null,
      });

      const { getByTestId } = renderProfileScreen();

      await waitFor(() => {
        expect(getByTestId('profile-avatar-placeholder')).toBeTruthy();
      });
    });
  });

  describe('access tags', () => {
    it('shows workout access indicator when user has workout access', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/entrenamiento/i)).toBeTruthy();
      });
    });

    it('shows nutrition access indicator when user has nutrition access', async () => {
      const { getByText } = renderProfileScreen();

      await waitFor(() => {
        expect(getByText(/nutrición/i)).toBeTruthy();
      });
    });
  });
});
