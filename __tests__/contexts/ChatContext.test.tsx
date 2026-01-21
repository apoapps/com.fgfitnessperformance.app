import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { mockChatThread, mockChatMessages } from '../../__mocks__/data/mock-chat';
import { supabase } from '@/utils/supabase';

// Mock AuthContext
const mockUser = { id: 'mock-user-uuid-12345' };
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
  }),
}));

// Get references to mocked functions
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Helper to setup supabase mocks for each test
const setupSupabaseMocks = (options: {
  thread?: typeof mockChatThread | null;
  messages?: typeof mockChatMessages;
  insertSuccess?: boolean;
}) => {
  const {
    thread = mockChatThread,
    messages = mockChatMessages,
    insertSuccess = true,
  } = options;

  // Mock from() for chat_threads (get existing thread)
  (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'chat_threads') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: thread,
              error: thread ? null : { code: 'PGRST116', message: 'Not found' },
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: thread,
              error: null,
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      };
    }

    if (table === 'chat_messages') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: messages,
              error: null,
            }),
          }),
        }),
        insert: jest.fn((messageData) => ({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: insertSuccess
                ? {
                    id: 'new-msg-id',
                    thread_id: messageData?.thread_id || thread?.id || 'thread-123',
                    sender_id: messageData?.sender_id || mockUser.id,
                    sender_type: messageData?.sender_type || 'client',
                    content: messageData?.content || 'Test message',
                    reference_type: messageData?.reference_type || null,
                    reference_id: messageData?.reference_id || null,
                    reference_tag: messageData?.reference_tag || null,
                    created_at: new Date().toISOString(),
                  }
                : null,
              error: insertSuccess ? null : { message: 'Insert failed' },
            }),
          }),
        })),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };
    }

    return {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChatProvider>{children}</ChatProvider>
);

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSupabaseMocks({});
  });

  describe('Initial State', () => {
    it('starts with empty messages array', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.messages).toEqual([]);
    });

    it('starts with isLoading as false', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });

    it('starts with unreadCount as 0', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.unreadCount).toBe(0);
    });

    it('starts with no current thread', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.thread).toBeNull();
    });
  });

  describe('Load Messages', () => {
    it('loads messages when loadMessages is called', async () => {
      setupSupabaseMocks({ messages: mockChatMessages });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });
    });

    it('sets isLoading to true while loading', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      act(() => {
        result.current.loadMessages();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('sets isLoading to false after loading completes', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('updates unreadCount from thread data', async () => {
      setupSupabaseMocks({
        thread: { ...mockChatThread, unread_count_client: 2 },
      });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2);
      });
    });

    it('subscribes to realtime updates after loading', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(mockSupabase.channel).toHaveBeenCalled();
    });
  });

  describe('Send Message', () => {
    it('adds new message to messages array (optimistic update)', async () => {
      setupSupabaseMocks({});
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage('New test message');
      });

      expect(result.current.messages.length).toBe(initialCount + 1);
    });

    it('new message has sender_type as client', async () => {
      setupSupabaseMocks({});
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const lastMessage = result.current.messages[result.current.messages.length - 1];
      expect(lastMessage.sender_type).toBe('client');
    });

    it('new message contains the correct content', async () => {
      // Use empty messages to simplify test
      setupSupabaseMocks({ messages: [] });
      const { result } = renderHook(() => useChat(), { wrapper });
      const testContent = 'This is my test message content';

      await act(async () => {
        await result.current.loadMessages();
      });

      await act(async () => {
        await result.current.sendMessage(testContent);
      });

      // After sending, the message should be in the array
      const lastMessage = result.current.messages[result.current.messages.length - 1];
      expect(lastMessage.content).toBe(testContent);
    });

    it('includes reference tag when provided', async () => {
      // Use empty messages to simplify test
      setupSupabaseMocks({ messages: [] });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await act(async () => {
        await result.current.sendMessage(
          'Question about this exercise',
          'exercise',
          'exercise-123',
          '[Día 3 - Press de Banca]'
        );
      });

      const lastMessage = result.current.messages[result.current.messages.length - 1];
      expect(lastMessage.reference_tag).toBe('[Día 3 - Press de Banca]');
      expect(lastMessage.reference_type).toBe('exercise');
      expect(lastMessage.reference_id).toBe('exercise-123');
    });

    it('does not send empty messages', async () => {
      setupSupabaseMocks({});
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(result.current.messages.length).toBe(initialCount);
    });

    it('does not send whitespace-only messages', async () => {
      setupSupabaseMocks({});
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage('   ');
      });

      expect(result.current.messages.length).toBe(initialCount);
    });

    it('inserts message into Supabase', async () => {
      setupSupabaseMocks({});
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await act(async () => {
        await result.current.sendMessage('Test message for Supabase');
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
    });
  });

  describe('Mark As Read', () => {
    it('calls markAsRead and updates Supabase tables', async () => {
      setupSupabaseMocks({
        thread: { ...mockChatThread, unread_count_client: 2 },
      });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAsRead();
      });

      // Verify Supabase was called to update both tables
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_messages');
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_threads');
    });

    it('does nothing when unreadCount is already 0', async () => {
      setupSupabaseMocks({
        thread: { ...mockChatThread, unread_count_client: 0 },
      });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.markAsRead();
      });

      // Should not call update when unread is already 0
      expect(mockSupabase.from).not.toHaveBeenCalledWith('chat_threads');
    });
  });

  describe('Unread Count', () => {
    it('calculates unreadCount correctly from thread', async () => {
      setupSupabaseMocks({
        thread: { ...mockChatThread, unread_count_client: 5 },
      });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.unreadCount).toBe(5);
    });

    it('starts at 0 when thread has no unread messages', async () => {
      setupSupabaseMocks({
        thread: { ...mockChatThread, unread_count_client: 0 },
      });
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('handles error state', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.error).toBeNull();
    });

    it('handles thread fetch error gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      // Should not crash, just have no messages
      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
