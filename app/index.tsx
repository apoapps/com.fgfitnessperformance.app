import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeDemo() {
  const { colors, isDark, setPreference, preference } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleTheme = () => {
    const next = preference === 'dark' ? 'light' : preference === 'light' ? 'system' : 'dark';
    setPreference(next);
  };

  const handleFakeLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 24 }}
      >
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text variant="hero" uppercase>
            Theme Demo
          </Text>
          <View style={{ width: 48, height: 4, backgroundColor: colors.primary }} />
          <Text variant="body" color="textMuted">
            FG Fitness Performance Design System
          </Text>
        </View>

        {/* Theme Toggle */}
        <Card variant="glass">
          <View style={{ gap: 12 }}>
            <Text variant="section" uppercase>Current Theme</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text variant="body">Mode: {isDark ? 'Dark' : 'Light'}</Text>
              <Text variant="body" color="textMuted">({preference})</Text>
            </View>
            <Button
              title="Toggle Theme"
              variant="secondary"
              onPress={handleToggleTheme}
            />
          </View>
        </Card>

        {/* Typography Showcase */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text variant="section" uppercase>Typography</Text>
            <Text variant="hero">Hero Text</Text>
            <Text variant="titleLg">Title Large</Text>
            <Text variant="title">Title</Text>
            <Text variant="titleSm">Title Small</Text>
            <Text variant="body">Body text with normal weight</Text>
            <Text variant="bodyMedium">Body medium weight</Text>
            <Text variant="bodySm">Body small text</Text>
            <Text variant="caption" color="textMuted">Caption muted</Text>
            <Text variant="metric">{`2,500`}</Text>
            <Text variant="metricSm">{`180g`}</Text>
          </View>
        </Card>

        {/* Colors Showcase */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text variant="section" uppercase>Colors</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                { name: 'Primary', color: colors.primary },
                { name: 'Danger', color: colors.danger },
                { name: 'Success', color: colors.success },
                { name: 'Warning', color: colors.warning },
                { name: 'Info', color: colors.info },
              ].map((item) => (
                <View
                  key={item.name}
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: item.color,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text variant="caption" color="textOnPrimary" style={{ fontSize: 10 }}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Buttons Showcase */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text variant="section" uppercase>Buttons</Text>
            <Button title="Primary Button" variant="primary" />
            <Button title="Secondary Button" variant="secondary" />
            <Button title="Outline Button" variant="outline" />
            <Button title="Disabled" variant="primary" disabled />
            <Button title="Loading..." variant="primary" loading />
            <Button title="Full Width" variant="primary" fullWidth />
          </View>
        </Card>

        {/* Cards Showcase */}
        <View style={{ gap: 16 }}>
          <Text variant="section" uppercase>Cards</Text>
          <Card variant="default">
            <Text variant="body">Default Card</Text>
          </Card>
          <Card variant="elevated">
            <Text variant="body">Elevated Card</Text>
          </Card>
          <Card variant="glass">
            <Text variant="body">Glass Card</Text>
          </Card>
          <Card borderLeft>
            <Text variant="body">Card with Accent Border</Text>
          </Card>
        </View>

        {/* Inputs Showcase */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text variant="section" uppercase>Form Inputs</Text>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="With Error"
              placeholder="Invalid input"
              error="This field is required"
            />
            <Input
              label="Disabled"
              placeholder="Can't edit this"
              editable={false}
            />
            <Button
              title="Submit Form"
              variant="primary"
              loading={loading}
              onPress={handleFakeLogin}
            />
          </View>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
