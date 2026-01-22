import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';
import {
  ChatMessage,
  ChatThread,
  ChatReferenceType,
  ChatMessageRow,
  ChatThreadRow,
  chatMessageFromRow,
  chatThreadFromRow,
} from '@/types/chat';

// Re-export types for consumers
export type { ChatMessage, ChatThread, ChatReferenceType };

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
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Get or create thread for the current user
  const getOrCreateThread = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // First try to get existing thread with assigned staff info
      const { data: existingThread, error: fetchError } = await supabase
        .from('chat_threads')
        .select('*, assigned_staff:profiles!chat_threads_assigned_staff_id_profiles_fkey(id, full_name, avatar_url)')
        .eq('client_id', user.id)
        .single();

      if (existingThread && !fetchError) {
        const threadData = chatThreadFromRow(existingThread as ChatThreadRow);
        setThread(threadData);
        setUnreadCount(threadData.unread_count_client);
        return threadData.id;
      }

      // If not exists, create new thread
      const { data: newThread, error: insertError } = await supabase
        .from('chat_threads')
        .insert({ client_id: user.id })
        .select('*, assigned_staff:profiles!chat_threads_assigned_staff_id_profiles_fkey(id, full_name, avatar_url)')
        .single();

      if (insertError) {
        console.error('Error creating thread:', insertError);
        setError('No se pudo crear el chat');
        return null;
      }

      const threadData = chatThreadFromRow(newThread as ChatThreadRow);
      setThread(threadData);
      setUnreadCount(0);
      return threadData.id;
    } catch (err) {
      console.error('Error in getOrCreateThread:', err);
      setError('Error al inicializar el chat');
      return null;
    }
  }, [user?.id]);

  // Load messages from Supabase
  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const threadId = await getOrCreateThread();
      if (!threadId) {
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching messages:', fetchError);
        setError('No se pudieron cargar los mensajes');
        return;
      }

      const loadedMessages = (data as ChatMessageRow[]).map(chatMessageFromRow);
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getOrCreateThread]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!thread?.id) return;

    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to new messages in this thread
    const channel = supabase
      .channel(`chat:${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${thread.id}`,
        },
        async (payload) => {
          // Fetch sender info for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', (payload.new as { sender_id: string }).sender_id)
            .single();

          const messageWithSender = {
            ...payload.new,
            sender,
          } as ChatMessageRow;

          const newMessage = chatMessageFromRow(messageWithSender);
          setMessages((prev) => {
            // Avoid duplicates - check by ID or by temp ID (optimistic messages)
            const isDuplicate = prev.some((m) =>
              m.id === newMessage.id ||
              // Also check if there's an optimistic message with same content (temp-xxx IDs)
              (m.id.startsWith('temp-') &&
               m.content === newMessage.content &&
               m.sender_id === newMessage.sender_id)
            );
            if (isDuplicate) {
              // Replace optimistic message with real one if exists
              return prev.map((m) =>
                m.id.startsWith('temp-') &&
                m.content === newMessage.content &&
                m.sender_id === newMessage.sender_id
                  ? newMessage
                  : m
              );
            }
            return [...prev, newMessage];
          });

          // If message is from coach, increment unread count
          if (newMessage.sender_type === 'coach') {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_threads',
          filter: `id=eq.${thread.id}`,
        },
        async (payload) => {
          const rawThread = payload.new as { assigned_staff_id?: string | null; unread_count_client?: number };
          // If assigned_staff_id changed, re-fetch to get staff profile info
          if (rawThread.assigned_staff_id !== thread.assigned_staff_id) {
            const { data: refreshedThread } = await supabase
              .from('chat_threads')
              .select('*, assigned_staff:profiles!chat_threads_assigned_staff_id_profiles_fkey(id, full_name, avatar_url)')
              .eq('id', thread.id)
              .single();
            if (refreshedThread) {
              const updatedThread = chatThreadFromRow(refreshedThread as ChatThreadRow);
              setThread(updatedThread);
              setUnreadCount(updatedThread.unread_count_client);
              return;
            }
          }
          // Otherwise just update with basic fields from payload
          setThread((prev) => prev ? {
            ...prev,
            unread_count_client: rawThread.unread_count_client ?? prev.unread_count_client,
          } : prev);
          if (rawThread.unread_count_client !== undefined) {
            setUnreadCount(rawThread.unread_count_client);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [thread?.id, thread?.assigned_staff_id]);

  // Send a message
  const sendMessage = useCallback(
    async (
      content: string,
      referenceType?: ChatReferenceType,
      referenceId?: string,
      referenceTag?: string
    ) => {
      if (!content.trim() || !user?.id || !thread?.id) {
        return;
      }

      // Validate if referenceId is a valid UUID (reference_id column expects UUID)
      const isValidUUID = referenceId
        ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(referenceId)
        : false;

      const messageData = {
        thread_id: thread.id,
        sender_id: user.id,
        sender_type: 'client' as const,
        content: content.trim(),
        reference_type: referenceType || null,
        reference_id: isValidUUID ? referenceId : null, // Only send if valid UUID
        reference_tag: referenceTag || null,
      };

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        id: tempId,
        ...messageData,
        reference_type: referenceType,
        reference_id: referenceId,
        reference_tag: referenceTag,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const { data, error: insertError } = await supabase
          .from('chat_messages')
          .insert(messageData)
          .select()
          .single();

        if (insertError) {
          console.error('Error sending message:', insertError);
          // Remove optimistic message on error
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setError('No se pudo enviar el mensaje');
          return;
        }

        // Replace optimistic message with real one
        const realMessage = chatMessageFromRow(data as ChatMessageRow);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? realMessage : m))
        );
      } catch (err) {
        console.error('Error sending message:', err);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError('Error al enviar el mensaje');
      }
    },
    [user?.id, thread?.id]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!thread?.id || !user?.id || unreadCount === 0) return;

    try {
      // Update unread messages (from coach) to read
      await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', thread.id)
        .eq('sender_type', 'coach')
        .is('read_at', null);

      // Reset client unread count
      await supabase
        .from('chat_threads')
        .update({ unread_count_client: 0 })
        .eq('id', thread.id);

      setUnreadCount(0);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_type === 'coach' && !msg.read_at
            ? { ...msg, read_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [thread?.id, user?.id, unreadCount]);

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
