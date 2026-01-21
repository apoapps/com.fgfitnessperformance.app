import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  ChatMessage,
  ChatThread,
  ChatReferenceType,
} from '../__mocks__/types/database.types';
import { mockChatThread, mockChatMessages } from '../__mocks__/data/mock-chat';

interface ChatContextType {
  messages: ChatMessage[];
  thread: ChatThread | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  loadMessages: () => Promise<void>;
  sendMessage: (
    content: string,
    referenceType?: ChatReferenceType,
    referenceId?: string,
    referenceTag?: string
  ) => Promise<void>;
  markAsRead: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate async loading with mock data
      await new Promise((resolve) => setTimeout(resolve, 100));

      setThread(mockChatThread);
      setMessages(mockChatMessages);
      setUnreadCount(mockChatThread.unread_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      referenceType?: ChatReferenceType,
      referenceId?: string,
      referenceTag?: string
    ) => {
      // Don't send empty or whitespace-only messages
      if (!content.trim()) {
        return;
      }

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        thread_id: thread?.id || 'thread-new',
        sender: 'user',
        content: content.trim(),
        reference_type: referenceType,
        reference_id: referenceId,
        reference_tag: referenceTag,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // In a real implementation, this would send to Supabase
      // await supabase.from('chat_messages').insert(newMessage);
    },
    [thread]
  );

  const markAsRead = useCallback(async () => {
    setUnreadCount(0);

    // In a real implementation, this would update Supabase
    // Update messages with read_at timestamp
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender === 'coach' && !msg.read_at
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      )
    );

    // Update thread unread count
    if (thread) {
      setThread({ ...thread, unread_count: 0 });
    }
  }, [thread]);

  const value: ChatContextType = {
    messages,
    thread,
    isLoading,
    error,
    unreadCount,
    loadMessages,
    sendMessage,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
