import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { WorkoutProvider, useWorkout } from '@/contexts/WorkoutContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { mockAssignedWorkout } from '../../__mocks__/data/mock-workout';

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

// Test consumer component
const TestConsumer = () => {
  const {
    workouts,
    activeWorkout,
    isLoading,
    error,
    currentWeek,
    getWorkoutsForWeek,
  } = useWorkout();

  const weekWorkouts = activeWorkout ? getWorkoutsForWeek(1) : [];

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
      <Text testID="workoutsCount">{workouts.length}</Text>
      <Text testID="hasActiveWorkout">{activeWorkout ? 'yes' : 'no'}</Text>
      <Text testID="currentWeek">{currentWeek}</Text>
      <Text testID="weekWorkoutsCount">{weekWorkouts.length}</Text>
      <Text testID="activeWorkoutId">{activeWorkout?.id || 'no-id'}</Text>
    </>
  );
};

const renderWorkoutContext = () => {
  return render(
    <ThemeProvider>
      <WorkoutProvider>
        <TestConsumer />
      </WorkoutProvider>
    </ThemeProvider>
  );
};

describe('WorkoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
    mockOrder.mockResolvedValue({ data: [mockAssignedWorkout], error: null });
  });

  describe('initial state and loading', () => {
    it('starts with loading true and transitions to loaded', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });
    });

    it('has no error initially', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('error').props.children).toBe('no-error');
    });
  });

  describe('loading workouts', () => {
    it('fetches workouts from Supabase when user is authenticated', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(mockFrom).toHaveBeenCalledWith('assigned_workouts');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('client_id', mockUser.id);
    });

    it('sets workouts after successful fetch', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('workoutsCount').props.children).toBe(1);
      });
    });

    it('identifies the active workout', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('hasActiveWorkout').props.children).toBe('yes');
      });
    });

    it('sets error when fetch fails', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Network error');
      });

      expect(getByTestId('workoutsCount').props.children).toBe(0);
    });
  });

  describe('current week calculation', () => {
    it('returns week 1 by default', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Current week should be calculated based on start date
      expect(getByTestId('currentWeek').props.children).toBeGreaterThanOrEqual(1);
    });

    it('returns week 1 when no active workout', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('currentWeek').props.children).toBe(1);
    });
  });

  describe('getWorkoutById', () => {
    it('returns workout by id', async () => {
      const TestGetById = () => {
        const { getWorkoutById, isLoading } = useWorkout();
        const workout = getWorkoutById('workout-uuid-001');
        return (
          <>
            <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
            <Text testID="foundWorkout">{workout?.id || 'not-found'}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <WorkoutProvider>
            <TestGetById />
          </WorkoutProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('foundWorkout').props.children).toBe('workout-uuid-001');
    });

    it('returns not-found for non-existent workout', async () => {
      const TestGetById = () => {
        const { getWorkoutById, isLoading } = useWorkout();
        const workout = getWorkoutById('non-existent-id');
        return (
          <>
            <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
            <Text testID="foundWorkout">{workout?.id || 'not-found'}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <WorkoutProvider>
            <TestGetById />
          </WorkoutProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('foundWorkout').props.children).toBe('not-found');
    });
  });

  describe('getWorkoutsForWeek', () => {
    it('returns workout days for a specific week', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        // Week 1 has 3 days
        expect(getByTestId('weekWorkoutsCount').props.children).toBe(3);
      });
    });
  });

  describe('empty state', () => {
    it('handles no workouts gracefully', async () => {
      mockOrder.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('workoutsCount').props.children).toBe(0);
      expect(getByTestId('hasActiveWorkout').props.children).toBe('no');
    });
  });
});

describe('useWorkout outside provider', () => {
  it('throws error when used outside WorkoutProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestThrow = () => {
      useWorkout();
      return null;
    };

    expect(() => {
      render(<TestThrow />);
    }).toThrow('useWorkout must be used within a WorkoutProvider');

    consoleSpy.mockRestore();
  });
});
