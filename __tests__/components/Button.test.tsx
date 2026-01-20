import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = async (ui: React.ReactElement) => {
  const result = render(<ThemeProvider>{ui}</ThemeProvider>);
  // Wait for ThemeProvider to load
  await waitFor(() => {
    expect(result.queryByTestId('loading')).toBeNull();
  }, { timeout: 100 });
  return result;
};

describe('Button Component', () => {
  it('renders button with title', async () => {
    await renderWithTheme(<Button title="Click Me" />);
    expect(screen.getByText('CLICK ME')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPressMock = jest.fn();
    await renderWithTheme(<Button title="Press" onPress={onPressMock} />);

    fireEvent.press(screen.getByText('PRESS'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPressMock = jest.fn();
    await renderWithTheme(<Button title="Disabled" onPress={onPressMock} disabled />);

    fireEvent.press(screen.getByText('DISABLED'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', async () => {
    await renderWithTheme(<Button title="Loading" loading />);
    // Title should not be visible when loading
    expect(screen.queryByText('LOADING')).toBeNull();
  });

  it('does not call onPress when loading', async () => {
    const onPressMock = jest.fn();
    const { getByTestId } = await renderWithTheme(
      <Button title="Loading" onPress={onPressMock} loading testID="button" />
    );

    fireEvent.press(getByTestId('button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders with different variants', async () => {
    const { rerender } = await renderWithTheme(<Button title="Primary" variant="primary" />);
    expect(screen.getByText('PRIMARY')).toBeTruthy();

    rerender(<ThemeProvider><Button title="Secondary" variant="secondary" /></ThemeProvider>);
    await waitFor(() => {
      expect(screen.getByText('SECONDARY')).toBeTruthy();
    });

    rerender(<ThemeProvider><Button title="Outline" variant="outline" /></ThemeProvider>);
    await waitFor(() => {
      expect(screen.getByText('OUTLINE')).toBeTruthy();
    });
  });

  it('renders fullWidth button', async () => {
    await renderWithTheme(<Button title="Full Width" fullWidth testID="fullwidth-btn" />);
    expect(screen.getByTestId('fullwidth-btn')).toBeTruthy();
  });
});
