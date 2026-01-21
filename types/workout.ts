// Workout types for the application
// These match the Supabase schema for workout_plans table

// Block types for workout structure
export type BlockType = 'straight' | 'circuit';

// Exercise instance within a workout block
export interface BlockExercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  weight?: string;
}

// Block within a workout day (can be straight or circuit)
export interface WorkoutBlock {
  id: string;
  type: BlockType;
  name?: string;
  rounds?: number; // Only for circuit type
  recommendation?: string;
  exercises: BlockExercise[];
}

// Day within a workout week
export interface WorkoutDay {
  dayNumber: number;
  name: string;
  objective?: string;
  blocks: WorkoutBlock[];
}

// Week within a workout structure
export interface WorkoutWeek {
  weekNumber: number;
  name: string;
  days: WorkoutDay[];
}

// Workout structure JSONB
export interface WorkoutStructure {
  weeks: WorkoutWeek[];
}

// Workout plan from workout_plans table
export interface WorkoutPlan {
  id: string;
  user_id: string;
  coach_id?: string;
  title: string;
  goal?: string;
  structure: WorkoutStructure;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
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

// ==========================================
// Legacy types for backwards compatibility
// These are deprecated and will be removed
// ==========================================

/** @deprecated Use BlockExercise instead */
export interface WorkoutExercise {
  exercise_id: string;
  exercise_instance_id?: string;
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

/** @deprecated Use WorkoutDay with blocks instead */
export interface LegacyWorkoutDay {
  day_number: number;
  name: string;
  focus?: string;
  exercises: WorkoutExercise[];
}

/** @deprecated Use WorkoutWeek instead */
export interface LegacyWorkoutWeek {
  week_number: number;
  name?: string;
  days: LegacyWorkoutDay[];
}

export type WorkoutStatus = 'pending' | 'active' | 'completed';

/** @deprecated Use WorkoutPlan instead */
export interface AssignedWorkout {
  id: string;
  client_id: string;
  template_id: string | null;
  structure: {
    weeks: LegacyWorkoutWeek[];
  };
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

export interface WorkoutProgressData {
  completed_workouts?: string[];
  adherence_percentage?: number;
  notes?: Record<string, string>;
}
