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
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { Text, DoodleBackground } from '@/components/ui';
import { ChatBubble } from '@/components/chat';
import type { ChatMessage, ChatReferenceType } from '@/types/chat';

// Mini logos for header
const MiniLogoBlanco = require('../../assets/mini-logo-blanco.svg');
const MiniLogoNegro = require('../../assets/mini-logo-negro.svg');

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { referenceType, referenceId, referenceTag } = useLocalSearchParams<{
    referenceType?: ChatReferenceType;
    referenceId?: string;
    referenceTag?: string;
  }>();
  const { messages, thread, sendMessage, loadMessages, markAsRead, unreadCount } = useChat();
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeReference, setActiveReference] = useState<{
    type: ChatReferenceType;
    id: string;
    tag: string;
  } | null>(null);
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

  // Set active reference from URL params and auto-focus input
  useEffect(() => {
    if (referenceType && referenceTag) {
      setActiveReference({
        type: referenceType,
        id: referenceId || '',
        tag: referenceTag,
      });
      // Auto-focus input when opening with a reference
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [referenceType, referenceId, referenceTag]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      // Send with reference metadata (tag is shown separately in ChatBubble)
      sendMessage(
        inputText.trim(),
        activeReference?.type,
        activeReference?.id,
        activeReference?.tag
      );
      setInputText('');
      setActiveReference(null); // Clear reference after sending
      scrollToEnd();
    }
  }, [inputText, sendMessage, activeReference, scrollToEnd]);

  const clearReference = useCallback(() => {
    setActiveReference(null);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const hasContent = inputText.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.chatBackground }]}>
      {/* Subtle doodle pattern background */}
      <DoodleBackground opacity={0.025} scale={0.12} spacing={100} />

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <Image
              source={isDark ? MiniLogoBlanco : MiniLogoNegro}
              style={{ width: 32, height: 24 }}
              contentFit="contain"
            />
            <View style={{ flex: 1 }}>
              <Text variant="title" style={styles.headerTitle}>
                Chat con Coach
              </Text>
              <Text variant="caption" color="textMuted">
                {thread?.assigned_staff?.full_name
                  ? `Te atiende: ${thread.assigned_staff.full_name}`
                  : 'Pregunta tus dudas'}
              </Text>
            </View>
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
          {/* Reference chip - shown above input when there's an active reference */}
          {activeReference && (
            <View style={[styles.referenceChipContainer, { borderTopColor: colors.border }]}>
              <View style={[styles.referenceChip, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons
                  name={activeReference.type === 'exercise' ? 'barbell' : 'calendar'}
                  size={14}
                  color={colors.primary}
                />
                <Text variant="caption" style={{ color: colors.primary, flex: 1 }} numberOfLines={1}>
                  {activeReference.tag.replace(/[\[\]]/g, '')}
                </Text>
                <Pressable
                  onPress={clearReference}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                >
                  <Ionicons name="close-circle" size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          )}

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderTopColor: activeReference ? 'transparent' : colors.border,
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
              placeholder={activeReference ? 'Escribe tu duda...' : 'Escribe tu mensaje...'}
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
                },
              ]}
            >
              <Ionicons
                name="send"
                size={20}
                color={hasContent ? colors.textOnPrimary : colors.text}
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
  referenceChipContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  referenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
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
