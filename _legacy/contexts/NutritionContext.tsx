import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import type { NutritionPlan, NutritionMacros, NutritionMeal, NutritionDocument } from '@/types/nutrition';

interface MacroPercentages {
  protein: number;
  carbs: number;
  fat: number;
  proteinCal: number;
  carbsCal: number;
  fatCal: number;
  total: number;
}

interface NutritionContextType {
  activePlan: NutritionPlan | null;
  isLoading: boolean;
  error: string | null;
  macros: NutritionMacros | null;
  meals: NutritionMeal[];
  documents: NutritionDocument[];
  waterTarget: number;
  refreshNutrition: () => Promise<void>;
  getMacroPercentages: () => MacroPercentages;
  getNutritionMealById: (id: string) => NutritionMeal | undefined;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

interface NutritionProviderProps {
  children: React.ReactNode;
}

export function NutritionProvider({ children }: NutritionProviderProps) {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutrition = useCallback(async () => {
    if (!user?.id) {
      setActivePlan(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Query nutrition_plans table with user_id and is_active
      // Order by created_at DESC and limit to 1 to get the most recent active plan
      const { data, error: fetchError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        setError(fetchError.message);
        setActivePlan(null);
      } else if (data && data.length > 0) {
        setActivePlan(data[0] as NutritionPlan);
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nutrition plan');
      setActivePlan(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNutrition();
  }, [fetchNutrition]);

  const refreshNutrition = useCallback(async () => {
    await fetchNutrition();
  }, [fetchNutrition]);

  // Extract macros from active plan (direct column, not inside structure)
  const macros = useMemo<NutritionMacros | null>(() => {
    return activePlan?.macros || null;
  }, [activePlan]);

  // Meals - currently not stored in nutrition_plans table
  // TODO: Add meals table or column when needed
  const meals = useMemo<NutritionMeal[]>(() => {
    return [];
  }, []);

  // Extract documents from active plan
  const documents = useMemo<NutritionDocument[]>(() => {
    return activePlan?.documents || [];
  }, [activePlan]);

  // Extract water target (direct column, not inside structure)
  const waterTarget = useMemo<number>(() => {
    return activePlan?.water_target_liters || 2.5;
  }, [activePlan]);

  // Calculate macro percentages
  const getMacroPercentages = useCallback((): MacroPercentages => {
    if (!macros) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0,
        proteinCal: 0,
        carbsCal: 0,
        fatCal: 0,
        total: 0,
      };
    }

    const proteinCal = macros.protein * 4;
    const carbsCal = macros.carbs * 4;
    const fatCal = macros.fat * 9;
    const total = proteinCal + carbsCal + fatCal;

    if (total === 0) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0,
        proteinCal: 0,
        carbsCal: 0,
        fatCal: 0,
        total: 0,
      };
    }

    return {
      protein: Math.round((proteinCal / total) * 100),
      carbs: Math.round((carbsCal / total) * 100),
      fat: Math.round((fatCal / total) * 100),
      proteinCal,
      carbsCal,
      fatCal,
      total,
    };
  }, [macros]);

  // Get meal by ID
  const getNutritionMealById = useCallback(
    (id: string): NutritionMeal | undefined => {
      return meals.find((m) => m.meal_instance_id === id);
    },
    [meals]
  );

  const value = useMemo<NutritionContextType>(
    () => ({
      activePlan,
      isLoading,
      error,
      macros,
      meals,
      documents,
      waterTarget,
      refreshNutrition,
      getMacroPercentages,
      getNutritionMealById,
    }),
    [
      activePlan,
      isLoading,
      error,
      macros,
      meals,
      documents,
      waterTarget,
      refreshNutrition,
      getMacroPercentages,
      getNutritionMealById,
    ]
  );

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}

export function useNutrition(): NutritionContextType {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}
