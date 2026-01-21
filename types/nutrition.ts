// Nutrition types for the application
// These match the Supabase schema for assigned_nutrition table

export type NutritionStatus = 'pending' | 'active' | 'completed' | 'paused';

// Macros within nutrition
export interface NutritionMacros {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

// Meal within nutrition structure
export interface NutritionMeal {
  meal_instance_id?: string; // For contextual support
  name: string;
  time: string;
  foods?: string[];
  macros?: Partial<NutritionMacros>;
  image_url?: string;
}

// Nutrition structure JSONB
export interface NutritionStructure {
  macros: NutritionMacros;
  water_target_liters: number;
  meals?: NutritionMeal[];
}

// Document reference
export interface NutritionDocument {
  name: string;
  url: string;
  type?: string;
}

// Assigned nutrition from assigned_nutrition table (legacy)
export interface AssignedNutrition {
  id: string;
  client_id: string;
  template_id: string | null;
  structure: NutritionStructure;
  documents: NutritionDocument[];
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  status: NutritionStatus;
  client_notes: string | null;
  coach_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Nutrition plan from nutrition_plans table (current)
export interface NutritionPlan {
  id: string;
  user_id: string;
  title: string;
  goal?: string;
  macros: NutritionMacros;
  documents: NutritionDocument[];
  water_target_liters: number;
  hydration_notes?: string;
  is_active: boolean;
  created_at: string;
  coach_notes?: string;
}
