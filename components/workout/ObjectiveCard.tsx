import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface ObjectiveCardProps {
  objective: string;
  programName?: string;
  description?: string;
}

export function ObjectiveCard({ objective, programName, description }: ObjectiveCardProps) {
  const { colors } = useTheme();

  return (
    <View
      testID="objective-card"
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        gap: 12,
      }}
    >
      {/* Program name if provided */}
      {programName && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="barbell" size={16} color={colors.background} />
          </View>
          <Text variant="title" style={{ fontSize: 16, flex: 1 }}>
            {programName}
          </Text>
        </View>
      )}

      {/* Objective section */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="flag" size={14} color={colors.primary} />
          <Text variant="caption" color="textMuted" uppercase style={{ letterSpacing: 1 }}>
            OBJETIVO
          </Text>
        </View>
        <Text variant="body" style={{ color: colors.text, lineHeight: 22 }}>
          {objective}
        </Text>
      </View>

      {/* Description if provided */}
      {description && (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
            <Text variant="caption" color="textMuted" uppercase style={{ letterSpacing: 1 }}>
              DESCRIPCIÓN
            </Text>
          </View>
          <Text variant="bodySm" color="textMuted" style={{ lineHeight: 20 }}>
            {description}
          </Text>
        </View>
      )}
    </View>
  );
}
