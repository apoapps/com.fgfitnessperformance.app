import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface RecommendationBannerProps {
  recommendation: string;
}

export function RecommendationBanner({ recommendation }: RecommendationBannerProps) {
  const { colors } = useTheme();

  return (
    <View
      testID="recommendation-banner"
      style={{
        backgroundColor: colors.primary + '10',
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <Text
        variant="caption"
        uppercase
        style={{
          color: colors.primary,
          fontWeight: '700',
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        RECOMENDACION
      </Text>
      <Text variant="bodySm" style={{ color: colors.text, lineHeight: 20 }}>
        {recommendation}
      </Text>
    </View>
  );
}
