import type { AssignedNutrition, NutritionStructure, NutritionMacros, NutritionPlan } from '@/types/nutrition';

export const mockMacros: NutritionMacros = {
  protein: 180,
  carbs: 250,
  fat: 65,
  calories: 2500,
};

export const mockNutritionStructure: NutritionStructure = {
  macros: mockMacros,
  water_target_liters: 3.0,
  meals: [
    {
      meal_instance_id: 'meal-001',
      name: 'Desayuno Pro-Energia',
      time: '07:00',
      foods: ['Avena con proteina', 'Platano', 'Cafe negro'],
      macros: {
        protein: 40,
        carbs: 60,
        fat: 15,
        calories: 535,
      },
      image_url: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc',
    },
    {
      meal_instance_id: 'meal-002',
      name: 'Media Manana',
      time: '10:00',
      foods: ['Yogurt griego', 'Nueces', 'Miel'],
      macros: {
        protein: 25,
        carbs: 30,
        fat: 12,
        calories: 328,
      },
    },
    {
      meal_instance_id: 'meal-003',
      name: 'Almuerzo Potencia',
      time: '13:00',
      foods: ['Pechuga de pollo 200g', 'Arroz integral', 'Vegetales salteados', 'Aguacate'],
      macros: {
        protein: 50,
        carbs: 70,
        fat: 18,
        calories: 642,
      },
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    },
    {
      meal_instance_id: 'meal-004',
      name: 'Pre-Entreno',
      time: '16:30',
      foods: ['Batido de proteina', 'Banana', 'Mantequilla de almendras'],
      macros: {
        protein: 35,
        carbs: 45,
        fat: 10,
        calories: 410,
      },
    },
    {
      meal_instance_id: 'meal-005',
      name: 'Cena Recuperacion',
      time: '20:00',
      foods: ['Salmon 180g', 'Camote', 'Brocoli al vapor'],
      macros: {
        protein: 30,
        carbs: 45,
        fat: 10,
        calories: 390,
      },
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
    },
  ],
};

export const mockNutritionDocuments = [
  {
    name: 'Guia de Suplementacion',
    url: 'https://example.com/docs/suplementacion.pdf',
    type: 'pdf',
  },
  {
    name: 'Recetas Semana 1',
    url: 'https://example.com/docs/recetas-s1.pdf',
    type: 'pdf',
  },
  {
    name: 'Lista de Compras',
    url: 'https://example.com/docs/lista-compras.pdf',
    type: 'pdf',
  },
];

export const mockAssignedNutrition: AssignedNutrition = {
  id: 'nutrition-uuid-001',
  client_id: 'mock-user-uuid-12345',
  template_id: 'nutrition-template-001',
  structure: mockNutritionStructure,
  documents: mockNutritionDocuments,
  scheduled_start_date: '2026-01-20',
  scheduled_end_date: '2026-02-16',
  status: 'active',
  client_notes: null,
  coach_notes: 'Plan para fase de volumen limpio',
  created_at: '2026-01-18T00:00:00Z',
  updated_at: '2026-01-19T00:00:00Z',
};

export const mockAssignedNutritionEmpty: AssignedNutrition = {
  ...mockAssignedNutrition,
  id: 'nutrition-uuid-empty',
  structure: {
    macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
    water_target_liters: 2.5,
    meals: [],
  },
  documents: [],
  status: 'pending',
};

// New NutritionPlan mock (matches nutrition_plans table)
export const mockNutritionPlan: NutritionPlan = {
  id: 'nutrition-plan-001',
  user_id: 'mock-user-uuid-12345',
  title: 'Plan Volumen Limpio',
  goal: 'Ganar masa muscular manteniendo grasa corporal',
  macros: mockMacros,
  documents: mockNutritionDocuments,
  water_target_liters: 3.0,
  hydration_notes: 'Beber agua cada hora durante el entrenamiento',
  is_active: true,
  created_at: '2026-01-18T00:00:00Z',
  coach_notes: 'Plan para fase de volumen limpio',
};

export const mockNutritionPlanEmpty: NutritionPlan = {
  ...mockNutritionPlan,
  id: 'nutrition-plan-empty',
  title: 'Plan Vacío',
  macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
  documents: [],
  is_active: false,
};

// Helper to calculate macro percentages
export const calculateMacroPercentages = (macros: NutritionMacros) => {
  const proteinCal = macros.protein * 4;
  const carbsCal = macros.carbs * 4;
  const fatCal = macros.fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  return {
    protein: Math.round((proteinCal / total) * 100),
    carbs: Math.round((carbsCal / total) * 100),
    fat: Math.round((fatCal / total) * 100),
    proteinCal,
    carbsCal,
    fatCal,
    total,
  };
};
