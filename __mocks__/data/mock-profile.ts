import type { Profile } from '../types/database.types';

export const mockProfile: Profile = {
  id: 'mock-user-uuid-12345',
  email: 'apocor.alex@gmail.com',
  full_name: 'Alex Forge',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  stripe_customer_id: 'cus_mock123',
  subscription_status: 'active',
  subscription_tier: 'premium',
  access_tags: ['workout', 'nutrition'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-19T00:00:00Z',
  notes: null,
  user_status: 'stripe',
  stripe_product_id: 'prod_mock123',
};

export const mockProfileInactive: Profile = {
  ...mockProfile,
  id: 'mock-user-inactive-uuid',
  subscription_status: 'inactive',
  subscription_tier: null,
  access_tags: [],
};

export const mockProfileTrialing: Profile = {
  ...mockProfile,
  id: 'mock-user-trialing-uuid',
  subscription_status: 'trialing',
  subscription_tier: 'fitness',
  access_tags: ['workout'],
};

export const mockProfileWorkoutOnly: Profile = {
  ...mockProfile,
  id: 'mock-user-workout-only-uuid',
  subscription_tier: 'fitness',
  access_tags: ['workout'],
};
