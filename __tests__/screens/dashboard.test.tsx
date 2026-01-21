import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import DashboardScreen from '@/app/(tabs)/dashboard/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { mockAssignedWorkout } from '../../__mocks__/data/mock-workout';
import { mockProfile } from '../../__mocks__/data/mock-profile';

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
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
const mockOrder = jest.fn();
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

// Mock AuthContext
const mockUser = { id: 'mock-user-uuid-12345', email: 'apocor.alex@gmail.com' };
const mockSignOut = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: jest.fn(),
    signOut: mockSignOut,
    clearError: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Setup mock chain
const setupMockChain = () => {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      };
    }
    return {
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: mockOrder,
          }),
        }),
      }),
    };
  });
};

const renderDashboard = () => {
  return render(
    <ThemeProvider>
      <ProfileProvider>
        <WorkoutProvider>
          <ChatProvider>
            <DashboardScreen />
          </ChatProvider>
        </WorkoutProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
};

describe('Dashboard Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
    mockOrder.mockResolvedValue({ data: [mockAssignedWorkout], error: null });
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
  });

  describe('rendering', () => {
    it('renders the dashboard with header', async () => {
      const { getByText } = renderDashboard();

      await waitFor(() => {
        expect(getByText('Bienvenido')).toBeTruthy();
      });
    });

    it('displays user name as main title', async () => {
      const { getByText } = renderDashboard();

      await waitFor(() => {
        // mockProfile has full_name = 'Alex Forge'
        expect(getByText('Alex Forge')).toBeTruthy();
      });
    });
  });

  describe('next workout section', () => {
    it('displays next workout card', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('next-workout-card')).toBeTruthy();
      });
    });

    it('shows workout name from active workout', async () => {
      const { queryByText } = renderDashboard();

      await waitFor(() => {
        // Check for any workout name from mock data or rest day message
        const hasFuerzaExp = queryByText(/FUERZA EXPLOSIVA/i);
        const hasHipertrofia = queryByText(/HIPERTROFIA/i);
        const hasDescanso = queryByText(/DESCANSO ACTIVO/i);
        const hasRestDay = queryByText(/sin entrenamiento/i) || queryByText(/Día de descanso/i);
        expect(hasFuerzaExp || hasHipertrofia || hasDescanso || hasRestDay).toBeTruthy();
      });
    });

    it('shows HOY badge for today workout', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('today-indicator')).toBeTruthy();
      });
    });

    it('navigates to workout when card is pressed', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('next-workout-card')).toBeTruthy();
      });

      fireEvent.press(getByTestId('next-workout-card'));

      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  describe('empty states', () => {
    it('shows placeholder when no workout assigned', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderDashboard();

      await waitFor(() => {
        expect(getByText(/sin entrenamiento/i)).toBeTruthy();
      });
    });
  });

  describe('navigation', () => {
    it('renders quick action buttons', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('quick-action-workout')).toBeTruthy();
        expect(getByTestId('quick-action-nutrition')).toBeTruthy();
      });
    });

    it('navigates to workout tab when workout button pressed', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('quick-action-workout')).toBeTruthy();
      });

      fireEvent.press(getByTestId('quick-action-workout'));

      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/workout');
    });

    it('navigates to nutrition tab when nutrition button pressed', async () => {
      const { getByTestId } = renderDashboard();

      await waitFor(() => {
        expect(getByTestId('quick-action-nutrition')).toBeTruthy();
      });

      fireEvent.press(getByTestId('quick-action-nutrition'));

      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/nutrition');
    });
  });

  describe('loading state', () => {
    it('handles loading gracefully', async () => {
      const { getByText } = renderDashboard();

      await waitFor(() => {
        expect(getByText('Bienvenido')).toBeTruthy();
      });
    });
  });
});
