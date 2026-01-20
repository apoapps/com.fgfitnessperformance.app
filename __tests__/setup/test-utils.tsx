import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Import providers (will be created later)
// import { AuthProvider } from '@/contexts/AuthContext';
// import { ProfileProvider } from '@/contexts/ProfileContext';
// import { WorkoutProvider } from '@/contexts/WorkoutContext';
// import { NutritionProvider } from '@/contexts/NutritionContext';
// import { SyncProvider } from '@/contexts/SyncContext';
// import { ThemeProvider } from '@/contexts/ThemeContext';

interface ProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper for integration tests
const AllProviders = ({ children }: ProvidersProps) => {
  // TODO: Add providers as they are implemented
  // return (
  //   <AuthProvider>
  //     <SyncProvider>
  //       <ProfileProvider>
  //         <WorkoutProvider>
  //           <NutritionProvider>
  //             {children}
  //           </NutritionProvider>
  //         </WorkoutProvider>
  //       </ProfileProvider>
  //     </SyncProvider>
  //   </AuthProvider>
  // );
  return <>{children}</>;
};

// Custom render with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Helper to create mock contexts for specific tests
export const createMockAuthContext = (overrides = {}) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  refreshSession: jest.fn(),
  ...overrides,
});

export const createMockProfileContext = (overrides = {}) => ({
  profile: null,
  subscriptionTier: null,
  subscriptionStatus: 'inactive',
  loading: false,
  loadProfile: jest.fn(),
  refreshFromRemote: jest.fn(),
  ...overrides,
});

export const createMockWorkoutContext = (overrides = {}) => ({
  workouts: [],
  activeWorkout: null,
  currentWeek: 1,
  loading: false,
  loadWorkouts: jest.fn(),
  setActiveWorkout: jest.fn(),
  getWorkoutById: jest.fn(),
  ...overrides,
});

export const createMockNutritionContext = (overrides = {}) => ({
  nutritionPlan: null,
  macros: null,
  meals: [],
  waterTarget: 2.5,
  documents: [],
  loading: false,
  loadNutrition: jest.fn(),
  ...overrides,
});

export const createMockSyncContext = (overrides = {}) => ({
  lastSyncDate: null,
  isSyncing: false,
  isOnline: true,
  syncError: null,
  triggerSync: jest.fn(),
  checkConnectivity: jest.fn(),
  getSyncStatus: jest.fn(),
  ...overrides,
});
