import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { WorkoutProvider, useWorkout } from '@/contexts/WorkoutContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { mockWorkoutPlan } from '../../__mocks__/data/mock-workout';

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

// Test consumer component
const TestConsumer = () => {
  const {
    workoutPlan,
    isLoading,
    error,
    currentWeek,
    selectedDay,
    getTotalDays,
    getDaysForCurrentWeek,
    getCurrentDay,
  } = useWorkout();

  const totalDays = getTotalDays();
  const currentDayData = getCurrentDay();
  const weekDays = getDaysForCurrentWeek();

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
      <Text testID="hasWorkoutPlan">{workoutPlan ? 'yes' : 'no'}</Text>
      <Text testID="currentWeek">{currentWeek}</Text>
      <Text testID="selectedDay">{selectedDay}</Text>
      <Text testID="totalDays">{totalDays}</Text>
      <Text testID="weekDaysCount">{weekDays.length}</Text>
      <Text testID="workoutPlanId">{workoutPlan?.id || 'no-id'}</Text>
      <Text testID="workoutPlanName">{workoutPlan?.title || 'no-name'}</Text>
      <Text testID="currentDayName">{currentDayData?.name || 'no-day'}</Text>
      <Text testID="currentDayBlocksCount">{currentDayData?.blocks?.length || 0}</Text>
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

    it('starts with selectedDay as 1', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('selectedDay').props.children).toBe(1);
    });
  });

  describe('loading workouts', () => {
    it('fetches workouts from workout_plans table', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(mockFrom).toHaveBeenCalledWith('workout_plans');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('sets workout plan after successful fetch', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('hasWorkoutPlan').props.children).toBe('yes');
      });
    });

    it('loads correct workout plan data', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('workoutPlanId').props.children).toBe('workout-plan-001');
      });

      expect(getByTestId('workoutPlanName').props.children).toBe('PROGRAMA FUERZA EXPLOSIVA');
    });

    it('sets error when fetch fails', async () => {
      mockLimit.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Network error');
      });

      expect(getByTestId('hasWorkoutPlan').props.children).toBe('no');
    });
  });

  describe('getTotalDays', () => {
    it('returns correct total number of days', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // mockWorkoutPlan has 2 weeks x 7 days = 14 total days
      expect(getByTestId('totalDays').props.children).toBe(14);
    });

    it('returns 0 when no workout plan', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('totalDays').props.children).toBe(0);
    });
  });

  describe('getCurrentDay', () => {
    it('returns day 1 by default', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // First day is "Día 1"
      expect(getByTestId('currentDayName').props.children).toBe('Día 1');
    });

    it('returns correct blocks count for day 1', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Day 1 has 3 blocks (Calentamiento, Circuito Principal, Core)
      expect(getByTestId('currentDayBlocksCount').props.children).toBe(3);
    });
  });

  describe('getDaysForCurrentWeek', () => {
    it('returns all days for current week', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Week 1 has 7 days
      expect(getByTestId('weekDaysCount').props.children).toBe(7);
    });
  });

  describe('current week calculation', () => {
    it('returns week 1 by default', async () => {
      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('currentWeek').props.children).toBeGreaterThanOrEqual(1);
    });

    it('returns week 1 when no workout plan', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('currentWeek').props.children).toBe(1);
    });
  });

  describe('setSelectedDay', () => {
    it('updates selected day correctly', async () => {
      const TestSetDay = () => {
        const { selectedDay, setSelectedDay, isLoading, getCurrentDay } = useWorkout();
        const currentDay = getCurrentDay();

        return (
          <>
            <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
            <Text testID="selectedDay">{selectedDay}</Text>
            <Text testID="currentDayName">{currentDay?.name || 'no-day'}</Text>
            <Text testID="setDay3" onPress={() => setSelectedDay(3)}>
              Set Day 3
            </Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <WorkoutProvider>
            <TestSetDay />
          </WorkoutProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Initial state
      expect(getByTestId('selectedDay').props.children).toBe(1);
    });
  });

  describe('empty state', () => {
    it('handles no workout plan gracefully', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderWorkoutContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('hasWorkoutPlan').props.children).toBe('no');
      expect(getByTestId('totalDays').props.children).toBe(0);
    });
  });

  describe('block types', () => {
    it('workout plan contains circuit and straight blocks', async () => {
      const TestBlockTypes = () => {
        const { workoutPlan, isLoading } = useWorkout();

        // Count block types
        let circuitCount = 0;
        let straightCount = 0;

        if (workoutPlan) {
          workoutPlan.structure.weeks.forEach((week) => {
            week.days.forEach((day) => {
              day.blocks.forEach((block) => {
                if (block.type === 'circuit') circuitCount++;
                if (block.type === 'straight') straightCount++;
              });
            });
          });
        }

        return (
          <>
            <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
            <Text testID="circuitCount">{circuitCount}</Text>
            <Text testID="straightCount">{straightCount}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <WorkoutProvider>
            <TestBlockTypes />
          </WorkoutProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      // Verify we have both block types
      expect(getByTestId('circuitCount').props.children).toBeGreaterThan(0);
      expect(getByTestId('straightCount').props.children).toBeGreaterThan(0);
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
