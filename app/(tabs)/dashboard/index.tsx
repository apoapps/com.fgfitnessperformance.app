import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useChat } from '@/contexts/ChatContext';

interface QuickActionProps {
  testID: string;
  icon: string;
  label: string;
  onPress: () => void;
}

function QuickAction({ testID, icon, label, onPress }: QuickActionProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <Text variant="title" style={{ fontSize: 24 }}>
        {icon}
      </Text>
      <Text variant="bodySm" color="textMuted">
        {label}
      </Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { displayName, isLoading: profileLoading } = useProfile();
  const { activeWorkout, currentWeek, getTodayWorkout, isLoading: workoutLoading } = useWorkout();
  const { unreadCount } = useChat();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  // Get today's workout
  const todayWorkout = useMemo(() => {
    return getTodayWorkout();
  }, [getTodayWorkout]);

  const isLoading = profileLoading || workoutLoading;

  const handleWorkoutPress = () => {
    if (activeWorkout && todayWorkout) {
      router.push({
        pathname: '/(tabs)/workout/[id]',
        params: { id: activeWorkout.id, week: currentWeek, day: todayWorkout.day_number },
      });
    } else {
      router.push('/(tabs)/workout');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4, flex: 1 }}>
              <Text variant="bodySm" color="textMuted">
                Bienvenido
              </Text>
              <Text variant="hero" style={{ fontSize: 32 }}>
                {displayName || user?.email?.split('@')[0] || 'Usuario'}
              </Text>
              <View style={{ width: 48, height: 4, backgroundColor: colors.primary, marginTop: 8 }} />
            </View>

            {/* Notification Bell */}
            <Pressable
              testID="notification-button"
              onPress={() => router.push('/chat')}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.text} />
              {unreadCount > 0 && (
                <View
                  testID="unread-badge"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.danger,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text variant="caption" style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <QuickAction
              testID="quick-action-workout"
              icon="🏋️"
              label="Entreno"
              onPress={() => router.push('/(tabs)/workout')}
            />
            <QuickAction
              testID="quick-action-nutrition"
              icon="🥗"
              label="Nutrición"
              onPress={() => router.push('/(tabs)/nutrition')}
            />
            <QuickAction
              testID="quick-action-profile"
              icon="👤"
              label="Perfil"
              onPress={() => router.push('/(tabs)/profile')}
            />
          </View>

          {/* Next Workout Card */}
          <View style={{ gap: 12 }}>
            <Text variant="caption" color="textMuted" uppercase>
              Próximo Entrenamiento
            </Text>

            {isLoading ? (
              <Card variant="glass">
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </Card>
            ) : todayWorkout ? (
              <Pressable
                testID="next-workout-card"
                onPress={handleWorkoutPress}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Card variant="glass">
                  <View style={{ padding: 20, gap: 16 }}>
                    {/* Header with Today Badge */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="caption" color="textMuted">
                        Día {todayWorkout.day_number} • Semana {currentWeek}
                      </Text>
                      <View
                        testID="today-indicator"
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text variant="caption" style={{ color: colors.background, fontWeight: '700' }}>
                          HOY
                        </Text>
                      </View>
                    </View>

                    {/* Workout Name */}
                    <Text variant="title" style={{ fontSize: 20 }}>
                      {todayWorkout.name}
                    </Text>

                    {/* Focus */}
                    {todayWorkout.focus && (
                      <Text variant="body" color="textMuted" numberOfLines={2}>
                        {todayWorkout.focus}
                      </Text>
                    )}

                    {/* Exercise Count */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="bodySm" color="textMuted">
                        {todayWorkout.exercises?.length || 0} ejercicios
                      </Text>
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                        }}
                      >
                        <Text variant="bodySm" style={{ color: colors.background, fontWeight: '600' }}>
                          INICIAR →
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ) : (
              <Card variant="glass">
                <View style={{ padding: 24, alignItems: 'center', gap: 12 }}>
                  <Text variant="title" style={{ fontSize: 32 }}>
                    🏖️
                  </Text>
                  <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
                    {activeWorkout
                      ? 'Día de descanso o sin entrenamiento hoy'
                      : 'Sin entrenamiento asignado'}
                  </Text>
                  {!activeWorkout && (
                    <Text variant="bodySm" color="textMuted" style={{ textAlign: 'center' }}>
                      Contacta a tu coach para comenzar
                    </Text>
                  )}
                </View>
              </Card>
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
