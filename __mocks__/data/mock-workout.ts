import type { WorkoutPlan, WorkoutStructure, WorkoutDay, WorkoutBlock } from '@/types/workout';

// Mock workout structure with the new blocks-based format
export const mockWorkoutStructure: WorkoutStructure = {
  weeks: [
    {
      weekNumber: 1,
      name: 'Semana 1 - Fundamentos',
      days: [
        {
          dayNumber: 1,
          name: 'Día 1',
          objective: 'Mejorar la potencia explosiva y la estabilidad del core. Enfoque en técnica y control.',
          blocks: [
            {
              id: 'block-1a',
              type: 'straight',
              name: 'Calentamiento',
              exercises: [
                {
                  id: 'ex-1a-1',
                  exercise_id: 'ex-squat-001',
                  exercise_name: 'Sentadilla con Barra',
                  sets: 4,
                  reps: '8-10',
                  rest: 90,
                  notes: 'Control excéntrico de 3 segundos',
                  weight: 'RPE 7',
                },
                {
                  id: 'ex-1a-2',
                  exercise_id: 'ex-lunge-001',
                  exercise_name: 'Zancadas Caminando',
                  sets: 3,
                  reps: '12 cada pierna',
                  rest: 60,
                  weight: 'Mancuernas 15kg',
                },
              ],
            },
            {
              id: 'block-1b',
              type: 'circuit',
              name: 'Circuito Principal',
              rounds: 3,
              recommendation: 'Mantén un ritmo constante. Descansa 90 segundos entre rondas completas.',
              exercises: [
                {
                  id: 'ex-1b-1',
                  exercise_id: 'ex-swing-001',
                  exercise_name: 'Kettlebell Swings',
                  sets: 1,
                  reps: '15',
                  rest: 0,
                },
                {
                  id: 'ex-1b-2',
                  exercise_id: 'ex-pushup-001',
                  exercise_name: 'Flexiones',
                  sets: 1,
                  reps: '12',
                  rest: 0,
                },
                {
                  id: 'ex-1b-3',
                  exercise_id: 'ex-rope-001',
                  exercise_name: 'Battle Ropes',
                  sets: 1,
                  reps: '45 seg',
                  rest: 90,
                },
              ],
            },
            {
              id: 'block-1c',
              type: 'straight',
              name: 'Core',
              exercises: [
                {
                  id: 'ex-1c-1',
                  exercise_id: 'ex-plank-001',
                  exercise_name: 'Plancha Isométrica',
                  sets: 3,
                  reps: '60s',
                  rest: 30,
                  notes: 'Mantén la posición neutral de la espalda',
                },
                {
                  id: 'ex-1c-2',
                  exercise_id: 'ex-legr-001',
                  exercise_name: 'Elevación de Piernas',
                  sets: 3,
                  reps: '15',
                  rest: 30,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 2,
          name: 'Día 2',
          objective: 'Desarrollo de fuerza en tren superior. Enfoque en press y tirón.',
          blocks: [
            {
              id: 'block-2a',
              type: 'straight',
              name: 'Fuerza Principal',
              exercises: [
                {
                  id: 'ex-2a-1',
                  exercise_id: 'ex-bench-001',
                  exercise_name: 'Press de Banca',
                  sets: 4,
                  reps: '6-8',
                  rest: 90,
                  weight: 'RPE 8',
                },
                {
                  id: 'ex-2a-2',
                  exercise_id: 'ex-row-001',
                  exercise_name: 'Remo con Barra',
                  sets: 4,
                  reps: '8-10',
                  rest: 90,
                  weight: 'RPE 8',
                },
              ],
            },
            {
              id: 'block-2b',
              type: 'straight',
              name: 'Accesorios',
              recommendation: 'Concéntrate en la conexión mente-músculo.',
              exercises: [
                {
                  id: 'ex-2b-1',
                  exercise_id: 'ex-fly-001',
                  exercise_name: 'Aperturas con Mancuernas',
                  sets: 3,
                  reps: '12-15',
                  rest: 60,
                },
                {
                  id: 'ex-2b-2',
                  exercise_id: 'ex-facep-001',
                  exercise_name: 'Face Pull',
                  sets: 3,
                  reps: '15-20',
                  rest: 45,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 3,
          name: 'Día 3',
          objective: 'Descanso activo. Movilidad y recuperación.',
          blocks: [
            {
              id: 'block-3a',
              type: 'straight',
              name: 'Movilidad',
              exercises: [
                {
                  id: 'ex-3a-1',
                  exercise_id: 'ex-mob-001',
                  exercise_name: 'Rutina de Movilidad Completa',
                  sets: 1,
                  reps: '20 min',
                  rest: 0,
                  notes: 'Seguir video de movilidad',
                },
              ],
            },
          ],
        },
        {
          dayNumber: 4,
          name: 'Día 4',
          objective: 'Potencia y explosividad. Trabajo pliométrico.',
          blocks: [
            {
              id: 'block-4a',
              type: 'circuit',
              name: 'Circuito Pliométrico',
              rounds: 4,
              recommendation: 'Explosividad máxima en cada repetición. Calidad sobre cantidad.',
              exercises: [
                {
                  id: 'ex-4a-1',
                  exercise_id: 'ex-boxj-001',
                  exercise_name: 'Box Jumps',
                  sets: 1,
                  reps: '8',
                  rest: 0,
                },
                {
                  id: 'ex-4a-2',
                  exercise_id: 'ex-medball-001',
                  exercise_name: 'Medicine Ball Slams',
                  sets: 1,
                  reps: '10',
                  rest: 0,
                },
                {
                  id: 'ex-4a-3',
                  exercise_id: 'ex-burp-001',
                  exercise_name: 'Burpees',
                  sets: 1,
                  reps: '8',
                  rest: 120,
                },
              ],
            },
            {
              id: 'block-4b',
              type: 'straight',
              name: 'Fuerza Unilateral',
              exercises: [
                {
                  id: 'ex-4b-1',
                  exercise_id: 'ex-splsq-001',
                  exercise_name: 'Split Squat Búlgaro',
                  sets: 3,
                  reps: '10 cada pierna',
                  rest: 60,
                },
                {
                  id: 'ex-4b-2',
                  exercise_id: 'ex-singlerow-001',
                  exercise_name: 'Remo a Una Mano',
                  sets: 3,
                  reps: '12 cada lado',
                  rest: 45,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 5,
          name: 'Día 5',
          objective: 'Hipertrofia. Volumen alto con técnicas de intensidad.',
          blocks: [
            {
              id: 'block-5a',
              type: 'straight',
              name: 'Push',
              exercises: [
                {
                  id: 'ex-5a-1',
                  exercise_id: 'ex-incbench-001',
                  exercise_name: 'Press Inclinado',
                  sets: 4,
                  reps: '10-12',
                  rest: 75,
                },
                {
                  id: 'ex-5a-2',
                  exercise_id: 'ex-dips-001',
                  exercise_name: 'Fondos en Paralelas',
                  sets: 3,
                  reps: '12-15',
                  rest: 60,
                },
              ],
            },
            {
              id: 'block-5b',
              type: 'circuit',
              name: 'Finisher',
              rounds: 2,
              recommendation: 'Máxima intensidad. Esta es tu oportunidad de darlo todo.',
              exercises: [
                {
                  id: 'ex-5b-1',
                  exercise_id: 'ex-tricpp-001',
                  exercise_name: 'Extensión de Tríceps',
                  sets: 1,
                  reps: '15',
                  rest: 0,
                },
                {
                  id: 'ex-5b-2',
                  exercise_id: 'ex-lat-001',
                  exercise_name: 'Elevaciones Laterales',
                  sets: 1,
                  reps: '15',
                  rest: 0,
                },
                {
                  id: 'ex-5b-3',
                  exercise_id: 'ex-reardelt-001',
                  exercise_name: 'Pájaro',
                  sets: 1,
                  reps: '15',
                  rest: 60,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 6,
          name: 'Día 6',
          objective: 'Piernas posterior. Énfasis en isquiotibiales y glúteos.',
          blocks: [
            {
              id: 'block-6a',
              type: 'straight',
              name: 'Fuerza Posterior',
              exercises: [
                {
                  id: 'ex-6a-1',
                  exercise_id: 'ex-rdl-001',
                  exercise_name: 'Peso Muerto Rumano',
                  sets: 4,
                  reps: '8-10',
                  rest: 90,
                  weight: 'RPE 8',
                  notes: 'Pausa de 2s en el estiramiento',
                },
                {
                  id: 'ex-6a-2',
                  exercise_id: 'ex-hipth-001',
                  exercise_name: 'Hip Thrust',
                  sets: 4,
                  reps: '10-12',
                  rest: 75,
                  notes: 'Squeeze máximo arriba',
                },
                {
                  id: 'ex-6a-3',
                  exercise_id: 'ex-legcurl-001',
                  exercise_name: 'Curl Femoral',
                  sets: 3,
                  reps: '12-15',
                  rest: 60,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 7,
          name: 'Día 7',
          objective: 'Descanso completo. Recuperación y preparación.',
          blocks: [],
        },
      ],
    },
    {
      weekNumber: 2,
      name: 'Semana 2 - Progresión',
      days: [
        {
          dayNumber: 1,
          name: 'Día 1',
          objective: 'Aumentar intensidad 5% respecto a semana anterior.',
          blocks: [
            {
              id: 'block-w2-1a',
              type: 'straight',
              name: 'Fuerza',
              exercises: [
                {
                  id: 'ex-w2-1a-1',
                  exercise_id: 'ex-squat-001',
                  exercise_name: 'Sentadilla con Barra',
                  sets: 5,
                  reps: '5',
                  rest: 120,
                  weight: 'RPE 8-9',
                  notes: 'Semana de fuerza - menos reps, más peso',
                },
              ],
            },
            {
              id: 'block-w2-1b',
              type: 'circuit',
              name: 'Circuito Metabólico',
              rounds: 4,
              recommendation: 'Mantén la técnica aunque el peso aumentó.',
              exercises: [
                {
                  id: 'ex-w2-1b-1',
                  exercise_id: 'ex-swing-001',
                  exercise_name: 'Kettlebell Swings',
                  sets: 1,
                  reps: '20',
                  rest: 0,
                },
                {
                  id: 'ex-w2-1b-2',
                  exercise_id: 'ex-gobsq-001',
                  exercise_name: 'Goblet Squat',
                  sets: 1,
                  reps: '15',
                  rest: 90,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 2,
          name: 'Día 2',
          objective: 'Desarrollo de espalda con más volumen.',
          blocks: [
            {
              id: 'block-w2-2a',
              type: 'straight',
              name: 'Tirón',
              exercises: [
                {
                  id: 'ex-w2-2a-1',
                  exercise_id: 'ex-pullup-001',
                  exercise_name: 'Dominadas',
                  sets: 5,
                  reps: '5-6',
                  rest: 90,
                  notes: 'Añade peso si haces 8+ fácil',
                },
                {
                  id: 'ex-w2-2a-2',
                  exercise_id: 'ex-row-001',
                  exercise_name: 'Remo con Barra',
                  sets: 4,
                  reps: '6-8',
                  rest: 90,
                  weight: 'RPE 8-9',
                },
              ],
            },
          ],
        },
        {
          dayNumber: 3,
          name: 'Día 3',
          objective: 'Movilidad enfocada en caderas y hombros.',
          blocks: [
            {
              id: 'block-w2-3a',
              type: 'straight',
              name: 'Movilidad',
              exercises: [
                {
                  id: 'ex-w2-3a-1',
                  exercise_id: 'ex-mob-001',
                  exercise_name: 'Rutina de Movilidad',
                  sets: 1,
                  reps: '25 min',
                  rest: 0,
                  notes: 'Enfoque en caderas y hombros',
                },
              ],
            },
          ],
        },
        {
          dayNumber: 4,
          name: 'Día 4',
          objective: 'Potencia y coordinación.',
          blocks: [
            {
              id: 'block-w2-4a',
              type: 'circuit',
              name: 'Circuito Dinámico',
              rounds: 5,
              recommendation: 'Esta semana añadimos una ronda. Mantén la calidad.',
              exercises: [
                {
                  id: 'ex-w2-4a-1',
                  exercise_id: 'ex-boxj-001',
                  exercise_name: 'Box Jumps',
                  sets: 1,
                  reps: '10',
                  rest: 0,
                },
                {
                  id: 'ex-w2-4a-2',
                  exercise_id: 'ex-clapp-001',
                  exercise_name: 'Clap Push-ups',
                  sets: 1,
                  reps: '8',
                  rest: 90,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 5,
          name: 'Día 5',
          objective: 'Hombros y brazos con técnicas avanzadas.',
          blocks: [
            {
              id: 'block-w2-5a',
              type: 'straight',
              name: 'Hombros',
              exercises: [
                {
                  id: 'ex-w2-5a-1',
                  exercise_id: 'ex-ohpress-001',
                  exercise_name: 'Press Militar',
                  sets: 5,
                  reps: '5',
                  rest: 120,
                  weight: 'RPE 8-9',
                },
              ],
            },
            {
              id: 'block-w2-5b',
              type: 'circuit',
              name: 'Brazos Finisher',
              rounds: 3,
              recommendation: 'Drop set en la última ronda si puedes.',
              exercises: [
                {
                  id: 'ex-w2-5b-1',
                  exercise_id: 'ex-curl-001',
                  exercise_name: 'Curl con Barra',
                  sets: 1,
                  reps: '12',
                  rest: 0,
                },
                {
                  id: 'ex-w2-5b-2',
                  exercise_id: 'ex-tricpp-001',
                  exercise_name: 'Extensión de Tríceps',
                  sets: 1,
                  reps: '12',
                  rest: 45,
                },
              ],
            },
          ],
        },
        {
          dayNumber: 6,
          name: 'Día 6',
          objective: 'Más peso en cadena posterior.',
          blocks: [
            {
              id: 'block-w2-6a',
              type: 'straight',
              name: 'Posterior Chain',
              exercises: [
                {
                  id: 'ex-w2-6a-1',
                  exercise_id: 'ex-rdl-001',
                  exercise_name: 'Peso Muerto Rumano',
                  sets: 5,
                  reps: '6-8',
                  rest: 90,
                  weight: 'RPE 8-9',
                },
                {
                  id: 'ex-w2-6a-2',
                  exercise_id: 'ex-hipth-001',
                  exercise_name: 'Hip Thrust',
                  sets: 4,
                  reps: '8-10',
                  rest: 75,
                  weight: '+5% vs S1',
                },
              ],
            },
          ],
        },
        {
          dayNumber: 7,
          name: 'Día 7',
          objective: 'Recuperación - prepárate para semana de intensificación.',
          blocks: [],
        },
      ],
    },
  ],
};

// Mock workout plan using the new structure
export const mockWorkoutPlan: WorkoutPlan = {
  id: 'workout-plan-001',
  user_id: 'mock-user-uuid-12345',
  title: 'PROGRAMA FUERZA EXPLOSIVA',
  goal: 'Potencia y fuerza funcional',
  structure: mockWorkoutStructure,
  is_active: true,
  start_date: '2026-01-20',
  end_date: '2026-02-16',
  created_at: '2026-01-18T00:00:00Z',
};

// Empty workout plan for edge case testing
export const mockWorkoutPlanEmpty: WorkoutPlan = {
  ...mockWorkoutPlan,
  id: 'workout-plan-empty',
  title: 'Plan Vacío',
  structure: { weeks: [] },
  is_active: false,
};

// Helper function to get a specific day from the mock
export function getMockDay(weekNumber: number, dayNumber: number): WorkoutDay | undefined {
  const week = mockWorkoutStructure.weeks.find((w) => w.weekNumber === weekNumber);
  return week?.days.find((d) => d.dayNumber === dayNumber);
}

// Helper function to get all blocks of a specific type
export function getMockBlocksByType(type: 'straight' | 'circuit'): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  mockWorkoutStructure.weeks.forEach((week) => {
    week.days.forEach((day) => {
      day.blocks.forEach((block) => {
        if (block.type === type) {
          blocks.push(block);
        }
      });
    });
  });
  return blocks;
}

// ==========================================
// Legacy mocks for backwards compatibility
// These are deprecated and will be removed
// ==========================================

import type { AssignedWorkout } from '@/types/workout';

/** @deprecated Use mockWorkoutPlan instead */
export const mockAssignedWorkout: AssignedWorkout = {
  id: 'workout-uuid-001',
  client_id: 'mock-user-uuid-12345',
  template_id: 'template-uuid-001',
  structure: {
    weeks: [
      {
        week_number: 1,
        name: 'Semana 1 - Fundamentos',
        days: [
          {
            day_number: 1,
            name: 'FUERZA EXPLOSIVA: PIERNAS',
            focus: 'Potencia de tren inferior',
            exercises: [
              {
                exercise_id: 'ex-squat-001',
                name: 'Sentadilla con Barra',
                sets: 4,
                reps: '6-8',
                weight: 'RPE 8',
                rest: '90s',
                is_superset: false,
              },
            ],
          },
        ],
      },
    ],
  },
  scheduled_start_date: '2026-01-20',
  scheduled_end_date: '2026-02-16',
  status: 'active',
  client_notes: null,
  coach_notes: 'Programa de fuerza.',
  is_editable_by_client: false,
  created_at: '2026-01-18T00:00:00Z',
  updated_at: '2026-01-19T00:00:00Z',
  progress_data: {
    completed_workouts: [],
    adherence_percentage: 0,
    notes: {},
  },
};

/** @deprecated Use mockWorkoutPlanEmpty instead */
export const mockAssignedWorkoutEmpty: AssignedWorkout = {
  ...mockAssignedWorkout,
  id: 'workout-uuid-empty',
  structure: { weeks: [] },
  status: 'pending',
};
