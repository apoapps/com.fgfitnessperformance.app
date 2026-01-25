import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, FitnessDoodleBackground } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useNutrition } from '@/contexts/NutritionContext';
import { useChat } from '@/contexts/ChatContext';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Logos
const LogoHBlanco = require('../../../assets/logo-h-blanco.svg');

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { displayName } = useProfile();
  const { workoutPlan, getTotalDays } = useWorkout();
  const { activePlan: nutritionPlan } = useNutrition();
  const { unreadCount } = useChat();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);

  const totalDays = useMemo(() => getTotalDays(), [getTotalDays]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Themed doodle background */}
      <FitnessDoodleBackground opacity={0.03} spacing={100} logoFrequency={5} />

      {/* Dark Header with Logo */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f0f' }}>
        <View
          style={{
            backgroundColor: '#0f0f0f',
            paddingVertical: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Logo */}
          <Image
            source={LogoHBlanco}
            style={{ width: 180, height: 40 }}
            contentFit="contain"
          />

          {/* Chat Button */}
          <Pressable
            testID="chat-button"
            onPress={() => router.push('/chat')}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: pressed ? '#2c2c2e' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View
                testID="unread-badge"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#ef4444',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Light body content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 24 }}>
          {/* Welcome Section */}
          <Animated.View entering={FadeIn.duration(300)} style={{ gap: 4 }}>
            <Text
              variant="body"
              style={{ color: colors.textMuted, fontSize: 16 }}
            >
              Bienvenido
            </Text>
            <Text
              variant="hero"
              style={{ fontSize: 32, color: colors.text }}
            >
              {displayName || user?.email?.split('@')[0] || 'Usuario'}
            </Text>
          </Animated.View>

          {/* Status Grid */}
          <Animated.View
            style={{ gap: 12 }}
            entering={FadeInDown.delay(100).duration(400)}
          >
            {/* Workout Plan Card */}
            <Pressable
              testID="workout-status-card"
              onPress={() => router.push('/(tabs)/workout')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: workoutPlan ? colors.primary + '20' : colors.surfaceHighlight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={workoutPlan ? 'barbell' : 'barbell-outline'}
                    size={24}
                    color={workoutPlan ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={{ gap: 2 }}>
                  <Text variant="bodyMedium" style={{ fontSize: 16 }}>
                    {workoutPlan ? 'Plan de Entrenamiento' : 'Sin Plan Asignado'}
                  </Text>
                  <Text variant="bodySm" color="textMuted">
                    {workoutPlan ? `${totalDays} días de rutinas` : 'Contacta a tu coach'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            {/* Nutrition Plan Card */}
            <Pressable
              testID="nutrition-status-card"
              onPress={() => router.push('/(tabs)/nutrition')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: nutritionPlan ? colors.primary + '20' : colors.surfaceHighlight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={nutritionPlan ? 'nutrition' : 'nutrition-outline'}
                    size={24}
                    color={nutritionPlan ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={{ gap: 2 }}>
                  <Text variant="bodyMedium" style={{ fontSize: 16 }}>
                    {nutritionPlan ? 'Plan de Nutrición' : 'Sin Plan Asignado'}
                  </Text>
                  <Text variant="bodySm" color="textMuted">
                    {nutritionPlan ? 'Ver macros y comidas' : 'Contacta a tu coach'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            {/* Profile Card */}
            <Pressable
              testID="profile-status-card"
              onPress={() => router.push('/(tabs)/profile')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? colors.surfaceHighlight : colors.surface,
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.surfaceHighlight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text variant="bodyMedium" style={{ fontSize: 16 }}>
                    Mi Perfil
                  </Text>
                  <Text variant="bodySm" color="textMuted">
                    Configuración y ajustes
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
