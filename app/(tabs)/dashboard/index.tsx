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

// Hero image for dashboard
const DashboardHeroImage = require('../../../assets/photos/dashboard/DSC00107.jpeg');

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
    <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      {/* Dark Header with Hero Image */}
      <View style={{ position: 'relative' }}>
        {/* Background Image */}
        <Image
          source={DashboardHeroImage}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentFit="cover"
          contentPosition="center"
        />

        {/* Dark Overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        />

        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingVertical: 20,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left Logo with yellow underline */}
            <View>
              <Image
                source={LogoHBlanco}
                style={{ width: 180, height: 40 }}
                contentFit="contain"
              />
              <View style={{ height: 3, backgroundColor: '#ffd801', marginTop: 4, borderRadius: 2 }} />
            </View>

            {/* Chat Button - Yellow text */}
            <Pressable
              testID="chat-button"
              onPress={() => router.push('/chat')}
            >
              {({ pressed }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1 }}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#ffd801" />
                  <Text style={{ color: '#ffd801', fontSize: 14, fontWeight: '700' }}>
                    Dudas
                  </Text>
                  {unreadCount > 0 && (
                    <View
                      testID="unread-badge"
                      style={{
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
                </View>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* Light body with rounded corners */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        {/* Doodle background inside rounded container */}
        <FitnessDoodleBackground opacity={0.03} spacing={100} logoFrequency={5} />

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
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
    </View>
  );
}
