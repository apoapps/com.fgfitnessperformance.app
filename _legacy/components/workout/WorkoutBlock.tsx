import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { ExerciseRow } from './ExerciseRow';
import { RecommendationBanner } from './RecommendationBanner';
import type { WorkoutBlock as WorkoutBlockType } from '@/types/workout';

interface WorkoutBlockProps {
  block: WorkoutBlockType;
  blockLabel: string; // A, B, C, etc.
  onExercisePress?: (exerciseId: string, exerciseName: string) => void;
}

export function WorkoutBlock({ block, blockLabel, onExercisePress }: WorkoutBlockProps) {
  const { colors } = useTheme();
  const isCircuit = block.type === 'circuit';

  return (
    <View
      testID={`workout-block-${block.id}`}
      style={{
        marginBottom: 20,
      }}
    >
      {/* Block Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        {/* Left side: Block label + name */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            variant="caption"
            color="textMuted"
            uppercase
            style={{ fontWeight: '700', letterSpacing: 1 }}
          >
            BLOQUE {blockLabel}
          </Text>
          {block.name && (
            <Text variant="caption" color="textMuted" uppercase style={{ letterSpacing: 1 }}>
              {block.name}
            </Text>
          )}
        </View>

        {/* Right side: Circuit badge */}
        {isCircuit && block.rounds && (
          <View
            testID={`circuit-badge-${block.id}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary + '20',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              gap: 4,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 12 }}>⚡</Text>
            <Text
              variant="caption"
              style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.5 }}
            >
              CIRCUITO ({block.rounds}X)
            </Text>
          </View>
        )}
      </View>

      {/* Divider line */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.surfaceHighlight,
          marginBottom: 12,
        }}
      />

      {/* Block content container */}
      <View
        style={
          isCircuit
            ? {
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: colors.primary,
                borderRadius: 12,
                padding: 12,
              }
            : {}
        }
      >
        {/* Recommendation banner (inside circuit container if circuit) */}
        {block.recommendation && <RecommendationBanner recommendation={block.recommendation} />}

        {/* Exercises */}
        <View style={{ gap: 8 }}>
          {block.exercises.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              compact={isCircuit}
              onPress={onExercisePress ? () => onExercisePress(exercise.exercise_id, exercise.exercise_name) : undefined}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
