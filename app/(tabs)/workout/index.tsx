import { QuestionButton } from '@/components/chat';
import { Button, ScreenHeader, Text, FitnessDoodleBackground } from '@/components/ui';
import { DaySelector, ObjectiveCard, WorkoutBlock } from '@/components/workout';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Mini logos - adapt to theme
const MiniLogoBlanco = require('../../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../../assets/mini-logo-negro.svg');

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
  const { colors, isDark } = useTheme();
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
    getAllDays,
    refreshWorkouts,
  } = useWorkout();

  // Get current day data
  const currentDay = useMemo(() => getCurrentDay(), [getCurrentDay]);
  const currentWeek = useMemo(() => getWeekForDay(selectedDay), [getWeekForDay, selectedDay]);
  const totalDays = useMemo(() => getTotalDays(), [getTotalDays]);
  const allDays = useMemo(() => getAllDays(), [getAllDays]);

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
          <ScreenHeader title="Entrenamiento" logoSize={28} style={{ marginBottom: 24 }} />

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
      {/* Themed fitness doodle background */}
      <FitnessDoodleBackground opacity={0.03} spacing={90} logoFrequency={3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
          {/* Header buttons */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              flexDirection: 'row',
              gap: 8,
              zIndex: 10,
            }}
          >
            <QuestionButton
              referenceType="workout"
              referenceId={`${workoutPlan.id}-day${selectedDay}`}
              referenceTag={`[${workoutPlan.title} - Día ${selectedDay}]`}
            />
          </View>

          {/* Plan Title with Logo - Card */}
          <Animated.View
            style={{ paddingHorizontal: 20, paddingTop: 16 }}
            entering={FadeIn.duration(300)}
          >
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source={isDark ? MiniLogoBlanco : MiniLogoNegro}
                  style={{ width: 32, height: 24 }}
                  contentFit="contain"
                />
                <Text
                  variant="hero"
                  style={{
                    fontSize: 22,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    flex: 1,
                  }}
                >
                  {workoutPlan.title}
                </Text>
              </View>

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
          </Animated.View>

        {/* Main Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Day Selector */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <DaySelector
              days={allDays}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              todayDay={todayDayNumber}
            />
          </Animated.View>

          {/* Day content */}
          {currentDay && (
            <>
              {/* Day-specific Objective Card */}
              {currentDay.objective && (
                <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                  <ObjectiveCard objective={currentDay.objective} />
                </Animated.View>
              )}

              {/* Rest Day State */}
              {isRest ? (
                <Animated.View
                  testID="rest-day-content"
                  entering={FadeInDown.delay(200).duration(400)}
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
                </Animated.View>
              ) : (
                /* Workout Blocks */
                <View testID="workout-blocks">
                  {currentDay.blocks.map((block, index) => (
                    <Animated.View
                      key={block.id}
                      entering={FadeInDown.delay(200 + index * 80).duration(400)}
                    >
                      <WorkoutBlock
                        block={block}
                        blockLabel={getBlockLabel(index)}
                        onExercisePress={handleExercisePress}
                      />
                    </Animated.View>
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
