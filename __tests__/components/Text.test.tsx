import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from '@/components/ui/Text';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = async (ui: React.ReactElement) => {
  const result = render(<ThemeProvider>{ui}</ThemeProvider>);
  // Wait for ThemeProvider to load
  await waitFor(() => {
    expect(result.queryByTestId('loading')).toBeNull();
  }, { timeout: 100 });
  return result;
};

describe('Text Component', () => {
  it('renders text content', async () => {
    await renderWithTheme(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders uppercase when prop is true', async () => {
    await renderWithTheme(<Text uppercase>hello</Text>);
    expect(screen.getByText('HELLO')).toBeTruthy();
  });

  it('applies hero variant styles', async () => {
    await renderWithTheme(<Text variant="hero">Hero Text</Text>);
    const text = screen.getByText('Hero Text');
    expect(text).toBeTruthy();
  });

  it('applies title variant styles', async () => {
    await renderWithTheme(<Text variant="title">Title</Text>);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('applies section variant with uppercase', async () => {
    await renderWithTheme(<Text variant="section" uppercase>Section Header</Text>);
    expect(screen.getByText('SECTION HEADER')).toBeTruthy();
  });
});
