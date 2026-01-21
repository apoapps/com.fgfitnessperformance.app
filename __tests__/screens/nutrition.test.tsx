import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import NutritionScreen from '@/app/(tabs)/nutrition/index';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NutritionProvider } from '@/contexts/NutritionContext';
import { mockNutritionPlan, mockMacros, mockNutritionDocuments } from '../../__mocks__/data/mock-nutrition';

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

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

const renderNutritionScreen = () => {
  return render(
    <ThemeProvider>
      <NutritionProvider>
        <NutritionScreen />
      </NutritionProvider>
    </ThemeProvider>
  );
};

describe('Nutrition Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMockChain();
  });

  describe('rendering', () => {
    it('renders the nutrition screen with header', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText('Nutrición')).toBeTruthy();
      });
    });

    it('displays macro chart section', async () => {
      const { getByTestId } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByTestId('macro-chart')).toBeTruthy();
      });
    });
  });

  describe('macro display', () => {
    it('displays total calories in center of chart', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(`${mockMacros.calories}`)).toBeTruthy();
      });
    });

    it('displays protein grams', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(`${mockMacros.protein}g`)).toBeTruthy();
      });
    });

    it('displays carbs grams', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(`${mockMacros.carbs}g`)).toBeTruthy();
      });
    });

    it('displays fat grams', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(`${mockMacros.fat}g`)).toBeTruthy();
      });
    });

    it('displays macro labels', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(/proteína/i)).toBeTruthy();
        expect(getByText(/carbos/i)).toBeTruthy();
        expect(getByText(/grasas/i)).toBeTruthy();
      });
    });
  });

  // Note: Meals section tests removed because nutrition_plans table
  // doesn't have a meals column yet. Meals feature pending implementation.

  describe('documents section', () => {
    it('displays documents section when documents exist', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        // mockNutritionPlan has 3 documents
        expect(getByText(/documentos/i)).toBeTruthy();
      });
    });

    it('displays document names from mock', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText('Guia de Suplementacion')).toBeTruthy();
        expect(getByText('Recetas Semana 1')).toBeTruthy();
        expect(getByText('Lista de Compras')).toBeTruthy();
      });
    });

    it('displays PDF icon for documents', async () => {
      const { getAllByTestId } = renderNutritionScreen();

      await waitFor(() => {
        const pdfIcons = getAllByTestId(/document-icon/);
        expect(pdfIcons.length).toBe(3);
      });
    });
  });

  describe('water target', () => {
    it('displays water target section', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        // Look for the specific "Objetivo de Agua" title
        expect(getByText(/objetivo de agua/i)).toBeTruthy();
      });
    });

    it('displays water target amount', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(/3 litros/i)).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('handles loading state gracefully', async () => {
      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText('Nutrición')).toBeTruthy();
      });
    });
  });

  describe('empty state', () => {
    it('shows empty state when no nutrition plan', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(/no tienes plan/i)).toBeTruthy();
      });
    });

    it('shows message to contact coach', async () => {
      mockLimit.mockResolvedValue({ data: [], error: null });

      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText(/contacta/i)).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('displays error message when fetch fails', async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: 'Error de conexión' },
      });

      const { getByText } = renderNutritionScreen();

      await waitFor(() => {
        expect(getByText('Error')).toBeTruthy();
      });
    });
  });
});
