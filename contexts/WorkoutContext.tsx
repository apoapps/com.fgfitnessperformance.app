import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import type { AssignedWorkout, WorkoutDay } from '@/__mocks__/types/database.types';

interface WorkoutContextType {
  workouts: AssignedWorkout[];
  activeWorkout: AssignedWorkout | null;
  isLoading: boolean;
  error: string | null;
  currentWeek: number;
  refreshWorkouts: () => Promise<void>;
  getWorkoutById: (id: string) => AssignedWorkout | undefined;
  getTodayWorkout: () => WorkoutDay | null;
  getWorkoutsForWeek: (weekNumber: number) => WorkoutDay[];
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<AssignedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    if (!user?.id) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('assigned_workouts')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setWorkouts([]);
      } else {
        setWorkouts((data as AssignedWorkout[]) || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const refreshWorkouts = useCallback(async () => {
    await fetchWorkouts();
  }, [fetchWorkouts]);

  // Get the currently active workout (first active one)
  const activeWorkout = useMemo<AssignedWorkout | null>(() => {
    return workouts.find((w) => w.status === 'active') || null;
  }, [workouts]);

  // Calculate current week based on start date
  const currentWeek = useMemo<number>(() => {
    if (!activeWorkout?.scheduled_start_date) {
      return 1;
    }

    const startDate = new Date(activeWorkout.scheduled_start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    // Clamp to valid week range
    const maxWeeks = activeWorkout.structure.weeks.length;
    return Math.max(1, Math.min(weekNumber, maxWeeks));
  }, [activeWorkout]);

  // Get workout by ID
  const getWorkoutById = useCallback(
    (id: string): AssignedWorkout | undefined => {
      return workouts.find((w) => w.id === id);
    },
    [workouts]
  );

  // Get today's workout based on current date and workout schedule
  const getTodayWorkout = useCallback((): WorkoutDay | null => {
    if (!activeWorkout?.scheduled_start_date) {
      return null;
    }

    const startDate = new Date(activeWorkout.scheduled_start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate which week and day we're on
    const weekIndex = Math.floor(diffDays / 7);
    const dayOfWeek = (diffDays % 7) + 1; // 1-indexed day

    const week = activeWorkout.structure.weeks[weekIndex];
    if (!week) {
      return null;
    }

    const dayWorkout = week.days.find((d) => d.day_number === dayOfWeek);
    return dayWorkout || null;
  }, [activeWorkout]);

  // Get all workout days for a specific week
  const getWorkoutsForWeek = useCallback(
    (weekNumber: number): WorkoutDay[] => {
      if (!activeWorkout) {
        return [];
      }

      const week = activeWorkout.structure.weeks.find((w) => w.week_number === weekNumber);
      return week?.days || [];
    },
    [activeWorkout]
  );

  const value = useMemo<WorkoutContextType>(
    () => ({
      workouts,
      activeWorkout,
      isLoading,
      error,
      currentWeek,
      refreshWorkouts,
      getWorkoutById,
      getTodayWorkout,
      getWorkoutsForWeek,
    }),
    [
      workouts,
      activeWorkout,
      isLoading,
      error,
      currentWeek,
      refreshWorkouts,
      getWorkoutById,
      getTodayWorkout,
      getWorkoutsForWeek,
    ]
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
