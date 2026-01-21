import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import type { Exercise } from '@/types/workout';

interface ExerciseInfoProps {
  exercise: Exercise;
}

interface BadgeProps {
  label: string;
  color?: string;
}

function Badge({ label, color }: BadgeProps) {
  const { colors } = useTheme();
  const bgColor = color || colors.surfaceHighlight;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
      }}
    >
      <Text variant="caption" style={{ textTransform: 'capitalize' }}>
        {label}
      </Text>
    </View>
  );
}

// Map muscle groups to Spanish
const muscleGroupLabels: Record<string, string> = {
  legs: 'Piernas',
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  glutes: 'Gluteos',
  hamstrings: 'Isquiotibiales',
  calves: 'Pantorrillas',
  full_body: 'Cuerpo Completo',
  forearms: 'Antebrazos',
  traps: 'Trapecios',
};

// Map equipment to Spanish
const equipmentLabels: Record<string, string> = {
  barbell: 'Barra',
  dumbbells: 'Mancuernas',
  machine: 'Maquina',
  cable: 'Polea',
  bodyweight: 'Peso Corporal',
  none: 'Sin Equipo',
  pullup_bar: 'Barra de Dominadas',
  parallel_bars: 'Paralelas',
  kettlebell: 'Kettlebell',
  resistance_band: 'Banda Elastica',
};

// Map difficulty to Spanish
const difficultyLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function ExerciseInfo({ exercise }: ExerciseInfoProps) {
  const { colors } = useTheme();

  const muscleLabel = muscleGroupLabels[exercise.muscle_group] || exercise.muscle_group;
  const equipmentLabel = exercise.equipment
    ? equipmentLabels[exercise.equipment] || exercise.equipment
    : null;
  const difficultyLabel = difficultyLabels[exercise.difficulty] || exercise.difficulty;

  return (
    <View testID="exercise-info" style={{ gap: 20 }}>
      {/* Title */}
      <View style={{ gap: 4 }}>
        <Text variant="hero" style={{ fontSize: 24 }}>
          {exercise.name_es || exercise.name}
        </Text>
        {exercise.name_es && (
          <Text variant="bodySm" color="textMuted">
            {exercise.name}
          </Text>
        )}
      </View>

      {/* Badges - only show if we have real data (not fallback) */}
      {exercise.muscle_group !== 'unknown' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Badge label={muscleLabel} color={colors.primary + '30'} />
          {equipmentLabel && <Badge label={equipmentLabel} />}
          <Badge label={difficultyLabel} />
          {exercise.secondary_muscles?.length > 0 && (
            <Badge
              label={`+${exercise.secondary_muscles.length} musculos`}
              color={colors.surfaceHighlight}
            />
          )}
        </View>
      )}

      {/* Fallback message when no detailed data available */}
      {exercise.muscle_group === 'unknown' && !exercise.instructions && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 20,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
            Informacion detallada no disponible.
          </Text>
          <Text variant="bodySm" color="textMuted" style={{ textAlign: 'center' }}>
            Consulta con tu coach para mas detalles sobre este ejercicio.
          </Text>
        </View>
      )}

      {/* Instructions */}
      {exercise.instructions && (
        <View style={{ gap: 8 }}>
          <Text variant="title" style={{ fontSize: 16 }}>
            INSTRUCCIONES
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text variant="body" color="textMuted" style={{ lineHeight: 22 }}>
              {exercise.instructions}
            </Text>
          </View>
        </View>
      )}

      {/* Tips */}
      {exercise.tips && exercise.tips.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text variant="title" style={{ fontSize: 16 }}>
            RECOMENDACIONES
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            {exercise.tips.map((tip, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ color: colors.primary, fontWeight: '700' }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  variant="body"
                  color="textMuted"
                  style={{ flex: 1, lineHeight: 22 }}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Secondary Muscles */}
      {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text variant="title" style={{ fontSize: 16 }}>
            MUSCULOS SECUNDARIOS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {exercise.secondary_muscles.map((muscle, index) => (
              <Badge
                key={index}
                label={muscleGroupLabels[muscle] || muscle}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
