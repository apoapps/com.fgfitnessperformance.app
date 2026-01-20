import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Activo',
    trialing: 'Prueba',
    inactive: 'Inactivo',
    past_due: 'Pago Pendiente',
    canceled: 'Cancelado',
    manual_cash: 'Efectivo',
  };
  return labels[status] || status;
}

function getStatusColor(status: string, colors: { success: string; warning: string; danger: string; textMuted: string }): string {
  const statusColors: Record<string, string> = {
    active: colors.success,
    trialing: colors.warning,
    inactive: colors.textMuted,
    past_due: colors.danger,
    canceled: colors.danger,
    manual_cash: colors.success,
  };
  return statusColors[status] || colors.textMuted;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const {
    profile,
    isLoading,
    error,
    subscriptionStatus,
    subscriptionTier,
    displayName,
    avatarUrl,
    hasAccess,
  } = useProfile();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          testID="profile-loading"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text variant="title" color="danger">Error</Text>
          <Text variant="body" color="textMuted" style={{ marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <Button
            title="Reintentar"
            variant="outline"
            onPress={() => {}}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20, gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Text variant="hero" uppercase>
            Perfil
          </Text>
          <View style={{ width: 48, height: 4, backgroundColor: colors.primary }} />
        </View>

        {/* Avatar & Name Card */}
        <Card variant="glass">
          <View style={{ alignItems: 'center', padding: 20, gap: 16 }}>
            {/* Avatar */}
            {avatarUrl ? (
              <Image
                testID="profile-avatar"
                source={{ uri: avatarUrl }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 3,
                  borderColor: colors.primary,
                }}
              />
            ) : (
              <View
                testID="profile-avatar-placeholder"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: colors.surfaceHighlight,
                  borderWidth: 3,
                  borderColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text variant="hero" color="textMuted">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Name */}
            <Text variant="title">{displayName}</Text>

            {/* Email */}
            <Text variant="body" color="textMuted">
              {profile?.email || 'Sin email'}
            </Text>

            {/* Subscription Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.surfaceHighlight,
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getStatusColor(subscriptionStatus, colors),
                }}
              />
              <Text variant="bodySm">
                {getStatusLabel(subscriptionStatus)}
              </Text>
              {subscriptionTier && (
                <>
                  <Text variant="bodySm" color="textMuted">•</Text>
                  <Text variant="bodySm" style={{ textTransform: 'capitalize' }}>
                    {subscriptionTier}
                  </Text>
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Access Tags */}
        <Card variant="glass">
          <View style={{ padding: 16, gap: 12 }}>
            <Text variant="caption" color="textMuted" uppercase>
              Acceso
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: hasAccess('workout') ? colors.success + '20' : colors.surfaceHighlight,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: hasAccess('workout') ? colors.success : colors.border,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: hasAccess('workout') ? colors.success : colors.textMuted,
                  }}
                />
                <Text
                  variant="bodySm"
                  color={hasAccess('workout') ? 'text' : 'textMuted'}
                >
                  Entrenamiento
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: hasAccess('nutrition') ? colors.success + '20' : colors.surfaceHighlight,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: hasAccess('nutrition') ? colors.success : colors.border,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: hasAccess('nutrition') ? colors.success : colors.textMuted,
                  }}
                />
                <Text
                  variant="bodySm"
                  color={hasAccess('nutrition') ? 'text' : 'textMuted'}
                >
                  Nutrición
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Account Info */}
        <Card variant="glass">
          <View style={{ padding: 16, gap: 12 }}>
            <Text variant="caption" color="textMuted" uppercase>
              Cuenta
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySm" color="textMuted">Miembro desde</Text>
                <Text variant="bodySm">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : '-'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySm" color="textMuted">Estado</Text>
                <Text variant="bodySm">{profile?.user_status || '-'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Logout Button */}
        <View style={{ marginTop: 'auto' }}>
          <Button
            title="Cerrar Sesión"
            variant="outline"
            onPress={signOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
