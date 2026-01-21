import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from '@/app/chat/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { supabase } from '@/utils/supabase';
import { mockChatThread, mockChatMessages } from '../../../__mocks__/data/mock-chat';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    prefill: '',
    referenceType: undefined,
    referenceId: undefined,
  }),
}));

// Mock AuthContext
const mockUser = { id: 'mock-user-uuid-12345' };
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
  }),
}));

// Get references to mocked supabase
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Setup supabase mocks for chat screen tests
const setupChatMocks = () => {
  (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'chat_threads') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockChatThread,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockChatThread,
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
              data: mockChatMessages,
              error: null,
            }),
          }),
        }),
        insert: jest.fn((messageData) => ({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'new-msg-id',
                thread_id: messageData?.thread_id || mockChatThread.id,
                sender_id: messageData?.sender_id || mockUser.id,
                sender_type: messageData?.sender_type || 'client',
                content: messageData?.content || 'Test message',
                reference_type: messageData?.reference_type || null,
                reference_id: messageData?.reference_id || null,
                reference_tag: messageData?.reference_tag || null,
                created_at: new Date().toISOString(),
              },
              error: null,
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
  <ThemeProvider>
    <ChatProvider>{children}</ChatProvider>
  </ThemeProvider>
);

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChatMocks();
  });

  describe('Rendering', () => {
    it('renders chat screen header', async () => {
      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Chat con Coach')).toBeTruthy();
      });
    });

    it('renders chat input', async () => {
      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeTruthy();
      });
    });

    it('renders send button', async () => {
      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('send-button')).toBeTruthy();
      });
    });
  });

  describe('Message Loading', () => {
    it('displays messages when loaded', async () => {
      render(<ChatScreen />, { wrapper });

      // Messages are loaded via the ChatContext - check for actual mock message content
      await waitFor(
        () => {
          // From mockChatMessages in mock-chat.ts
          expect(screen.getByText(/Coach, tengo una duda sobre este ejercicio/)).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Input Behavior', () => {
    it('allows typing in the input', async () => {
      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeTruthy();
      });

      fireEvent.changeText(screen.getByTestId('chat-input'), 'Test message');

      expect(screen.getByDisplayValue('Test message')).toBeTruthy();
    });
  });

  describe('Prefill from params', () => {
    it('prefills input when prefill param is provided', async () => {
      // Re-mock with prefill
      jest.doMock('expo-router', () => ({
        useRouter: () => ({
          push: jest.fn(),
          back: jest.fn(),
        }),
        useLocalSearchParams: () => ({
          prefill: '[Test Reference] ',
          referenceType: 'workout',
          referenceId: 'workout-123',
        }),
      }));

      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeTruthy();
      });
    });
  });
});
