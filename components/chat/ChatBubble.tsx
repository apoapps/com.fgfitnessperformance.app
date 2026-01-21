import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui/Text';
import type { ChatMessage } from '@/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { colors } = useTheme();
  const isUser = message.sender_type === 'client';

  return (
    <View
      testID={`chat-bubble-${message.sender_type}`}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.coachContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.surfaceHighlight,
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
          },
        ]}
      >
        {message.reference_tag && (
          <View
            style={[
              styles.referenceTag,
              { backgroundColor: isUser ? 'rgba(0,0,0,0.15)' : colors.surface },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: isUser ? colors.background : colors.textMuted,
                fontWeight: '600',
              }}
            >
              {message.reference_tag}
            </Text>
          </View>
        )}

        {message.image_url && (
          <Image
            testID="chat-image"
            source={{ uri: message.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text
          variant="body"
          style={{
            color: isUser ? colors.background : colors.text,
          }}
        >
          {message.content}
        </Text>

        <Text
          testID="message-time"
          variant="caption"
          style={{
            color: isUser ? 'rgba(0,0,0,0.5)' : colors.textMuted,
            alignSelf: 'flex-end',
            marginTop: 4,
          }}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  coachContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  referenceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
});
