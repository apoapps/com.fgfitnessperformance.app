// Supabase client mock for testing

export const mockSupabaseAuth = {
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  getUser: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: {
      subscription: {
        unsubscribe: jest.fn(),
      },
    },
  })),
  refreshSession: jest.fn(),
};

export const mockSupabaseFrom = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(),
      order: jest.fn(() => ({
        limit: jest.fn(),
      })),
    })),
    order: jest.fn(),
  })),
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn(),
    })),
  })),
  update: jest.fn(() => ({
    eq: jest.fn(() => ({
      is: jest.fn(),
    })),
  })),
  delete: jest.fn(),
}));

export const mockSupabaseChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  unsubscribe: jest.fn(),
};

export const mockSupabase = {
  auth: mockSupabaseAuth,
  from: mockSupabaseFrom,
  channel: jest.fn(() => mockSupabaseChannel),
  removeChannel: jest.fn(),
  rpc: jest.fn(),
};

// Helper to reset all mocks
export const resetSupabaseMocks = () => {
  mockSupabaseAuth.signInWithPassword.mockReset();
  mockSupabaseAuth.signOut.mockReset();
  mockSupabaseAuth.getSession.mockReset();
  mockSupabaseAuth.getUser.mockReset();
  mockSupabaseAuth.onAuthStateChange.mockReset();
  mockSupabaseAuth.refreshSession.mockReset();
  mockSupabaseFrom.mockClear();
  mockSupabase.channel.mockClear();
  mockSupabase.removeChannel.mockClear();
  mockSupabase.rpc.mockReset();
};

// Helper to mock successful sign in
export const mockSuccessfulSignIn = (user = mockUser, session = mockSession) => {
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user, session },
    error: null,
  });
};

// Helper to mock failed sign in
export const mockFailedSignIn = (errorMessage = 'Invalid login credentials') => {
  mockSupabaseAuth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: errorMessage },
  });
};

// Mock user object
export const mockUser = {
  id: 'mock-user-uuid-12345',
  email: 'apocor.alex@gmail.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
};

// Mock session object
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};
