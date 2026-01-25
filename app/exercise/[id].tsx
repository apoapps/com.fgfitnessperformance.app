import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, FitnessDoodleBackground } from '@/components/ui';
import { VideoPlayer, ExerciseInfo } from '@/components/exercise';
import { QuestionButton } from '@/components/chat';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/utils/supabase';
import type { Exercise } from '@/types/workout';

// Logo for exercise header
const MiniLogoYellow = require('../../assets/mini-logo-yellow.svg');

export default function ExerciseDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExercise() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('exercise_library')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error) {
          setExercise({
            id: data.id,
            name: data.name,
            name_es: data.name_es,
            muscle_group: data.muscle_group,
            secondary_muscles: data.secondary_muscles || [],
            equipment: data.equipment,
            exercise_type: data.exercise_type || 'strength',
            difficulty: data.difficulty || 'intermediate',
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url,
            instructions: data.instructions,
            tips: data.tips,
            is_active: data.is_active ?? true,
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        } else if (name) {
          // Fallback: create minimal exercise from name param
          setExercise({
            id: id,
            name: decodeURIComponent(name),
            name_es: null,
            muscle_group: 'unknown',
            secondary_muscles: [],
            equipment: null,
            exercise_type: 'strength',
            difficulty: 'intermediate',
            video_url: null,
            thumbnail_url: null,
            instructions: null,
            tips: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error fetching exercise:', err);
        // Fallback if Supabase fails
        if (name) {
          setExercise({
            id: id,
            name: decodeURIComponent(name),
            name_es: null,
            muscle_group: 'unknown',
            secondary_muscles: [],
            equipment: null,
            exercise_type: 'strength',
            difficulty: 'intermediate',
            video_url: null,
            thumbnail_url: null,
            instructions: null,
            tips: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      setIsLoading(false);
    }

    fetchExercise();
  }, [id, name]);

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not found state
  if (!exercise) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Pressable
            testID="close-button"
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: pressed ? colors.surfaceHighlight : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            })}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text variant="title">Ejercicio</Text>
        </View>

        {/* Not Found Content */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.surfaceHighlight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
          </View>
          <Text variant="title" style={{ textAlign: 'center' }}>
            Ejercicio no encontrado
          </Text>
          <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
            El ejercicio que buscas no existe o ha sido eliminado.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.primaryDark : colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 8,
            })}
          >
            <Text variant="body" style={{ color: colors.background, fontWeight: '600' }}>
              Volver
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      testID="exercise-detail-screen"
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Doodle background - more visible */}
      <FitnessDoodleBackground opacity={1} spacing={65} logoFrequency={3} />

      {/* Top Header Bar - BLACK with logo, back, and question button */}
      {/* Modal already handles safe area, so minimal top padding */}
      <View
        style={{
          backgroundColor: '#000',
          paddingTop: 12,
          paddingBottom: 10,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Back Button */}
        <Pressable
          testID="back-button"
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            opacity: pressed ? 0.7 : 1,
            paddingVertical: 6,
            paddingRight: 8,
          })}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text variant="bodySm" style={{ color: '#fff', fontWeight: '500' }}>Volver</Text>
        </Pressable>

        {/* Logo centered */}
        <Image
          source={MiniLogoYellow}
          style={{ width: 36, height: 27 }}
          contentFit="contain"
        />

        {/* Question Button - compact yellow */}
        <Pressable
          onPress={() => router.push({
            pathname: '/chat',
            params: {
              referenceType: 'exercise',
              referenceId: exercise.id,
              referenceTag: `[${exercise.name}]`,
            },
          })}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          })}
        >
          <Ionicons name="chatbubble-ellipses" size={14} color="#000" />
          <Text variant="caption" style={{ color: '#000', fontWeight: '600' }}>Coach</Text>
        </Pressable>
      </View>

      {/* Video */}
      {exercise.video_url && (
        <View style={{ backgroundColor: '#000' }}>
          <VideoPlayer
            url={exercise.video_url}
            thumbnailUrl={exercise.thumbnail_url}
          />
        </View>
      )}

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Exercise Info */}
        <View style={{ padding: 16, paddingTop: 12 }}>
          <ExerciseInfo exercise={exercise} />
        </View>
      </ScrollView>
    </View>
  );
}
