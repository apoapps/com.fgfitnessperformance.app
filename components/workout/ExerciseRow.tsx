import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import type { BlockExercise } from '@/types/workout';

interface ExerciseRowProps {
  exercise: BlockExercise;
  onPress?: () => void;
  compact?: boolean;
}

export function ExerciseRow({ exercise, onPress, compact = false }: ExerciseRowProps) {
  const { colors } = useTheme();

  // Format the metrics display
  const getMetrics = () => {
    const parts: string[] = [];

    if (exercise.sets > 1) {
      parts.push(`${exercise.sets} SERIES`);
    }

    if (exercise.reps) {
      parts.push(`${exercise.reps} REPS`);
    }

    if (exercise.tempo) {
      parts.push(`Tempo ${exercise.tempo}`);
    }

    if (exercise.rest > 0) {
      parts.push(`${exercise.rest}s DESC`);
    }

    return parts.join(' | ');
  };

  const content = (
    <View
      testID={`exercise-row-${exercise.id}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: compact ? 8 : 12,
        padding: compact ? 10 : 14,
        gap: 12,
      }}
    >
      {/* Thumbnail placeholder with play icon */}
      <View
        style={{
          width: compact ? 48 : 60,
          height: compact ? 48 : 60,
          borderRadius: 8,
          backgroundColor: colors.surfaceHighlight,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary + '80',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.background, fontSize: 10 }}>▶</Text>
        </View>
      </View>

      {/* Exercise info */}
      <View style={{ flex: 1 }}>
        <Text
          variant={compact ? 'bodySm' : 'body'}
          style={{ fontWeight: '600', marginBottom: 4 }}
          numberOfLines={1}
        >
          {exercise.exercise_name}
        </Text>

        <Text variant="caption" color="textMuted">
          {getMetrics()}
        </Text>

        {exercise.weight && (
          <Text variant="caption" style={{ color: colors.primary, marginTop: 2 }}>
            {exercise.weight}
          </Text>
        )}

        {exercise.notes && !compact && (
          <Text variant="caption" color="textMuted" style={{ marginTop: 4 }} numberOfLines={1}>
            {exercise.notes}
          </Text>
        )}
      </View>

      {/* Arrow indicator */}
      {onPress && (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surfaceHighlight,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text variant="body" color="textMuted">
            →
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}
