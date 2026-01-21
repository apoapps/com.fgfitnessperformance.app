import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface ObjectiveCardProps {
  objective: string;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const { colors } = useTheme();

  return (
    <View
      testID="objective-card"
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
      }}
    >
      {/* Header with icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 12, color: colors.primary }}>O</Text>
        </View>
        <Text variant="caption" color="textMuted" uppercase style={{ letterSpacing: 1 }}>
          OBJETIVO
        </Text>
      </View>

      {/* Objective text */}
      <Text variant="body" style={{ color: colors.text, lineHeight: 22 }}>
        {objective}
      </Text>
    </View>
  );
}
