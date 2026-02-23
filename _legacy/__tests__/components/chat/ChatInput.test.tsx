import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ChatInput } from '@/components/chat/ChatInput';
import { ThemeProvider } from '@/contexts/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ChatInput', () => {
  const mockOnSend = jest.fn();
  const mockOnChangeText = jest.fn();
  const mockOnPickImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders text input', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeTruthy();
      });
    });

    it('renders send button', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('send-button')).toBeTruthy();
      });
    });

    it('renders image picker button', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('image-picker-button')).toBeTruthy();
      });
    });

    it('displays placeholder text', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeTruthy();
      });
    });
  });

  describe('Input Behavior', () => {
    it('displays provided value', async () => {
      render(
        <ChatInput
          value="Test message"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test message')).toBeTruthy();
      });
    });

    it('calls onChangeText when text changes', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('chat-input')).toBeTruthy();
      });

      fireEvent.changeText(screen.getByTestId('chat-input'), 'New text');

      expect(mockOnChangeText).toHaveBeenCalledWith('New text');
    });
  });

  describe('Send Button', () => {
    it('calls onSend when send button is pressed', async () => {
      render(
        <ChatInput
          value="Test message"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('send-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('send-button'));

      expect(mockOnSend).toHaveBeenCalled();
    });

    it('send button is disabled when value is empty', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        const sendButton = screen.getByTestId('send-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('send button is enabled when value has content', async () => {
      render(
        <ChatInput
          value="Has content"
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        const sendButton = screen.getByTestId('send-button');
        expect(sendButton.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('Image Picker', () => {
    it('calls onPickImage when image button is pressed', async () => {
      render(
        <ChatInput
          value=""
          onChangeText={mockOnChangeText}
          onSend={mockOnSend}
          onPickImage={mockOnPickImage}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('image-picker-button')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('image-picker-button'));

      expect(mockOnPickImage).toHaveBeenCalled();
    });
  });
});
