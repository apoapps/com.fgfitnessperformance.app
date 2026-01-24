import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import type { NutritionMacros } from '@/types/nutrition';

interface Props {
  macros: NutritionMacros;
  waterTarget: number;
}

interface MacroMiniProps {
  label: string;
  value: number;
  color: string;
}

function MacroMini({ label, value, color }: MacroMiniProps) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: color + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Text variant="caption" style={{ fontSize: 12, fontWeight: '700', color }}>
          {label}
        </Text>
      </View>
      <Text variant="title" style={{ fontSize: 16, fontWeight: '600' }}>
        {value}g
      </Text>
    </View>
  );
}

export const CompactMacroBar = React.memo(function CompactMacroBar({ macros, waterTarget }: Props) {
  const { colors } = useTheme();

  return (
    <Card variant="glass" style={{ padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {/* Calories - Primary metric */}
        <View style={{ flex: 1.5, alignItems: 'center' }}>
          <Text variant="hero" style={{ fontSize: 32, fontWeight: '700', color: colors.text }}>
            {macros.calories}
          </Text>
          <Text variant="caption" style={{ fontSize: 11, color: colors.textMuted }}>
            KCAL
          </Text>
        </View>

        <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />

        {/* Macros - Horizontal row */}
        <View style={{ flex: 3, flexDirection: 'row', gap: 14 }}>
          <MacroMini label="P" value={macros.protein} color={colors.macroProtein} />
          <MacroMini label="C" value={macros.carbs} color={colors.macroCarbs} />
          <MacroMini label="G" value={macros.fat} color={colors.macroFat} />
        </View>

        <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />

        {/* Water */}
        <View style={{ flex: 1.2, alignItems: 'center' }}>
          <Text style={{ fontSize: 20 }}>💧</Text>
          <Text variant="title" style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
            {waterTarget}L
          </Text>
        </View>
      </View>
    </Card>
  );
});
