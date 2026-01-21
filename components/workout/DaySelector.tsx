import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface DaySelectorProps {
  totalDays: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  todayDay?: number;
}

export function DaySelector({ totalDays, selectedDay, onSelectDay, todayDay }: DaySelectorProps) {
  const { colors } = useTheme();

  // Generate array of days [1, 2, 3, ..., totalDays]
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View testID="day-selector" style={styles.container}>
      {/* Label */}
      <Text
        variant="caption"
        color="textMuted"
        uppercase
        style={styles.label}
      >
        DIA
      </Text>

      {/* Day chips as cards - using FlatList-like horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => {
          const isSelected = day === selectedDay;
          const isToday = day === todayDay;

          return (
            <View key={day} style={[styles.chipWrapper, index < days.length - 1 && styles.chipMargin]}>
              <Pressable
                testID={`day-chip-${day}`}
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Día ${day}${isToday ? ', hoy' : ''}`}
                onPress={() => onSelectDay(day)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : isToday ? colors.primary : colors.surfaceHighlight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#000000' : colors.text,
                    },
                  ]}
                >
                  {day.toString().padStart(2, '0')}
                </Text>
              </Pressable>
            </View>
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
    marginBottom: 16,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingRight: 20,
    paddingVertical: 4,
  },
  chipWrapper: {
    // Wrapper ensures proper spacing
  },
  chipMargin: {
    marginRight: 12,
  },
  chip: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
