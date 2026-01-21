import React, { useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Button, Card } from '@/components/ui';
import { QuestionButton } from '@/components/chat';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import type { WorkoutDay } from '@/__mocks__/types/database.types';

function isRestDay(day: WorkoutDay): boolean {
  const restKeywords = ['descanso', 'rest', 'recuperación', 'recovery'];
  const dayNameLower = day.name.toLowerCase();
  return restKeywords.some((keyword) => dayNameLower.includes(keyword));
}

function isTodayWorkout(dayNumber: number, currentWeek: number, selectedWeek: number): boolean {
  // Only mark as today if we're viewing the current week and it's the current day
  if (currentWeek !== selectedWeek) return false;

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to 1-indexed where 1 = Monday
  const todayDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

  return dayNumber === todayDayNumber;
}

interface WeekSelectorProps {
  weeks: number[];
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  currentWeek: number;
}

function WeekSelector({ weeks, selectedWeek, onSelectWeek, currentWeek }: WeekSelectorProps) {
  const { colors } = useTheme();

  return (
    <View testID="week-selector" style={{ marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {weeks.map((week) => {
          const isSelected = week === selectedWeek;
          const isCurrent = week === currentWeek;

          return (
            <Pressable
              key={week}
              testID={`week-chip-${week}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectWeek(week)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: isSelected ? colors.primary : colors.surfaceHighlight,
                borderWidth: isCurrent && !isSelected ? 1 : 0,
                borderColor: colors.primary,
              }}
            >
              <Text
                variant="bodySm"
                style={{
                  color: isSelected ? colors.background : colors.text,
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                Semana {week}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface WorkoutCardProps {
  day: WorkoutDay;
  dayNumber: number;
  workoutId: string;
  weekNumber: number;
  isToday: boolean;
  onPress: () => void;
}

function WorkoutCard({ day, dayNumber, workoutId, weekNumber, isToday, onPress }: WorkoutCardProps) {
  const { colors } = useTheme();
  const isRest = isRestDay(day);
  const exerciseCount = day.exercises?.length || 0;

  return (
    <Pressable
      testID={`workout-card-${dayNumber}`}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Card variant="glass">
        <View style={{ padding: 16, gap: 12 }}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="caption" color="textMuted" uppercase>
                DÍA {dayNumber}
              </Text>
              {isToday && (
                <View
                  testID="today-badge"
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text variant="caption" style={{ color: colors.background, fontWeight: '700' }}>
                    HOY
                  </Text>
                </View>
              )}
            </View>
            {isRest && (
              <View
                testID={`rest-day-indicator-${dayNumber}`}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.success + '30',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text variant="caption" style={{ color: colors.success }}>
                  ✓
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text variant="title" style={{ fontSize: 16 }}>
            {day.name}
          </Text>

          {/* Focus/Description */}
          {day.focus && (
            <Text variant="body" color="textMuted" numberOfLines={2}>
              {day.focus}
            </Text>
          )}

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {!isRest && exerciseCount > 0 && (
                <Text variant="bodySm" color="textMuted">
                  {exerciseCount} ejercicios
                </Text>
              )}
              {isRest && (
                <Text variant="bodySm" color="success">
                  Día de recuperación
                </Text>
              )}
              {!isRest && (
                <QuestionButton
                  referenceType="workout"
                  referenceId={`${workoutId}-week${weekNumber}-day${dayNumber}`}
                  referenceTag={`[Semana ${weekNumber} - Día ${dayNumber}: ${day.name}]`}
                  compact
                />
              )}
            </View>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isToday ? colors.primary : colors.surfaceHighlight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                variant="body"
                style={{ color: isToday ? colors.background : colors.textMuted }}
              >
                →
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function WorkoutListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { activeWorkout, isLoading, error, currentWeek, getWorkoutsForWeek, refreshWorkouts } = useWorkout();

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Get available weeks from active workout
  const availableWeeks = useMemo(() => {
    if (!activeWorkout?.structure?.weeks) return [];
    return activeWorkout.structure.weeks.map((w) => w.week_number);
  }, [activeWorkout]);

  // Get workout days for selected week
  const weekWorkouts = useMemo(() => {
    return getWorkoutsForWeek(selectedWeek);
  }, [getWorkoutsForWeek, selectedWeek]);

  const handleWorkoutPress = (dayNumber: number) => {
    if (!activeWorkout) return;
    router.push({
      pathname: '/(tabs)/workout/[id]',
      params: { id: activeWorkout.id, week: selectedWeek, day: dayNumber },
    });
  };

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

  if (!activeWorkout) {
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
              <Text variant="hero" color="textMuted">
                🏋️
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

        {/* Week Selector */}
        <WeekSelector
          weeks={availableWeeks}
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
          currentWeek={currentWeek}
        />

        {/* Week Info */}
        <View style={{ marginBottom: 16 }}>
          <Text variant="bodySm" color="textMuted">
            {activeWorkout.structure.weeks.find((w) => w.week_number === selectedWeek)?.name ||
              `Semana ${selectedWeek}`}
          </Text>
        </View>

        {/* Workout Cards */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
        >
          {weekWorkouts.map((day) => (
            <WorkoutCard
              key={day.day_number}
              day={day}
              dayNumber={day.day_number}
              workoutId={activeWorkout.id}
              weekNumber={selectedWeek}
              isToday={isTodayWorkout(day.day_number, currentWeek, selectedWeek)}
              onPress={() => handleWorkoutPress(day.day_number)}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
