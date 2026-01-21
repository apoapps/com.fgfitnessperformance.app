import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NutritionProvider, useNutrition } from '@/contexts/NutritionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { mockNutritionPlan, mockMacros, mockNutritionDocuments } from '../../__mocks__/data/mock-nutrition';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

// Mock AuthContext
const mockUser = { id: 'mock-user-uuid-12345', email: 'apocor.alex@gmail.com' };

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    session: { user: mockUser },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    clearError: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Setup mock chain for nutrition_plans table
const setupMockChain = () => {
  mockLimit.mockResolvedValue({ data: [mockNutritionPlan], error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockFrom.mockReturnValue({
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    }),
  });
};

// Test consumer component
const TestConsumer = () => {
  const {
    activePlan,
    isLoading,
    error,
    macros,
    meals,
    documents,
    waterTarget,
    getMacroPercentages,
  } = useNutrition();

  const percentages = getMacroPercentages();

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
      <Text testID="hasActivePlan">{activePlan ? 'yes' : 'no'}</Text>
      <Text testID="protein">{macros?.protein || 0}</Text>
      <Text testID="carbs">{macros?.carbs || 0}</Text>
      <Text testID="fat">{macros?.fat || 0}</Text>
      <Text testID="calories">{macros?.calories || 0}</Text>
      <Text testID="mealsCount">{meals.length}</Text>
      <Text testID="documentsCount">{documents.length}</Text>
      <Text testID="waterTarget">{waterTarget}</Text>
      <Text testID="proteinPercentage">{percentages.protein}</Text>
    </>
  );
};

const renderNutritionContext = () => {
  return render(
    <ThemeProvider>
      <NutritionProvider>
        <TestConsumer />
      </NutritionProvider>
    </ThemeProvider>
  );
};

describe('NutritionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
  });

  describe('initial state and loading', () => {
    it('starts with loading true and transitions to loaded', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });
    });

    it('has no error initially', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('error').props.children).toBe('no-error');
    });
  });

  describe('loading nutrition plan', () => {
    it('fetches nutrition from Supabase when user is authenticated', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(mockFrom).toHaveBeenCalledWith('nutrition_plans');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });

    it('identifies the active nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('hasActivePlan').props.children).toBe('yes');
      });
    });

    it('sets error when fetch fails', async () => {
      mockLimit.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('error').props.children).toBe('Network error');
      });

      expect(getByTestId('hasActivePlan').props.children).toBe('no');
    });
  });

  describe('macros extraction', () => {
    it('extracts protein from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('protein').props.children).toBe(mockMacros.protein);
      });
    });

    it('extracts carbs from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('carbs').props.children).toBe(mockMacros.carbs);
      });
    });

    it('extracts fat from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('fat').props.children).toBe(mockMacros.fat);
      });
    });

    it('extracts calories from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('calories').props.children).toBe(mockMacros.calories);
      });
    });
  });

  describe('meals extraction', () => {
    it('returns empty meals array (meals not stored in nutrition_plans table)', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        // nutrition_plans table doesn't have meals column yet
        expect(getByTestId('mealsCount').props.children).toBe(0);
      });
    });
  });

  describe('documents extraction', () => {
    it('extracts documents array from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        // mockAssignedNutrition has 3 documents
        expect(getByTestId('documentsCount').props.children).toBe(3);
      });
    });
  });

  describe('water target', () => {
    it('extracts water target from nutrition plan', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('waterTarget').props.children).toBe(3.0);
      });
    });
  });

  describe('macro percentages calculation', () => {
    it('calculates protein percentage correctly', async () => {
      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        // protein: 180g * 4 = 720 cal
        // carbs: 250g * 4 = 1000 cal
        // fat: 65g * 9 = 585 cal
        // total: 2305 cal
        // protein %: 720 / 2305 = ~31%
        const percentage = parseInt(getByTestId('proteinPercentage').props.children);
        expect(percentage).toBeGreaterThan(25);
        expect(percentage).toBeLessThan(35);
      });
    });
  });

  describe('empty state', () => {
    it('handles no nutrition plan gracefully', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByTestId } = renderNutritionContext();

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loaded');
      });

      expect(getByTestId('hasActivePlan').props.children).toBe('no');
      expect(getByTestId('mealsCount').props.children).toBe(0);
    });
  });
});

describe('useNutrition outside provider', () => {
  it('throws error when used outside NutritionProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestThrow = () => {
      useNutrition();
      return null;
    };

    expect(() => {
      render(<TestThrow />);
    }).toThrow('useNutrition must be used within a NutritionProvider');

    consoleSpy.mockRestore();
  });
});
