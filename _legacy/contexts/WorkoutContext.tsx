import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import type { WorkoutPlan, WorkoutDay, WorkoutWeek } from '@/types/workout';

interface WorkoutContextType {
  workoutPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: string | null;
  currentWeek: number;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  refreshWorkouts: () => Promise<void>;
  getDayForWeek: (weekNumber: number, dayNumber: number) => WorkoutDay | null;
  getDaysForCurrentWeek: () => WorkoutDay[];
  getCurrentDay: () => WorkoutDay | null;
  getTotalDays: () => number;
  getWeekForDay: (dayNumber: number) => WorkoutWeek | null;
  getAllDays: () => WorkoutDay[];
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);

  const fetchWorkouts = useCallback(async () => {
    if (!user?.id) {
      setWorkoutPlan(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query workout_plans table with user_id and is_active
      // Order by created_at DESC and limit to 1 to get the most recent active plan
      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        setError(fetchError.message);
        setWorkoutPlan(null);
      } else if (data && data.length > 0) {
        setWorkoutPlan(data[0] as WorkoutPlan);
      } else {
        setWorkoutPlan(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workouts');
      setWorkoutPlan(null);
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

  // Calculate current week based on start date
  const currentWeek = useMemo<number>(() => {
    if (!workoutPlan?.start_date) {
      return 1;
    }

    const startDate = new Date(workoutPlan.start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    // Clamp to valid week range
    const maxWeeks = workoutPlan.structure.weeks.length;
    return Math.max(1, Math.min(weekNumber, maxWeeks));
  }, [workoutPlan]);

  // Get total number of days across all weeks
  const getTotalDays = useCallback((): number => {
    if (!workoutPlan?.structure?.weeks) return 0;
    return workoutPlan.structure.weeks.reduce((total, week) => total + week.days.length, 0);
  }, [workoutPlan]);

  // Get all days across all weeks (flattened)
  const getAllDays = useCallback((): WorkoutDay[] => {
    if (!workoutPlan?.structure?.weeks) return [];
    return workoutPlan.structure.weeks.flatMap(week => week.days);
  }, [workoutPlan]);

  // Get a specific day from a specific week
  const getDayForWeek = useCallback(
    (weekNumber: number, dayNumber: number): WorkoutDay | null => {
      if (!workoutPlan?.structure?.weeks) return null;

      const week = workoutPlan.structure.weeks.find((w) => w.weekNumber === weekNumber);
      if (!week) return null;

      return week.days.find((d) => d.dayNumber === dayNumber) || null;
    },
    [workoutPlan]
  );

  // Get all days for the current week
  const getDaysForCurrentWeek = useCallback((): WorkoutDay[] => {
    if (!workoutPlan?.structure?.weeks) return [];

    const week = workoutPlan.structure.weeks.find((w) => w.weekNumber === currentWeek);
    return week?.days || [];
  }, [workoutPlan, currentWeek]);

  // Get the currently selected day
  const getCurrentDay = useCallback((): WorkoutDay | null => {
    if (!workoutPlan?.structure?.weeks) return null;

    // Find which week contains the selected day
    let dayCounter = 0;
    for (const week of workoutPlan.structure.weeks) {
      for (const day of week.days) {
        dayCounter++;
        if (dayCounter === selectedDay) {
          return day;
        }
      }
    }

    // Fallback: get first day of first week
    const firstWeek = workoutPlan.structure.weeks[0];
    return firstWeek?.days[0] || null;
  }, [workoutPlan, selectedDay]);

  // Get the week that contains a specific day number (1-indexed across all weeks)
  const getWeekForDay = useCallback(
    (dayNumber: number): WorkoutWeek | null => {
      if (!workoutPlan?.structure?.weeks) return null;

      let dayCounter = 0;
      for (const week of workoutPlan.structure.weeks) {
        for (const _day of week.days) {
          dayCounter++;
          if (dayCounter === dayNumber) {
            return week;
          }
        }
      }

      return null;
    },
    [workoutPlan]
  );

  const value = useMemo<WorkoutContextType>(
    () => ({
      workoutPlan,
      isLoading,
      error,
      currentWeek,
      selectedDay,
      setSelectedDay,
      refreshWorkouts,
      getDayForWeek,
      getDaysForCurrentWeek,
      getCurrentDay,
      getTotalDays,
      getWeekForDay,
      getAllDays,
    }),
    [
      workoutPlan,
      isLoading,
      error,
      currentWeek,
      selectedDay,
      refreshWorkouts,
      getDayForWeek,
      getDaysForCurrentWeek,
      getCurrentDay,
      getTotalDays,
      getWeekForDay,
      getAllDays,
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
