import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QuestionButton } from '@/components/chat/QuestionButton';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('QuestionButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders button with correct testID for workout', async () => {
      render(
        <QuestionButton
          referenceType="workout"
          referenceId="workout-123"
          referenceTag="[Semana 1 - Día 3: Push Day]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-workout')).toBeTruthy();
      });
    });

    it('renders button with correct testID for meal', async () => {
      render(
        <QuestionButton
          referenceType="meal"
          referenceId="meal-123"
          referenceTag="[13:00 - Almuerzo]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-meal')).toBeTruthy();
      });
    });

    it('renders button with correct testID for exercise', async () => {
      render(
        <QuestionButton
          referenceType="exercise"
          referenceId="exercise-123"
          referenceTag="[Push Day > Press de Banca]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-exercise')).toBeTruthy();
      });
    });

    it('displays "Preguntar" text', async () => {
      render(
        <QuestionButton
          referenceType="workout"
          referenceId="workout-123"
          referenceTag="[Test]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Preguntar')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to chat with correct params on press', async () => {
      render(
        <QuestionButton
          referenceType="workout"
          referenceId="workout-123"
          referenceTag="[Semana 1 - Día 3: Push Day]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-workout')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('question-button-workout'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/chat',
        params: {
          prefill: '[Semana 1 - Día 3: Push Day] ',
          referenceType: 'workout',
          referenceId: 'workout-123',
        },
      });
    });

    it('generates correct tag for meal reference', async () => {
      render(
        <QuestionButton
          referenceType="meal"
          referenceId="meal-lunch"
          referenceTag="[13:00 - Almuerzo]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-meal')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('question-button-meal'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/chat',
        params: {
          prefill: '[13:00 - Almuerzo] ',
          referenceType: 'meal',
          referenceId: 'meal-lunch',
        },
      });
    });

    it('generates correct tag for exercise reference', async () => {
      render(
        <QuestionButton
          referenceType="exercise"
          referenceId="exercise-bench"
          referenceTag="[Día 3 > Press de Banca]"
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-exercise')).toBeTruthy();
      });

      fireEvent.press(screen.getByTestId('question-button-exercise'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/chat',
        params: {
          prefill: '[Día 3 > Press de Banca] ',
          referenceType: 'exercise',
          referenceId: 'exercise-bench',
        },
      });
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode without text when compact prop is true', async () => {
      render(
        <QuestionButton
          referenceType="workout"
          referenceId="workout-123"
          referenceTag="[Test]"
          compact
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-button-workout')).toBeTruthy();
      });

      expect(screen.queryByText('Preguntar')).toBeNull();
    });

    it('shows icon in compact mode', async () => {
      render(
        <QuestionButton
          referenceType="workout"
          referenceId="workout-123"
          referenceTag="[Test]"
          compact
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId('question-icon')).toBeTruthy();
      });
    });
  });
});
