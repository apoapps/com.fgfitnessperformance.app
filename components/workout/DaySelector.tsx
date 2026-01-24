import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import type { WorkoutDay } from '@/types/workout';

interface DaySelectorProps {
  days: WorkoutDay[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  todayDay?: number;
}

export function DaySelector({ days, selectedDay, onSelectDay, todayDay }: DaySelectorProps) {
  const { colors } = useTheme();

  // Helper to detect rest days
  const isRestDay = (name: string, blockCount: number) => {
    const lowerName = name.toLowerCase();
    return lowerName.includes('descanso') || lowerName.includes('rest') || blockCount === 0;
  };

  return (
    <View testID="day-selector" style={styles.container}>
      {/* Label */}
      <Text
        variant="caption"
        color="textMuted"
        uppercase
        style={styles.label}
      >
        DÍAS DE ENTRENAMIENTO
      </Text>

      {/* Day chips with names */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => {
          const isSelected = day.dayNumber === selectedDay;
          const isToday = day.dayNumber === todayDay;
          const isRest = isRestDay(day.name, day.blocks.length);

          return (
            <Pressable
              key={day.dayNumber}
              testID={`day-chip-${day.dayNumber}`}
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Día ${day.dayNumber}: ${day.name}${isToday ? ', hoy' : ''}`}
              onPress={() => onSelectDay(day.dayNumber)}
              style={[
                styles.dayCard,
                index < days.length - 1 && styles.cardMargin,
                {
                  backgroundColor: isSelected ? colors.primaryDim : colors.surface,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : (isToday ? colors.primary : colors.border),
                  borderStyle: isToday && !isSelected ? 'dashed' : 'solid',
                },
              ]}
            >
              {/* Day number badge */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceHighlight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isSelected ? colors.background : colors.text,
                    },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>

              {/* Day name */}
              <Text
                variant="bodySm"
                style={[
                  styles.dayName,
                  {
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.text : colors.textMuted,
                  },
                ]}
                numberOfLines={2}
              >
                {day.name}
              </Text>

              {/* Rest indicator */}
              {isRest && <Text style={styles.restEmoji}>💤</Text>}

              {/* Today dot indicator */}
              {isToday && (
                <View
                  style={[
                    styles.todayDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  scrollContent: {
    paddingRight: 20,
    paddingVertical: 4,
  },
  dayCard: {
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  cardMargin: {
    marginRight: 10,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayName: {
    fontSize: 13,
    textAlign: 'center',
  },
  restEmoji: {
    fontSize: 10,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
