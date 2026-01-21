import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { mockChatThread, mockChatMessages, mockEmptyThread } from '../../__mocks__/data/mock-chat';

// Mock the data module
jest.mock('../../__mocks__/data/mock-chat', () => ({
  mockChatThread: {
    id: 'thread-123',
    client_id: 'mock-user-uuid-12345',
    coach_id: 'coach-uuid-456',
    unread_count: 2,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T14:30:00Z',
  },
  mockChatMessages: [
    {
      id: 'msg-1',
      thread_id: 'thread-123',
      sender: 'user',
      content: 'Test message from user',
      reference_tag: '[Test Reference]',
      reference_type: 'workout',
      reference_id: 'workout-1',
      created_at: '2026-01-20T10:00:00Z',
    },
    {
      id: 'msg-2',
      thread_id: 'thread-123',
      sender: 'coach',
      content: 'Response from coach',
      created_at: '2026-01-20T10:05:00Z',
      read_at: '2026-01-20T10:06:00Z',
    },
  ],
  mockEmptyThread: {
    id: 'thread-empty',
    client_id: 'mock-user-uuid-12345',
    coach_id: 'coach-uuid-456',
    unread_count: 0,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  createMockMessage: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChatProvider>{children}</ChatProvider>
);

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2);
      });
    });
  });

  describe('Send Message', () => {
    it('adds new message to messages array', async () => {
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

    it('new message has sender as user', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      const lastMessage = result.current.messages[result.current.messages.length - 1];
      expect(lastMessage.sender).toBe('user');
    });

    it('new message contains the correct content', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });
      const testContent = 'This is my test message content';

      await act(async () => {
        await result.current.sendMessage(testContent);
      });

      const lastMessage = result.current.messages[result.current.messages.length - 1];
      expect(lastMessage.content).toBe(testContent);
    });

    it('includes reference tag when provided', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

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
      const { result } = renderHook(() => useChat(), { wrapper });

      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(result.current.messages.length).toBe(initialCount);
    });

    it('does not send whitespace-only messages', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      const initialCount = result.current.messages.length;

      await act(async () => {
        await result.current.sendMessage('   ');
      });

      expect(result.current.messages.length).toBe(initialCount);
    });
  });

  describe('Mark As Read', () => {
    it('marks messages as read', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      await act(async () => {
        await result.current.markAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Unread Count', () => {
    it('calculates unreadCount correctly', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      // Thread has unread_count of 2
      expect(result.current.unreadCount).toBe(2);
    });

    it('resets unreadCount to 0 after markAsRead', async () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.unreadCount).toBe(2);

      await act(async () => {
        await result.current.markAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('handles error state', () => {
      const { result } = renderHook(() => useChat(), { wrapper });

      expect(result.current.error).toBeNull();
    });
  });
});
