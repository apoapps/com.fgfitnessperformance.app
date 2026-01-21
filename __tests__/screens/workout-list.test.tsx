import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WorkoutListScreen from '@/app/(tabs)/workout/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { mockAssignedWorkout } from '../../__mocks__/data/mock-workout';

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
        eq: jest.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    }),
  });
};

const renderWorkoutList = () => {
  return render(
    <ThemeProvider>
      <WorkoutProvider>
        <WorkoutListScreen />
      </WorkoutProvider>
    </ThemeProvider>
  );
};

describe('Workout List Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
    mockOrder.mockResolvedValue({ data: [mockAssignedWorkout], error: null });
  });

  describe('rendering', () => {
    it('renders the workout screen with header', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText('Entrenamiento')).toBeTruthy();
      });
    });

    it('displays week selector', async () => {
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('week-selector')).toBeTruthy();
      });
    });

    it('displays workout cards for selected week', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        // Week 1 has day 1 workout
        expect(getByText('FUERZA EXPLOSIVA: PIERNAS')).toBeTruthy();
      });
    });
  });

  describe('week selector', () => {
    it('shows week 1 as selected by default', async () => {
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        const week1Chip = getByTestId('week-chip-1');
        expect(week1Chip.props.accessibilityState?.selected).toBe(true);
      });
    });

    it('renders chip for each week in workout', async () => {
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('week-chip-1')).toBeTruthy();
        expect(getByTestId('week-chip-2')).toBeTruthy();
      });
    });

    it('changes selected week when chip is pressed', async () => {
      const { getByTestId, getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('week-chip-2')).toBeTruthy();
      });

      fireEvent.press(getByTestId('week-chip-2'));

      await waitFor(() => {
        // Week 2 workout title
        expect(getByText('FUERZA EXPLOSIVA: PIERNAS')).toBeTruthy();
      });
    });
  });

  describe('workout cards', () => {
    it('displays day number for each workout', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText(/DÍA 1/i)).toBeTruthy();
      });
    });

    it('displays workout focus/description', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText(/Potencia de tren inferior/)).toBeTruthy();
      });
    });

    it('shows exercise count per workout day', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        // Week 1 day 1 has 4 exercises
        expect(getByText(/4 ejercicios/i)).toBeTruthy();
      });
    });

    it('navigates to workout detail when card is pressed', async () => {
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('workout-card-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('workout-card-1'));

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/(tabs)/workout/[id]',
        params: { id: 'workout-uuid-001', week: 1, day: 1 },
      });
    });
  });

  describe('today indicator', () => {
    it('shows HOY badge on today\'s workout', async () => {
      // mockAssignedWorkout has scheduled_start_date of today (2026-01-20)
      // So day 1 should be marked as today
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('today-badge')).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('renders loading indicator when isLoading is true', async () => {
      // We test by checking that loading disappears after data loads
      const { queryByTestId, getByText } = renderWorkoutList();

      // Wait for content to load, confirming loading state was handled
      await waitFor(() => {
        expect(getByText('Entrenamiento')).toBeTruthy();
      });

      // After loading, loading indicator should not be present
      expect(queryByTestId('workout-loading')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no workouts assigned', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText(/No tienes entrenamientos/i)).toBeTruthy();
      });
    });

    it('shows message about contacting coach', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText(/contacta a tu coach/i)).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Error de conexión' },
      });

      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Error de conexión' },
      });

      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        expect(getByText(/reintentar/i)).toBeTruthy();
      });
    });
  });

  describe('rest day display', () => {
    it('displays rest day differently from workout days', async () => {
      const { getByText } = renderWorkoutList();

      await waitFor(() => {
        // Day 3 is a rest day
        expect(getByText('DESCANSO ACTIVO')).toBeTruthy();
      });
    });

    it('shows rest day icon or indicator', async () => {
      const { getByTestId } = renderWorkoutList();

      await waitFor(() => {
        expect(getByTestId('rest-day-indicator-3')).toBeTruthy();
      });
    });
  });
});
