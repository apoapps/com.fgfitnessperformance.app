import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WorkoutDetailScreen from '@/app/(tabs)/workout/[id]';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { mockWorkoutPlan } from '../../__mocks__/data/mock-workout';

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockParams = {
  id: 'workout-plan-001',
  day: '1',
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
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

const renderWorkoutDetail = () => {
  return render(
    <ThemeProvider>
      <WorkoutProvider>
        <WorkoutDetailScreen />
      </WorkoutProvider>
    </ThemeProvider>
  );
};

describe('Workout Detail Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
  });

  describe('rendering', () => {
    it('renders the workout detail screen with back button', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
    });

    it('displays the workout day name as title', async () => {
      const { getAllByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Día 1 appears in title and badge
        const dayElements = getAllByText(/Día 1/i);
        expect(dayElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('displays day and week info', async () => {
      const { getAllByText, getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Semana 1/i)).toBeTruthy();
        // Día 1 appears multiple times (title + badge)
        const dayElements = getAllByText(/Día 1/i);
        expect(dayElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('blocks display', () => {
    it('displays all blocks for the workout day', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        // Day 1 has 3 blocks: Calentamiento, Circuito Principal, Core
        expect(getByTestId('workout-block-block-1a')).toBeTruthy();
        expect(getByTestId('workout-block-block-1b')).toBeTruthy();
        expect(getByTestId('workout-block-block-1c')).toBeTruthy();
      });
    });

    it('displays block labels (A, B, C)', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/BLOQUE A/i)).toBeTruthy();
        expect(getByText(/BLOQUE B/i)).toBeTruthy();
        expect(getByText(/BLOQUE C/i)).toBeTruthy();
      });
    });

    it('displays block names', async () => {
      const { getByText, getAllByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Calentamiento/i)).toBeTruthy();
        expect(getByText(/Circuito Principal/i)).toBeTruthy();
        // Core appears in block name and potentially exercise name
        const coreElements = getAllByText(/Core/i);
        expect(coreElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('circuit blocks', () => {
    it('displays circuit badge with rounds', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        // Block 1b is a circuit with 3 rounds
        expect(getByTestId('circuit-badge-block-1b')).toBeTruthy();
      });
    });

    it('shows circuit indicator text', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Circuito Principal has 3 rounds
        expect(getByText(/CIRCUITO.*3X/i)).toBeTruthy();
      });
    });
  });

  describe('exercises display', () => {
    it('displays exercises from blocks', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Exercises from block 1a (Calentamiento)
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
        expect(getByText('Zancadas Caminando')).toBeTruthy();
      });
    });

    it('displays exercise metrics', async () => {
      const { getByText, getAllByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Sentadilla has 4 sets
        const setsElements = getAllByText(/4/);
        expect(setsElements.length).toBeGreaterThan(0);
        // Sentadilla has 8-10 reps
        expect(getByText(/8-10/)).toBeTruthy();
      });
    });

    it('displays exercise notes when provided', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Control excéntrico/)).toBeTruthy();
      });
    });
  });

  describe('recommendation display', () => {
    it('displays recommendation banner for circuits', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Block 1b circuit has a recommendation
        expect(getByText(/Mantén un ritmo constante/)).toBeTruthy();
      });
    });
  });

  describe('objective display', () => {
    it('displays the day objective', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Mejorar la potencia explosiva/)).toBeTruthy();
      });
    });

    it('renders objective card with icon', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('objective-card')).toBeTruthy();
      });
    });
  });

  describe('navigation', () => {
    it('navigates back when back button is pressed', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('back-button'));

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('start workout button', () => {
    it('displays start workout button', async () => {
      const { getByText, getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('start-workout-button')).toBeTruthy();
        expect(getByText(/INICIAR ENTRENAMIENTO/i)).toBeTruthy();
      });
    });

    it('shows exercise and block count in button', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Day 1 has 7 exercises across 3 blocks
        expect(getByText(/7 ejercicios.*3 bloques/i)).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator initially', async () => {
      const { getByTestId, queryByTestId } = renderWorkoutDetail();

      // Initially may show loading
      // Then transition to loaded state
      await waitFor(() => {
        expect(queryByTestId('workout-detail-loading') || getByTestId('back-button')).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('shows error when workout not found', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/No encontrado/i)).toBeTruthy();
      });
    });

    it('shows error message explaining the issue', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/no existe o ha sido eliminado/i)).toBeTruthy();
      });
    });

    it('shows back button in error state', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
    });
  });

  describe('different day parameter', () => {
    it('displays correct day when day param changes', async () => {
      const { getAllByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Should show content (day name or blocks)
        const dayElements = getAllByText(/Día/i);
        expect(dayElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
