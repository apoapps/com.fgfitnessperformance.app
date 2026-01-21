import React from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onPickImage: () => void;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onPickImage,
}: ChatInputProps) {
  const { colors } = useTheme();
  const hasContent = value.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Pressable
        testID="image-picker-button"
        onPress={onPickImage}
        style={({ pressed }) => [
          styles.iconButton,
          {
            backgroundColor: pressed ? colors.surfaceHighlight : 'transparent',
          },
        ]}
      >
        <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
      </Pressable>

      <TextInput
        testID="chat-input"
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceHighlight,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Escribe tu mensaje..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={1000}
      />

      <Pressable
        testID="send-button"
        onPress={onSend}
        disabled={!hasContent}
        accessibilityState={{ disabled: !hasContent }}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: hasContent
              ? pressed
                ? colors.primaryDark
                : colors.primary
              : colors.surfaceHighlight,
            opacity: hasContent ? 1 : 0.5,
          },
        ]}
      >
        <Ionicons
          name="send"
          size={18}
          color={hasContent ? colors.background : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
