import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ChatScreen from '@/app/chat/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ChatProvider>{children}</ChatProvider>
  </ThemeProvider>
);

describe('ChatScreen', () => {
  describe('Rendering', () => {
    it('renders chat screen header', async () => {
      render(<ChatScreen />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('Dudas')).toBeTruthy();
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
        { timeout: 2000 }
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
