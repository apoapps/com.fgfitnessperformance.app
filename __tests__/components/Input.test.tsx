import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Input } from '@/components/ui/Input';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = async (ui: React.ReactElement) => {
  const result = render(<ThemeProvider>{ui}</ThemeProvider>);
  await waitFor(() => {
    expect(result.queryByTestId('loading')).toBeNull();
  }, { timeout: 100 });
  return result;
};

describe('Input Component', () => {
  it('renders with placeholder', async () => {
    await renderWithTheme(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
  });

  it('renders with label', async () => {
    await renderWithTheme(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('shows error message', async () => {
    await renderWithTheme(
      <Input label="Email" error="Invalid email format" />
    );
    expect(screen.getByText('Invalid email format')).toBeTruthy();
  });

  it('handles text input', async () => {
    const onChangeTextMock = jest.fn();
    await renderWithTheme(
      <Input
        placeholder="Type here"
        onChangeText={onChangeTextMock}
        testID="text-input"
      />
    );

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.changeText(input, 'Hello');
    expect(onChangeTextMock).toHaveBeenCalledWith('Hello');
  });

  it('supports secure text entry', async () => {
    await renderWithTheme(
      <Input
        label="Password"
        secureTextEntry
        testID="password-input"
      />
    );
    expect(screen.getByTestId('password-input')).toBeTruthy();
  });

  it('renders disabled state', async () => {
    await renderWithTheme(
      <Input
        label="Disabled"
        editable={false}
        testID="disabled-input"
      />
    );
    expect(screen.getByTestId('disabled-input')).toBeTruthy();
  });
});
