import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { Text } from '@/components/ui/Text';
import { ChatBubble } from '@/components/chat';
import type { ChatMessage, ChatReferenceType } from '@/types/chat';

export default function ChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { prefill, referenceType, referenceId } = useLocalSearchParams<{
    prefill?: string;
    referenceType?: ChatReferenceType;
    referenceId?: string;
  }>();
  const { messages, sendMessage, loadMessages, markAsRead, unreadCount } = useChat();
  const [inputText, setInputText] = useState(prefill || '');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const hasMarkedRead = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Track keyboard height for iOS modal
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length > 0 && unreadCount > 0 && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markAsRead();
    }
  }, [messages.length, unreadCount, markAsRead]);

  useEffect(() => {
    if (prefill) {
      setInputText(prefill);
    }
  }, [prefill]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      const referenceTagMatch = inputText.match(/^\[.*?\]\s*/);
      const referenceTag = referenceTagMatch ? referenceTagMatch[0].trim() : undefined;

      sendMessage(inputText, referenceType, referenceId, referenceTag);
      setInputText('');
      scrollToEnd();
    }
  }, [inputText, sendMessage, referenceType, referenceId, scrollToEnd]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const hasContent = inputText.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - no extra padding since modal handles safe area */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Pressable
            testID="back-button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.surfaceHighlight : 'transparent' },
            ]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <View>
            <Text variant="title" style={styles.headerTitle}>
              Chat con Coach
            </Text>
            <Text variant="caption" color="textMuted">
              Pregunta tus dudas
            </Text>
          </View>
        </View>
      </View>

      {/* Messages List - KeyboardAvoidingView only for Android, iOS uses manual padding */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? undefined : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
          scrollEventThrottle={16}
        />

        {/* Input at bottom - uses keyboardHeight on iOS for modals */}
        <View
          style={[
            styles.inputContainer,
            {
              // On iOS modals, KeyboardAvoidingView doesn't work well
              // So we manually add padding based on keyboard height
              paddingBottom: Platform.OS === 'ios'
                ? (keyboardHeight > 0 ? keyboardHeight : insets.bottom || 8)
                : (insets.bottom || 8),
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              testID="chat-input"
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceHighlight,
                  color: colors.text,
                },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              onFocus={scrollToEnd}
            />

            <Pressable
              testID="send-button"
              onPress={handleSend}
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    // Ensures input stays above keyboard on iOS
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
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
