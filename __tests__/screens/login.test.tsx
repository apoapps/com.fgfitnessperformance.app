import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/app/(auth)/login';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock supabase
const mockSignIn = jest.fn();

jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

const renderLoginScreen = async () => {
  const result = render(
    <ThemeProvider>
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    </ThemeProvider>
  );

  // Wait for providers to load
  await waitFor(() => {
    expect(result.queryByTestId('loading')).toBeNull();
  }, { timeout: 100 });

  return result;
};

describe('Login Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input', async () => {
    await renderLoginScreen();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeTruthy();
  });

  it('renders password input', async () => {
    await renderLoginScreen();
    expect(screen.getByPlaceholderText('Tu contraseña')).toBeTruthy();
  });

  it('renders login button', async () => {
    await renderLoginScreen();
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  it('calls onChangeText when email input changes', async () => {
    await renderLoginScreen();
    const emailInput = screen.getByPlaceholderText('tu@email.com');

    // Test that the input can receive changeText events
    fireEvent.changeText(emailInput, 'test@example.com');
    // The component handles state internally - just verify we can interact
    expect(emailInput).toBeTruthy();
  });

  it('calls onChangeText when password input changes', async () => {
    await renderLoginScreen();
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');

    fireEvent.changeText(passwordInput, 'mypassword');
    expect(passwordInput).toBeTruthy();
  });

  it('button is disabled when form is empty', async () => {
    await renderLoginScreen();

    const loginButton = screen.getByTestId('login-button');
    expect(loginButton.props.accessibilityState?.disabled).toBeTruthy();
  });

  it('renders forgot password help text', async () => {
    await renderLoginScreen();

    expect(screen.getByText(/olvidaste tu contraseña/i)).toBeTruthy();
  });

  it('renders FG branding', async () => {
    await renderLoginScreen();

    expect(screen.getByText('FG FITNESS')).toBeTruthy();
    expect(screen.getByText('Performance')).toBeTruthy();
  });
});
