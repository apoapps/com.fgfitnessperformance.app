import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import type { NutritionMacros } from '@/types/nutrition';

interface Props {
  macros: NutritionMacros;
  waterTarget: number;
}

export const CompactMacroBar = React.memo(function CompactMacroBar({ macros, waterTarget }: Props) {
  const { colors } = useTheme();

  return (
    <Card variant="glass" style={{ padding: 16 }}>
      {/* Top row - Calories */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <Ionicons name="flame" size={20} color={colors.primary} />
        <Text variant="hero" style={{ fontSize: 28, color: colors.text }}>
          {macros.calories}
        </Text>
        <Text variant="body" style={{ color: colors.textMuted }}>
          Calorías
        </Text>
      </View>

      {/* Macros row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        {/* Protein */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.macroProtein + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="fish" size={18} color={colors.macroProtein} />
          </View>
          <Text variant="bodyMedium" style={{ fontSize: 15 }}>
            {macros.protein}g
          </Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
            Proteína
          </Text>
        </View>

        {/* Carbs */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.macroCarbs + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="leaf" size={18} color={colors.macroCarbs} />
          </View>
          <Text variant="bodyMedium" style={{ fontSize: 15 }}>
            {macros.carbs}g
          </Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
            Carbohidratos
          </Text>
        </View>

        {/* Fat */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.macroFat + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="water" size={18} color={colors.macroFat} />
          </View>
          <Text variant="bodyMedium" style={{ fontSize: 15 }}>
            {macros.fat}g
          </Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
            Grasas
          </Text>
        </View>

        {/* Water */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.info + '20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="water-outline" size={18} color={colors.info} />
          </View>
          <Text variant="bodyMedium" style={{ fontSize: 15 }}>
            {waterTarget}L
          </Text>
          <Text variant="caption" color="textMuted" style={{ fontSize: 10 }}>
            Agua
          </Text>
        </View>
      </View>
    </Card>
  );
});
