import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { VideoPlayer, ExerciseInfo } from '@/components/exercise';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/utils/supabase';
import type { Exercise } from '@/types/workout';

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Video Hero Section - only if video_url exists */}
        {exercise.video_url && (
          <View style={{ paddingTop: insets.top }}>
            <VideoPlayer
              url={exercise.video_url}
              thumbnailUrl={exercise.thumbnail_url}
            />
          </View>
        )}

        {/* Header - positioned over video or at top */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 8,
            zIndex: 10,
          }}
        >
          <Pressable
            testID="close-button"
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: pressed
                ? colors.background + 'EE'
                : colors.background + 'CC',
              justifyContent: 'center',
              alignItems: 'center',
            })}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Exercise Info */}
        <View
          style={{
            padding: 20,
            paddingTop: exercise.video_url ? 20 : insets.top + 60,
          }}
        >
          <ExerciseInfo exercise={exercise} />
        </View>
      </ScrollView>
    </View>
  );
}
