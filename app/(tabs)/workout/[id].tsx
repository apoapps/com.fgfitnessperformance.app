import React, { useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import type { Exercise, WorkoutDay } from '@/__mocks__/types/database.types';

interface ExerciseCardProps {
  exercise: Exercise;
  isInSuperset?: boolean;
}

function ExerciseCard({ exercise, isInSuperset = false }: ExerciseCardProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={`exercise-card-${exercise.exercise_instance_id}`}
      style={{
        backgroundColor: isInSuperset ? 'transparent' : colors.surfaceHighlight,
        borderRadius: isInSuperset ? 0 : 12,
        padding: 16,
        gap: 12,
      }}
    >
      {/* Exercise Name */}
      <Text variant="title" style={{ fontSize: 16 }}>
        {exercise.name}
      </Text>

      {/* Metrics Row */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {/* Sets */}
        <View style={{ gap: 2 }}>
          <Text variant="caption" color="textMuted">
            Series
          </Text>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {exercise.sets} series
          </Text>
        </View>

        {/* Reps */}
        <View style={{ gap: 2 }}>
          <Text variant="caption" color="textMuted">
            Repeticiones
          </Text>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {exercise.reps}
          </Text>
        </View>

        {/* Rest */}
        {exercise.rest && (
          <View style={{ gap: 2 }}>
            <Text variant="caption" color="textMuted">
              Descanso
            </Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {exercise.rest}
            </Text>
          </View>
        )}

        {/* Weight/Load */}
        {exercise.weight && (
          <View style={{ gap: 2 }}>
            <Text variant="caption" color="textMuted">
              Carga
            </Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {exercise.weight}
            </Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {exercise.notes && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
          }}
        >
          <Text variant="bodySm" color="textMuted">
            {exercise.notes}
          </Text>
        </View>
      )}
    </View>
  );
}

interface SupersetBlockProps {
  exercises: Exercise[];
  supersetId: string;
}

function SupersetBlock({ exercises, supersetId }: SupersetBlockProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={`superset-block-${supersetId}`}
      style={{
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Superset Header */}
      <View
        style={{
          backgroundColor: colors.primary + '20',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.primary + '40',
        }}
      >
        <Text variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
          SUPERSET
        </Text>
      </View>

      {/* Exercises */}
      <View style={{ gap: 1, backgroundColor: colors.border }}>
        {exercises.map((exercise, index) => (
          <View key={exercise.exercise_instance_id} style={{ backgroundColor: colors.surfaceHighlight }}>
            <ExerciseCard exercise={exercise} isInSuperset />
            {index < exercises.length - 1 && (
              <View
                style={{
                  marginHorizontal: 16,
                  height: 1,
                  backgroundColor: colors.border,
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function WorkoutDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; week: string; day: string }>();

  const { activeWorkout, isLoading, getWorkoutById } = useWorkout();

  const workoutId = params.id;
  const weekNumber = parseInt(params.week || '1', 10);
  const dayNumber = parseInt(params.day || '1', 10);

  // Get the specific workout day
  const workoutDay = useMemo<WorkoutDay | null>(() => {
    const workout = getWorkoutById(workoutId);
    if (!workout?.structure?.weeks) return null;

    const week = workout.structure.weeks.find((w) => w.week_number === weekNumber);
    if (!week) return null;

    return week.days.find((d) => d.day_number === dayNumber) || null;
  }, [getWorkoutById, workoutId, weekNumber, dayNumber]);

  // Group exercises by superset
  const groupedExercises = useMemo(() => {
    if (!workoutDay?.exercises) return [];

    const exercises = [...workoutDay.exercises].sort((a, b) => a.order - b.order);
    const groups: { type: 'single' | 'superset'; exercises: Exercise[]; id: string }[] = [];
    const processed = new Set<string>();

    for (const exercise of exercises) {
      if (processed.has(exercise.exercise_instance_id)) continue;

      if (exercise.is_superset && exercise.superset_with) {
        // Find the paired exercise
        const paired = exercises.find((e) => e.exercise_instance_id === exercise.superset_with);
        if (paired && !processed.has(paired.exercise_instance_id)) {
          groups.push({
            type: 'superset',
            exercises: [exercise, paired],
            id: exercise.exercise_instance_id,
          });
          processed.add(exercise.exercise_instance_id);
          processed.add(paired.exercise_instance_id);
        } else {
          groups.push({
            type: 'single',
            exercises: [exercise],
            id: exercise.exercise_instance_id,
          });
          processed.add(exercise.exercise_instance_id);
        }
      } else {
        groups.push({
          type: 'single',
          exercises: [exercise],
          id: exercise.exercise_instance_id,
        });
        processed.add(exercise.exercise_instance_id);
      }
    }

    return groups;
  }, [workoutDay]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          testID="workout-detail-loading"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!workoutDay) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* Back Button */}
          <Pressable
            testID="back-button"
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surfaceHighlight,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text variant="body">←</Text>
          </Pressable>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <Text variant="title" color="danger">
              No encontrado
            </Text>
            <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
              El entrenamiento que buscas no existe o ha sido eliminado.
            </Text>
            <Button title="Volver" variant="outline" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const exerciseCount = workoutDay.exercises?.length || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 20, gap: 16 }}>
          {/* Back Button & Week/Day Info */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable
              testID="back-button"
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surfaceHighlight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text variant="body">←</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View
                style={{
                  backgroundColor: colors.surfaceHighlight,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text variant="bodySm">Semana {weekNumber}</Text>
              </View>
              <View
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text variant="bodySm" style={{ color: colors.background }}>
                  Día {dayNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <View style={{ gap: 8 }}>
            <Text variant="hero" style={{ fontSize: 24 }}>
              {workoutDay.name}
            </Text>
            {workoutDay.focus && (
              <Text variant="body" color="textMuted">
                {workoutDay.focus}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={{ width: 48, height: 4, backgroundColor: colors.primary }} />
        </View>

        {/* Exercise List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {groupedExercises.map((group) =>
            group.type === 'superset' ? (
              <SupersetBlock key={group.id} exercises={group.exercises} supersetId={group.id} />
            ) : (
              <ExerciseCard key={group.id} exercise={group.exercises[0]} />
            )
          )}
        </ScrollView>

        {/* Start Button */}
        <View
          style={{
            padding: 20,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.primaryDark : colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              gap: 4,
            })}
          >
            <Text variant="title" style={{ color: colors.background }}>
              INICIAR ENTRENAMIENTO
            </Text>
            <Text variant="bodySm" style={{ color: colors.background + 'CC' }}>
              {exerciseCount} ejercicios
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
