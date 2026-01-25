import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui/Text';
import { ChatReferenceType } from '../../__mocks__/types/database.types';

interface QuestionButtonProps {
  referenceType: ChatReferenceType;
  referenceId: string;
  referenceTag: string;
  compact?: boolean;
  prominent?: boolean; // Yellow background, high contrast
}

export function QuestionButton({
  referenceType,
  referenceId,
  referenceTag,
  compact = false,
  prominent = false,
}: QuestionButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: '/chat',
      params: {
        referenceType,
        referenceId,
        referenceTag,
      },
    });
  };

  // Prominent style - yellow bg, dark text
  if (prominent) {
    return (
      <Pressable
        testID={`question-button-${referenceType}`}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.prominentButton,
          {
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
          },
        ]}
      >
        <Ionicons
          testID="question-icon"
          name="chatbubble-ellipses"
          size={18}
          color={colors.textOnPrimary}
        />
        <Text variant="bodySm" style={{ color: colors.textOnPrimary, fontWeight: '600' }}>
          Preguntar al Coach
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={`question-button-${referenceType}`}
      onPress={handlePress}
      style={({ pressed }) => [
        compact ? styles.compactButton : styles.button,
        {
          backgroundColor: pressed ? colors.surfaceHighlight : 'transparent',
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons
        testID="question-icon"
        name="help-circle-outline"
        size={compact ? 18 : 16}
        color={colors.textMuted}
      />
      {!compact && (
        <Text variant="caption" color="textMuted">
          Preguntar
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prominentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
