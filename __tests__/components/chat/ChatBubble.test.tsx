import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatMessage } from '@/types/chat';
import { ThemeProvider } from '@/contexts/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const mockUserMessage: ChatMessage = {
  id: 'msg-1',
  thread_id: 'thread-123',
  sender_id: 'user-123',
  sender_type: 'client',
  content: 'This is a user message',
  created_at: '2026-01-20T10:00:00Z',
};

const mockCoachMessage: ChatMessage = {
  id: 'msg-2',
  thread_id: 'thread-123',
  sender_id: 'coach-456',
  sender_type: 'coach',
  content: 'This is a coach response',
  created_at: '2026-01-20T10:05:00Z',
  read_at: '2026-01-20T10:06:00Z',
};

const mockMessageWithReference: ChatMessage = {
  id: 'msg-3',
  thread_id: 'thread-123',
  sender_id: 'user-123',
  sender_type: 'client',
  content: 'Question about this exercise',
  reference_tag: '[Día 3 - Press de Banca]',
  reference_type: 'exercise',
  reference_id: 'exercise-123',
  created_at: '2026-01-20T10:00:00Z',
};

describe('ChatBubble', () => {
  describe('Rendering', () => {
    it('renders user message content', async () => {
      render(<ChatBubble message={mockUserMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('This is a user message')).toBeTruthy();
      });
    });

    it('renders coach message content', async () => {
      render(<ChatBubble message={mockCoachMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('This is a coach response')).toBeTruthy();
      });
    });

    it('displays reference tag when present', async () => {
      render(<ChatBubble message={mockMessageWithReference} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('[Día 3 - Press de Banca]')).toBeTruthy();
      });
    });

    it('displays message timestamp', async () => {
      render(<ChatBubble message={mockUserMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('message-time')).toBeTruthy();
      });
    });
  });

  describe('Styling', () => {
    it('has correct testID for client message', async () => {
      render(<ChatBubble message={mockUserMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-bubble-client')).toBeTruthy();
      });
    });

    it('has correct testID for coach message', async () => {
      render(<ChatBubble message={mockCoachMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-bubble-coach')).toBeTruthy();
      });
    });
  });

  describe('Image Messages', () => {
    it('renders image when image_url is provided', async () => {
      const messageWithImage: ChatMessage = {
        ...mockUserMessage,
        image_url: 'https://example.com/image.jpg',
      };

      render(<ChatBubble message={messageWithImage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-image')).toBeTruthy();
      });
    });

    it('does not render image element when no image_url', async () => {
      render(<ChatBubble message={mockUserMessage} />, { wrapper });

      await waitFor(() => {
        expect(screen.getByTestId('chat-bubble-client')).toBeTruthy();
      });

      expect(screen.queryByTestId('chat-image')).toBeNull();
    });
  });
});
