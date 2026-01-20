import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = async (ui: React.ReactElement) => {
  const result = render(<ThemeProvider>{ui}</ThemeProvider>);
  await waitFor(() => {
    expect(result.queryByTestId('loading')).toBeNull();
  }, { timeout: 100 });
  return result;
};

describe('Card Component', () => {
  it('renders children content', async () => {
    await renderWithTheme(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeTruthy();
  });

  it('renders with testID', async () => {
    await renderWithTheme(
      <Card testID="test-card">
        <Text>Content</Text>
      </Card>
    );
    expect(screen.getByTestId('test-card')).toBeTruthy();
  });

  it('renders default variant', async () => {
    await renderWithTheme(
      <Card testID="default-card" variant="default">
        <Text>Default Card</Text>
      </Card>
    );
    expect(screen.getByTestId('default-card')).toBeTruthy();
  });

  it('renders elevated variant', async () => {
    await renderWithTheme(
      <Card testID="elevated-card" variant="elevated">
        <Text>Elevated Card</Text>
      </Card>
    );
    expect(screen.getByTestId('elevated-card')).toBeTruthy();
  });

  it('renders glass variant', async () => {
    await renderWithTheme(
      <Card testID="glass-card" variant="glass">
        <Text>Glass Card</Text>
      </Card>
    );
    expect(screen.getByTestId('glass-card')).toBeTruthy();
  });

  it('renders with borderLeft accent', async () => {
    await renderWithTheme(
      <Card testID="accent-card" borderLeft>
        <Text>Accent Card</Text>
      </Card>
    );
    expect(screen.getByTestId('accent-card')).toBeTruthy();
  });
});
