import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, MeshGradientBanner } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

interface ObjectiveCardProps {
  objective: string;
  programName?: string;
  description?: string;
}

export function ObjectiveCard({ objective, programName, description }: ObjectiveCardProps) {
  const { colors, isDark } = useTheme();

  // Calculate dynamic height based on content
  const hasDescription = !!description;
  const hasProgramName = !!programName;
  const baseHeight = 120;
  const programNameHeight = hasProgramName ? 44 : 0;
  const descriptionHeight = hasDescription ? 60 : 0;
  const totalHeight = baseHeight + programNameHeight + descriptionHeight;

  return (
    <MeshGradientBanner
      testID="objective-card"
      height={totalHeight}
      style={styles.banner}
    >
      <View style={styles.content}>
        {/* Program name if provided */}
        {programName && (
          <View style={styles.programRow}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' },
              ]}
            >
              <Ionicons name="barbell" size={16} color={isDark ? colors.primary : colors.primaryDark} />
            </View>
            <Text
              variant="title"
              style={[
                styles.programName,
                { color: isDark ? colors.text : colors.textInverse },
                { textShadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
              ]}
            >
              {programName}
            </Text>
          </View>
        )}

        {/* Objective section */}
        <View style={styles.objectiveSection}>
          <View style={styles.labelRow}>
            <Ionicons
              name="flag"
              size={14}
              color={isDark ? colors.text : colors.background}
            />
            <Text
              variant="caption"
              uppercase
              style={[
                styles.label,
                { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' },
              ]}
            >
              OBJETIVO
            </Text>
          </View>
          <Text
            variant="body"
            style={[
              styles.objectiveText,
              { color: isDark ? colors.text : colors.background },
              { textShadowColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
            ]}
          >
            {objective}
          </Text>
        </View>

        {/* Description if provided */}
        {description && (
          <View style={styles.descriptionSection}>
            <View style={styles.labelRow}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'}
              />
              <Text
                variant="caption"
                uppercase
                style={[
                  styles.label,
                  { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' },
                ]}
              >
                DESCRIPCION
              </Text>
            </View>
            <Text
              variant="bodySm"
              style={[
                styles.descriptionText,
                { color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)' },
              ]}
            >
              {description}
            </Text>
          </View>
        )}
      </View>
    </MeshGradientBanner>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 0,
  },
  content: {
    flex: 1,
    gap: 12,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  programName: {
    fontSize: 18,
    flex: 1,
    fontWeight: '700',
  },
  objectiveSection: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  objectiveText: {
    lineHeight: 22,
    fontWeight: '500',
  },
  descriptionSection: {
    gap: 4,
  },
  descriptionText: {
    lineHeight: 18,
  },
});
