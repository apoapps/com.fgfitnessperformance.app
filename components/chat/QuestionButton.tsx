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
}

export function QuestionButton({
  referenceType,
  referenceId,
  referenceTag,
  compact = false,
}: QuestionButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: '/chat',
      params: {
        prefill: `${referenceTag} `,
        referenceType,
        referenceId,
      },
    });
  };

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
});
