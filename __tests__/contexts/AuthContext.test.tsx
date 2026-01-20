import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Text } from 'react-native';

// Test component that uses the auth context
const TestConsumer = () => {
  const { user, session, isAuthenticated, isLoading, error } = useAuth();
  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'loaded'}</Text>
      <Text testID="authenticated">{isAuthenticated ? 'true' : 'false'}</Text>
      <Text testID="user">{user?.email || 'no-user'}</Text>
      <Text testID="error">{error || 'no-error'}</Text>
    </>
  );
};

const renderAuthContext = () => {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
};

// Mock supabase
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback);
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      },
    },
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('initializes with isAuthenticated = false', async () => {
    const { getByTestId } = renderAuthContext();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    expect(getByTestId('authenticated').props.children).toBe('false');
  });

  it('initializes with no user', async () => {
    const { getByTestId } = renderAuthContext();

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('loaded');
    });

    expect(getByTestId('user').props.children).toBe('no-user');
  });

  it('sets isAuthenticated to true on successful sign in', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'token',
    };
    mockSignIn.mockResolvedValue({ data: { session: mockSession }, error: null });

    const TestSignIn = () => {
      const { signIn, isAuthenticated, user } = useAuth();
      return (
        <>
          <Text testID="authenticated">{isAuthenticated ? 'true' : 'false'}</Text>
          <Text testID="user">{user?.email || 'no-user'}</Text>
          <Text testID="signin" onPress={() => signIn('test@example.com', 'password')}>
            Sign In
          </Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestSignIn />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('authenticated')).toBeTruthy();
    });

    // Trigger sign in
    await act(async () => {
      getByTestId('signin').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('true');
    });

    expect(getByTestId('user').props.children).toBe('test@example.com');
  });

  it('shows error on failed sign in', async () => {
    mockSignIn.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid credentials' },
    });

    const TestSignIn = () => {
      const { signIn, error } = useAuth();
      return (
        <>
          <Text testID="error">{error || 'no-error'}</Text>
          <Text testID="signin" onPress={() => signIn('test@example.com', 'wrong')}>
            Sign In
          </Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestSignIn />
      </AuthProvider>
    );

    await act(async () => {
      getByTestId('signin').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('error').props.children).toBe('Invalid credentials');
    });
  });

  it('clears session and user on sign out', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'token',
    };
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockSignOut.mockResolvedValue({ error: null });

    const TestSignOut = () => {
      const { signOut, isAuthenticated, user } = useAuth();
      return (
        <>
          <Text testID="authenticated">{isAuthenticated ? 'true' : 'false'}</Text>
          <Text testID="user">{user?.email || 'no-user'}</Text>
          <Text testID="signout" onPress={() => signOut()}>
            Sign Out
          </Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestSignOut />
      </AuthProvider>
    );

    // Wait for initial session load
    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('true');
    });

    // Trigger sign out
    await act(async () => {
      getByTestId('signout').props.onPress();
    });

    await waitFor(() => {
      expect(getByTestId('authenticated').props.children).toBe('false');
    });

    expect(getByTestId('user').props.children).toBe('no-user');
  });
});
