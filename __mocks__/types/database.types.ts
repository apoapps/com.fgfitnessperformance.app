// TypeScript types derived from Supabase schema

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'manual_cash'
  | 'trialing'
  | 'inactive';

export type UserStatus = 'pending' | 'stripe' | 'cash' | 'canceled';

export type WorkoutStatus = 'pending' | 'active' | 'completed';

export type NutritionStatus = 'pending' | 'active' | 'completed' | 'paused';

// Profile from profiles table
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_tier: string | null;
  access_tags: string[];
  created_at: string;
  updated_at: string;
  notes: string | null;
  user_status: UserStatus;
  stripe_product_id: string | null;
}

// Exercise from exercise_library table
export interface Exercise {
  id: string;
  name: string;
  name_es: string | null;
  muscle_group: string;
  secondary_muscles: string[];
  equipment: string | null;
  exercise_type: string;
  difficulty: string;
  video_url: string | null;
  thumbnail_url: string | null;
  instructions: string | null;
  tips: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Exercise instance within a workout day
export interface WorkoutExercise {
  exercise_id: string;
  exercise_instance_id?: string; // For contextual support
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
  notes?: string;
  is_superset: boolean;
  superset_with?: string | null;
  order?: number;
}

// Day within a workout week
export interface WorkoutDay {
  day_number: number;
  name: string;
  focus?: string;
  exercises: WorkoutExercise[];
}

// Week within a workout structure
export interface WorkoutWeek {
  week_number: number;
  name?: string;
  days: WorkoutDay[];
}

// Workout structure JSONB
export interface WorkoutStructure {
  weeks: WorkoutWeek[];
}

// Progress data JSONB
export interface WorkoutProgressData {
  completed_workouts?: string[];
  adherence_percentage?: number;
  notes?: Record<string, string>;
}

// Assigned workout from assigned_workouts table
export interface AssignedWorkout {
  id: string;
  client_id: string;
  template_id: string | null;
  structure: WorkoutStructure;
  scheduled_start_date: string | null;
  scheduled_end_date: string | null;
  status: WorkoutStatus;
  client_notes: string | null;
  coach_notes: string | null;
  is_editable_by_client: boolean;
  created_at: string;
  updated_at: string;
  progress_data: WorkoutProgressData;
}

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

// Assigned nutrition from assigned_nutrition table
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

// Check-in from check_ins table
export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  photos: {
    front: string | null;
    side: string | null;
    back: string | null;
  };
  coach_feedback: string | null;
  created_at: string;
}

// Staff client assignment
export interface StaffClientAssignment {
  id: string;
  staff_id: string;
  client_id: string;
  assignment_type: 'workout_coach' | 'nutritionist' | 'both';
  assigned_at: string;
  ends_at: string | null;
  is_active: boolean;
}
