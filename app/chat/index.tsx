import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { Text } from '@/components/ui/Text';
import { ChatBubble, ChatInput } from '@/components/chat';
import { ChatMessage, ChatReferenceType } from '../../__mocks__/types/database.types';

export default function ChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { prefill, referenceType, referenceId } = useLocalSearchParams<{
    prefill?: string;
    referenceType?: ChatReferenceType;
    referenceId?: string;
  }>();
  const { messages, sendMessage, loadMessages, isLoading, markAsRead, unreadCount } = useChat();
  const [inputText, setInputText] = useState(prefill || '');
  const hasMarkedRead = useRef(false);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    // Mark messages as read once when messages are loaded and there are unread messages
    if (messages.length > 0 && unreadCount > 0 && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markAsRead();
    }
  }, [messages.length, unreadCount, markAsRead]);

  useEffect(() => {
    // Update input when prefill changes (navigation from QuestionButton)
    if (prefill) {
      setInputText(prefill);
    }
  }, [prefill]);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      // Extract reference tag if present at the start
      const referenceTagMatch = inputText.match(/^\[.*?\]\s*/);
      const referenceTag = referenceTagMatch ? referenceTagMatch[0].trim() : undefined;

      sendMessage(
        inputText,
        referenceType,
        referenceId,
        referenceTag
      );
      setInputText('');
    }
  }, [inputText, sendMessage, referenceType, referenceId]);

  const handlePickImage = useCallback(() => {
    // TODO: Implement image picker
    console.log('Image picker not implemented yet');
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable
              testID="back-button"
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: pressed ? colors.surfaceHighlight : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              })}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <View>
              <Text variant="title" style={{ fontSize: 20 }}>
                Dudas
              </Text>
              <Text variant="caption" color="textMuted">
                Pregunta a tu coach
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          data={[...messages].reverse()}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messageList}
          inverted
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onPickImage={handlePickImage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageList: {
    padding: 20,
    paddingBottom: 8,
  },
});
