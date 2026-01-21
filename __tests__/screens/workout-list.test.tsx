import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WorkoutScreen from '@/app/(tabs)/workout/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { mockWorkoutPlan } from '../../__mocks__/data/mock-workout';

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
const mockLimit = jest.fn();

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

// Setup mock chain for workout_plans table
const setupMockChain = () => {
  mockLimit.mockResolvedValue({ data: [mockWorkoutPlan], error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
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

const renderWorkoutScreen = () => {
  return render(
    <ThemeProvider>
      <WorkoutProvider>
        <WorkoutScreen />
      </WorkoutProvider>
    </ThemeProvider>
  );
};

describe('Workout Screen (Day-Based UI)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
  });

  describe('rendering', () => {
    it('renders the workout plan title', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText('PROGRAMA FUERZA EXPLOSIVA')).toBeTruthy();
      });
    });

    it('displays day selector', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('day-selector')).toBeTruthy();
      });
    });

    it('displays plan title', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        // Plan title is shown in hero header
        expect(getByText('PROGRAMA FUERZA EXPLOSIVA')).toBeTruthy();
      });
    });
  });

  describe('day selector', () => {
    it('shows day 1 as selected by default', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        const day1Chip = getByTestId('day-chip-1');
        expect(day1Chip.props.accessibilityState?.selected).toBe(true);
      });
    });

    it('renders chips for all 14 days (2 weeks)', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('day-chip-1')).toBeTruthy();
        expect(getByTestId('day-chip-7')).toBeTruthy();
        expect(getByTestId('day-chip-14')).toBeTruthy();
      });
    });

    it('changes selected day when chip is pressed', async () => {
      const { getByTestId, getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('day-chip-2')).toBeTruthy();
      });

      fireEvent.press(getByTestId('day-chip-2'));

      await waitFor(() => {
        // Day 2 should be selected
        const day2Chip = getByTestId('day-chip-2');
        expect(day2Chip.props.accessibilityState?.selected).toBe(true);
      });
    });
  });

  describe('objective card', () => {
    it('displays objective for the selected day', async () => {
      const { getByTestId, getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('objective-card')).toBeTruthy();
      });

      // Day 1 objective
      expect(getByText(/potencia explosiva/i)).toBeTruthy();
    });
  });

  describe('workout blocks', () => {
    it('displays workout blocks for the selected day', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('workout-blocks')).toBeTruthy();
      });
    });

    it('displays block A (Calentamiento) for day 1', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText(/BLOQUE A/)).toBeTruthy();
        expect(getByText(/Calentamiento/i)).toBeTruthy();
      });
    });

    it('displays circuit badge for circuit blocks', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        // Day 1 has a circuit block (block-1b)
        expect(getByTestId('circuit-badge-block-1b')).toBeTruthy();
      });
    });

    it('displays circuit rounds', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        // Day 1 circuit has 3 rounds
        expect(getByText(/CIRCUITO \(3X\)/)).toBeTruthy();
      });
    });
  });

  describe('exercise rows', () => {
    it('displays exercises within blocks', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
      });
    });

    it('displays exercise metrics (sets/reps)', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText(/4 SERIES/)).toBeTruthy();
      });
    });
  });

  describe('recommendation banner', () => {
    it('displays recommendation for circuit blocks', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('recommendation-banner')).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('renders loading indicator initially', async () => {
      const { queryByTestId, getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText('PROGRAMA FUERZA EXPLOSIVA')).toBeTruthy();
      });

      // After loading, loading indicator should not be present
      expect(queryByTestId('workout-loading')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no workout plan assigned', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText(/No tienes entrenamientos/i)).toBeTruthy();
      });
    });

    it('shows message about contacting coach', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText(/contacta a tu coach/i)).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Error de conexión' },
      });

      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
      });
    });

    it('shows retry button on error', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Error de conexión' },
      });

      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByText(/reintentar/i)).toBeTruthy();
      });
    });
  });

  describe('rest day display', () => {
    it('displays rest day content for day 7', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('day-chip-7')).toBeTruthy();
      });

      fireEvent.press(getByTestId('day-chip-7'));

      await waitFor(() => {
        expect(getByTestId('rest-day-content')).toBeTruthy();
      });
    });
  });

  describe('block types', () => {
    it('displays straight blocks differently from circuit blocks', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        // Day 1 has both types
        expect(getByTestId('workout-block-block-1a')).toBeTruthy(); // straight
        expect(getByTestId('workout-block-block-1b')).toBeTruthy(); // circuit
      });
    });
  });

  describe('navigation between days', () => {
    it('updates content when navigating to day 8 (week 2)', async () => {
      const { getByTestId } = renderWorkoutScreen();

      await waitFor(() => {
        expect(getByTestId('day-chip-8')).toBeTruthy();
      });

      fireEvent.press(getByTestId('day-chip-8'));

      // Day 8 should be selected now
      await waitFor(() => {
        const dayChip = getByTestId('day-chip-8');
        expect(dayChip.props.accessibilityState.selected).toBe(true);
      });
    });
  });

  describe('plan goal display', () => {
    it('displays workout plan goal when available', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        // mockWorkoutPlan.goal = 'Potencia y fuerza funcional'
        expect(getByText('Potencia y fuerza funcional')).toBeTruthy();
      });
    });
  });

  describe('exercise rest time', () => {
    it('displays rest time in exercise metrics', async () => {
      const { getAllByText } = renderWorkoutScreen();

      await waitFor(() => {
        // Day 1, Block A, Exercise 1 has rest: 90
        // There may be multiple exercises with 90s rest
        const restTexts = getAllByText(/90s DESC/);
        expect(restTexts.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('exercise weight/RPE', () => {
    it('displays weight when available', async () => {
      const { getByText } = renderWorkoutScreen();

      await waitFor(() => {
        // Day 1, Block A, Exercise 1 has weight: 'RPE 7'
        expect(getByText('RPE 7')).toBeTruthy();
      });
    });
  });
});
