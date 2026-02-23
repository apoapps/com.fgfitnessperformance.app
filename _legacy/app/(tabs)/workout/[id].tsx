import React, { useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { WorkoutBlock, ObjectiveCard } from '@/components/workout';
import type { WorkoutDay } from '@/types/workout';

export default function WorkoutDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; day: string }>();

  const { workoutPlan, isLoading, selectedDay, setSelectedDay } = useWorkout();

  // Parse the day from params or use selected day
  const dayNumber = params.day ? parseInt(params.day, 10) : selectedDay;

  // Get the specific workout day from the plan structure
  const workoutDay = useMemo<WorkoutDay | null>(() => {
    if (!workoutPlan?.structure?.weeks) return null;

    // Find the day by counting through all weeks
    let dayCounter = 0;
    for (const week of workoutPlan.structure.weeks) {
      for (const day of week.days) {
        dayCounter++;
        if (dayCounter === dayNumber) {
          return day;
        }
      }
    }

    return null;
  }, [workoutPlan, dayNumber]);

  // Get week info for the current day
  const weekInfo = useMemo(() => {
    if (!workoutPlan?.structure?.weeks) return null;

    let dayCounter = 0;
    for (const week of workoutPlan.structure.weeks) {
      for (const _day of week.days) {
        dayCounter++;
        if (dayCounter === dayNumber) {
          return { weekNumber: week.weekNumber, weekName: week.name };
        }
      }
    }
    return null;
  }, [workoutPlan, dayNumber]);

  // Count total exercises across all blocks
  const totalExercises = useMemo(() => {
    if (!workoutDay?.blocks) return 0;
    return workoutDay.blocks.reduce((total, block) => total + block.exercises.length, 0);
  }, [workoutDay]);

  // Generate block labels (A, B, C, etc.)
  const blockLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const handleExercisePress = (exerciseId: string, exerciseName: string) => {
    router.push(`/exercise/${exerciseId}?name=${encodeURIComponent(exerciseName)}`);
  };

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
              {weekInfo && (
                <View
                  style={{
                    backgroundColor: colors.surfaceHighlight,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <Text variant="bodySm">Semana {weekInfo.weekNumber}</Text>
                </View>
              )}
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
          </View>

          {/* Divider */}
          <View style={{ width: 48, height: 4, backgroundColor: colors.primary }} />
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Objective Card - show plan objective or day objective */}
          {(workoutPlan?.structure?.objective || workoutDay.objective) && (
            <ObjectiveCard
              objective={workoutDay.objective || workoutPlan?.structure?.objective || ''}
              programName={workoutPlan?.structure?.name}
              description={workoutPlan?.structure?.description}
            />
          )}

          {/* Workout Blocks */}
          {workoutDay.blocks?.map((block, index) => (
            <WorkoutBlock
              key={block.id}
              block={block}
              blockLabel={blockLabels[index] || `${index + 1}`}
              onExercisePress={handleExercisePress}
            />
          ))}
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
            testID="start-workout-button"
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
              {totalExercises} ejercicios • {workoutDay.blocks?.length || 0} bloques
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
