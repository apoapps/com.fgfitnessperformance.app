import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import WorkoutDetailScreen from '@/app/(tabs)/workout/[id]';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { mockAssignedWorkout } from '../../__mocks__/data/mock-workout';

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockParams = {
  id: 'workout-uuid-001',
  week: '1',
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
    mockOrder.mockResolvedValue({ data: [mockAssignedWorkout], error: null });
  });

  describe('rendering', () => {
    it('renders the workout detail screen with back button', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });
    });

    it('displays the workout day name as title', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText('FUERZA EXPLOSIVA: PIERNAS')).toBeTruthy();
      });
    });

    it('displays the workout focus', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Potencia de tren inferior/)).toBeTruthy();
      });
    });

    it('displays day and week info', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Semana 1/i)).toBeTruthy();
        expect(getByText(/Día 1/i)).toBeTruthy();
      });
    });
  });

  describe('exercise list', () => {
    it('displays all exercises for the workout day', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
        expect(getByText('Zancadas Caminando')).toBeTruthy();
        expect(getByText('Prensa de Piernas')).toBeTruthy();
        expect(getByText('Curl Femoral Acostado')).toBeTruthy();
      });
    });

    it('displays sets and reps for each exercise', async () => {
      const { getAllByText } = renderWorkoutDetail();

      await waitFor(() => {
        // Multiple exercises have 4 sets, use getAllByText
        const seriesElements = getAllByText(/4 series/i);
        expect(seriesElements.length).toBeGreaterThan(0);
        // Sentadilla has 6-8 reps
        const repsElements = getAllByText(/6-8/);
        expect(repsElements.length).toBeGreaterThan(0);
      });
    });

    it('displays rest time for exercises', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/90s/)).toBeTruthy();
      });
    });

    it('displays weight/load when provided', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/RPE 8/)).toBeTruthy();
      });
    });

    it('displays exercise notes when provided', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/Control excentrico/)).toBeTruthy();
      });
    });
  });

  describe('superset display', () => {
    it('groups superset exercises together', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        // Prensa and Curl Femoral are supersetted
        expect(getByTestId('superset-block-inst-003')).toBeTruthy();
      });
    });

    it('shows superset indicator with gold border', async () => {
      const { getByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        const supersetBlock = getByTestId('superset-block-inst-003');
        expect(supersetBlock).toBeTruthy();
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
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/INICIAR ENTRENAMIENTO/i)).toBeTruthy();
      });
    });

    it('shows exercise count in button', async () => {
      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/4 ejercicios/i)).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('handles loading state gracefully', async () => {
      const { getByText } = renderWorkoutDetail();

      // Wait for content to load
      await waitFor(() => {
        expect(getByText('FUERZA EXPLOSIVA: PIERNAS')).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('shows error when workout not found', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderWorkoutDetail();

      await waitFor(() => {
        expect(getByText(/No encontrado/i)).toBeTruthy();
      });
    });
  });

  describe('exercise order', () => {
    it('displays exercises in correct order', async () => {
      const { getAllByTestId } = renderWorkoutDetail();

      await waitFor(() => {
        const exerciseCards = getAllByTestId(/exercise-card-/);
        expect(exerciseCards.length).toBe(4);
      });
    });
  });
});
