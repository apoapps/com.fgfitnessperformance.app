import React, { useMemo } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Button } from '@/components/ui';
import { QuestionButton } from '@/components/chat';
import { DaySelector, ObjectiveCard, WorkoutBlock } from '@/components/workout';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';

// Get block label (A, B, C, etc.)
function getBlockLabel(index: number): string {
  return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
}

// Check if the day is a rest day (empty blocks or specific keywords)
function isRestDay(dayName: string, blocksCount: number): boolean {
  if (blocksCount === 0) return true;
  const restKeywords = ['descanso', 'rest', 'recuperación', 'recovery'];
  const dayNameLower = dayName.toLowerCase();
  return restKeywords.some((keyword) => dayNameLower.includes(keyword));
}

export default function WorkoutScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    workoutPlan,
    isLoading,
    error,
    selectedDay,
    setSelectedDay,
    getCurrentDay,
    getTotalDays,
    getWeekForDay,
    refreshWorkouts,
  } = useWorkout();

  // Get current day data
  const currentDay = useMemo(() => getCurrentDay(), [getCurrentDay]);
  const currentWeek = useMemo(() => getWeekForDay(selectedDay), [getWeekForDay, selectedDay]);
  const totalDays = useMemo(() => getTotalDays(), [getTotalDays]);

  // Calculate today's day number based on start date
  const todayDayNumber = useMemo(() => {
    if (!workoutPlan?.start_date) return undefined;

    const startDate = new Date(workoutPlan.start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Day number is 1-indexed
    const dayNumber = diffDays + 1;

    // Only return if within valid range
    if (dayNumber >= 1 && dayNumber <= totalDays) {
      return dayNumber;
    }
    return undefined;
  }, [workoutPlan, totalDays]);

  const handleExercisePress = (exerciseId: string, exerciseName: string) => {
    router.push(`/exercise/${exerciseId}?name=${encodeURIComponent(exerciseName)}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          testID="workout-loading"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text variant="title" color="danger">
            Error
          </Text>
          <Text variant="body" color="textMuted" style={{ marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <Button
            title="Reintentar"
            variant="outline"
            onPress={refreshWorkouts}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no workout plan
  if (!workoutPlan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
          {/* Header */}
          <View style={{ gap: 4, marginBottom: 24 }}>
            <Text variant="hero" style={{ fontSize: 32 }}>
              Entrenamiento
            </Text>
            <View style={{ width: 48, height: 4, backgroundColor: colors.primary, marginTop: 8 }} />
          </View>

          {/* Empty State */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surfaceHighlight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text variant="hero" color="textMuted" style={{ fontSize: 32 }}>
                *
              </Text>
            </View>
            <Text variant="title" style={{ textAlign: 'center' }}>
              No tienes entrenamientos
            </Text>
            <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
              Contacta a tu coach para que te asigne un programa de entrenamiento.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main content with workout plan
  const isRest = currentDay ? isRestDay(currentDay.name, currentDay.blocks.length) : false;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Header with Plan Title and Goal */}
        <View
          style={{
            minHeight: 140,
            backgroundColor: colors.surfaceHighlight,
            justifyContent: 'flex-end',
            padding: 20,
            marginBottom: 20,
          }}
        >
          {/* Header buttons */}
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <QuestionButton
              referenceType="workout"
              referenceId={`${workoutPlan.id}-day${selectedDay}`}
              referenceTag={`[${workoutPlan.title} - Día ${selectedDay}]`}
            />
          </View>

          {/* Plan Title */}
          <Text
            variant="hero"
            style={{
              fontSize: 24,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {workoutPlan.title}
          </Text>

          {/* Plan Goal */}
          {workoutPlan.goal && (
            <Text
              variant="body"
              color="textMuted"
              style={{ marginTop: 8 }}
            >
              {workoutPlan.goal}
            </Text>
          )}
        </View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Day Selector */}
          <DaySelector
            totalDays={totalDays}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            todayDay={todayDayNumber}
          />

          {/* Day content */}
          {currentDay && (
            <>
              {/* Day-specific Objective Card */}
              {currentDay.objective && <ObjectiveCard objective={currentDay.objective} />}

              {/* Rest Day State */}
              {isRest ? (
                <View
                  testID="rest-day-content"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 24,
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.success + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 24, color: colors.success }}>✓</Text>
                  </View>
                  <Text variant="title" style={{ textAlign: 'center' }}>
                    Dia de Descanso
                  </Text>
                  <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
                    Aprovecha para recuperarte. Hidratacion y buen descanso.
                  </Text>
                </View>
              ) : (
                /* Workout Blocks */
                <View testID="workout-blocks">
                  {currentDay.blocks.map((block, index) => (
                    <WorkoutBlock
                      key={block.id}
                      block={block}
                      blockLabel={getBlockLabel(index)}
                      onExercisePress={handleExercisePress}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
