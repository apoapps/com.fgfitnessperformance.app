import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ExerciseRow } from '@/components/workout/ExerciseRow';
import { ThemeProvider } from '@/contexts/ThemeContext';
import type { BlockExercise } from '@/types/workout';

const mockExercise: BlockExercise = {
  id: 'ex-test-001',
  exercise_id: 'lib-ex-001',
  exercise_name: 'Sentadilla con Barra',
  sets: 4,
  reps: '8-10',
  rest: 90,
  notes: 'Control excéntrico de 3 segundos',
  weight: 'RPE 7',
};

const mockExerciseMinimal: BlockExercise = {
  id: 'ex-test-002',
  exercise_id: 'lib-ex-002',
  exercise_name: 'Plancha',
  sets: 1,
  reps: '60s',
  rest: 0,
};

const renderExerciseRow = (exercise: BlockExercise, props?: { onPress?: () => void; compact?: boolean }) => {
  return render(
    <ThemeProvider>
      <ExerciseRow exercise={exercise} {...props} />
    </ThemeProvider>
  );
};

describe('ExerciseRow', () => {
  describe('rendering', () => {
    it('renders exercise name', async () => {
      const { getByText } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
      });
    });

    it('renders sets and reps', async () => {
      const { getByText } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(getByText(/4 SERIES/)).toBeTruthy();
        expect(getByText(/8-10 REPS/)).toBeTruthy();
      });
    });

    it('has correct testID', async () => {
      const { getByTestId } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(getByTestId('exercise-row-ex-test-001')).toBeTruthy();
      });
    });
  });

  describe('rest time display', () => {
    it('renders rest time when > 0', async () => {
      const { getByText } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(getByText(/90s DESC/)).toBeTruthy();
      });
    });

    it('does not render rest time when 0', async () => {
      const { queryByText } = renderExerciseRow(mockExerciseMinimal);
      await waitFor(() => {
        expect(queryByText(/DESC/)).toBeNull();
      });
    });
  });

  describe('weight/RPE display', () => {
    it('renders weight when available', async () => {
      const { getByText } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(getByText('RPE 7')).toBeTruthy();
      });
    });

    it('does not render weight when not provided', async () => {
      const { queryByText } = renderExerciseRow(mockExerciseMinimal);
      await waitFor(() => {
        expect(queryByText(/RPE/)).toBeNull();
      });
    });
  });

  describe('notes display', () => {
    it('renders notes in non-compact mode', async () => {
      const { getByText } = renderExerciseRow(mockExercise, { compact: false });
      await waitFor(() => {
        expect(getByText('Control excéntrico de 3 segundos')).toBeTruthy();
      });
    });

    it('hides notes in compact mode', async () => {
      const { queryByText } = renderExerciseRow(mockExercise, { compact: true });
      await waitFor(() => {
        expect(queryByText('Control excéntrico de 3 segundos')).toBeNull();
      });
    });
  });

  describe('interaction', () => {
    it('calls onPress when pressed', async () => {
      const onPress = jest.fn();
      const { getByTestId } = renderExerciseRow(mockExercise, { onPress });

      await waitFor(() => {
        expect(getByTestId('exercise-row-ex-test-001')).toBeTruthy();
      });

      fireEvent.press(getByTestId('exercise-row-ex-test-001'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows arrow indicator when onPress is provided', async () => {
      const { getByText } = renderExerciseRow(mockExercise, { onPress: jest.fn() });
      await waitFor(() => {
        expect(getByText('→')).toBeTruthy();
      });
    });

    it('hides arrow indicator when onPress is not provided', async () => {
      const { queryByText } = renderExerciseRow(mockExercise);
      await waitFor(() => {
        expect(queryByText('→')).toBeNull();
      });
    });
  });

  describe('compact mode', () => {
    it('renders with compact styling', async () => {
      const { getByText } = renderExerciseRow(mockExercise, { compact: true });
      await waitFor(() => {
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
      });
    });

    it('renders with non-compact styling', async () => {
      const { getByText } = renderExerciseRow(mockExercise, { compact: false });
      await waitFor(() => {
        expect(getByText('Sentadilla con Barra')).toBeTruthy();
      });
    });
  });

  describe('single set display', () => {
    it('does not show series when sets is 1', async () => {
      const { queryByText } = renderExerciseRow(mockExerciseMinimal);
      await waitFor(() => {
        expect(queryByText(/SERIES/)).toBeNull();
      });
    });
  });
});
