import { QuestionButton } from '@/components/chat';
import { Button, Card, ScreenHeader, Text, NutritionDoodleBackground } from '@/components/ui';
import { CompactMacroBar } from '@/components/nutrition/CompactMacroBar';
import { useNutrition } from '@/contexts/NutritionContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { NutritionDocument, NutritionMeal } from '@/types/nutrition';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Nutrition hero images
const NutritionistWithFood = require('../../../assets/photos/nutrition/DSC00178.png');
const NutritionistWithApple = require('../../../assets/photos/nutrition/DSC00186.png');

interface MacroStatProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  percentage?: number;
}

function MacroStat({ label, value, unit, color, percentage }: MacroStatProps) {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
      <Text variant="title" style={{ fontSize: 18 }}>
        {value}{unit}
      </Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
      {percentage !== undefined && (
        <Text variant="caption" color="textMuted">
          {percentage}%
        </Text>
      )}
    </View>
  );
}

interface MacroChartProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

function MacroChart({ calories, protein, carbs, fat, percentages }: MacroChartProps) {
  const { colors } = useTheme();

  // Colors for macros
  const proteinColor = '#3b82f6'; // Blue
  const carbsColor = '#22c55e'; // Green
  const fatColor = colors.primary; // Yellow

  return (
    <Card variant="glass">
      <View testID="macro-chart" style={{ padding: 20, gap: 24 }}>
        {/* Donut Chart Placeholder (simplified visual) */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 12,
              borderColor: colors.surfaceHighlight,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Colored segments using absolute positioned views */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 80,
                borderWidth: 12,
                borderTopColor: proteinColor,
                borderRightColor: carbsColor,
                borderBottomColor: fatColor,
                borderLeftColor: carbsColor,
              }}
            />
            {/* Center content */}
            <View style={{ alignItems: 'center' }}>
              <Text variant="hero" style={{ fontSize: 32 }}>
                {calories}
              </Text>
              <Text variant="caption" color="textMuted">
                kcal
              </Text>
            </View>
          </View>
        </View>

        {/* Macro Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <MacroStat
            label="Proteína"
            value={protein}
            unit="g"
            color={proteinColor}
            percentage={percentages.protein}
          />
          <MacroStat
            label="Carbohidratos"
            value={carbs}
            unit="g"
            color={carbsColor}
            percentage={percentages.carbs}
          />
          <MacroStat
            label="Grasas"
            value={fat}
            unit="g"
            color={fatColor}
            percentage={percentages.fat}
          />
        </View>
      </View>
    </Card>
  );
}

interface MealCardProps {
  meal: NutritionMeal;
}

function MealCard({ meal }: MealCardProps) {
  const { colors } = useTheme();

  return (
    <Card variant="glass">
      <View style={{ padding: 16, gap: 12 }}>
        {/* Time and Name */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text variant="bodySm" style={{ color: colors.background, fontWeight: '600' }}>
              {meal.time}
            </Text>
          </View>
          <Text variant="title" style={{ fontSize: 16, flex: 1 }}>
            {meal.name}
          </Text>
        </View>

        {/* Foods List */}
        {meal.foods && meal.foods.length > 0 && (
          <Text variant="bodySm" color="textMuted" numberOfLines={2}>
            {meal.foods.join(' • ')}
          </Text>
        )}

        {/* Meal Macros and Question Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {meal.macros && (
            <View style={{ flexDirection: 'row', gap: 16, flex: 1 }}>
              {meal.macros.protein !== undefined && (
                <Text variant="caption" style={{ color: '#3b82f6' }}>
                  {meal.macros.protein}g P
                </Text>
              )}
              {meal.macros.carbs !== undefined && (
                <Text variant="caption" style={{ color: '#22c55e' }}>
                  {meal.macros.carbs}g C
                </Text>
              )}
              {meal.macros.fat !== undefined && (
                <Text variant="caption" color="primary">
                  {meal.macros.fat}g G
                </Text>
              )}
              {meal.macros.calories !== undefined && (
                <Text variant="caption" color="textMuted">
                  {meal.macros.calories} kcal
                </Text>
              )}
            </View>
          )}
          <QuestionButton
            referenceType="meal"
            referenceId={meal.meal_instance_id || meal.name}
            referenceTag={`[${meal.time} - ${meal.name}]`}
            compact
          />
        </View>
      </View>
    </Card>
  );
}

interface DocumentItemProps {
  document: NutritionDocument;
  index: number;
}

function DocumentItem({ document, index }: DocumentItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: pressed ? colors.surfaceHighlight : 'transparent',
        borderRadius: 8,
      })}
    >
      <View
        testID={`document-icon-${index}`}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: colors.danger + '20',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text variant="bodySm" style={{ color: colors.danger }}>
          PDF
        </Text>
      </View>
      <Text variant="body" style={{ flex: 1 }}>
        {document.name}
      </Text>
      <Text variant="body" color="textMuted">
        →
      </Text>
    </Pressable>
  );
}

export default function NutritionScreen() {
  const { colors } = useTheme();
  const {
    activePlan,
    isLoading,
    error,
    macros,
    meals,
    documents,
    waterTarget,
    getMacroPercentages,
    refreshNutrition,
  } = useNutrition();

  const percentages = getMacroPercentages();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          testID="nutrition-loading"
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
          <Text variant="title" color="danger">
            Error
          </Text>
          <Text variant="body" color="textMuted" style={{ marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <Button
            title="Reintentar"
            variant="outline"
            onPress={refreshNutrition}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!activePlan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
          {/* Header */}
          <ScreenHeader title="Nutrición" logoSize={28} style={{ marginBottom: 24 }} />

          {/* Empty State */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surfaceHighlight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="nutrition-outline" size={36} color={colors.textMuted} />
            </View>
            <Text variant="title" style={{ textAlign: 'center' }}>
              No tienes plan de nutrición
            </Text>
            <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
              Contacta a tu nutriólogo para que te asigne un plan personalizado.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Themed nutrition doodle background */}
      <NutritionDoodleBackground opacity={0.03} spacing={95} logoFrequency={4} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 24 }}>
          {/* Hero Card with Nutritionist */}
          <Animated.View entering={FadeIn.duration(300)}>
            <Card variant="glass">
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                {/* Left side - Logo and Title vertical */}
                <View style={{ flex: 1, gap: 6 }}>
                  <Image
                    source={require('../../../assets/mini-logo-negro.svg')}
                    style={{ width: 32, height: 24 }}
                    contentFit="contain"
                  />
                  <Text variant="hero" style={{ fontSize: 22, lineHeight: 26 }}>
                    FG Nutrition{'\n'}Plan
                  </Text>
                  <Text variant="bodySm" color="textMuted">
                    Tu plan personalizado
                  </Text>
                </View>

                {/* Right side - Nutritionist image with strong glow */}
                <View
                  style={{
                    shadowColor: '#ffd801',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <Image
                    source={NutritionistWithApple}
                    style={{
                      width: 160,
                      height: 210,
                      marginRight: -20,
                      marginTop: -30,
                      marginBottom: -30,
                    }}
                    contentFit="contain"
                  />
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Compact Macro Bar with Water */}
          {macros && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <CompactMacroBar macros={macros} waterTarget={waterTarget} />
            </Animated.View>
          )}

          {/* Meals Section */}
          {meals.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text variant="caption" color="textMuted" uppercase>
                Comidas del Día
              </Text>
              {meals.map((meal, index) => (
                <Animated.View
                  key={meal.meal_instance_id || meal.name}
                  entering={FadeInDown.delay(200 + index * 50).duration(400)}
                >
                  <MealCard meal={meal} />
                </Animated.View>
              ))}
            </View>
          )}

          {/* Documents Section */}
          {documents.length > 0 && (
            <Animated.View
              style={{ gap: 12 }}
              entering={FadeInDown.delay(200 + meals.length * 50).duration(400)}
            >
              <Text variant="caption" color="textMuted" uppercase>
                Documentos
              </Text>
              <Card variant="glass">
                <View style={{ padding: 4 }}>
                  {documents.map((doc, index) => (
                    <DocumentItem key={doc.url} document={doc} index={index} />
                  ))}
                </View>
              </Card>
            </Animated.View>
          )}

          {/* Coach Notes */}
          {activePlan.coach_notes && (
            <Animated.View
              style={{ gap: 8 }}
              entering={FadeInDown.delay(250 + meals.length * 50).duration(400)}
            >
              <Text variant="caption" color="textMuted" uppercase>
                Notas del Coach
              </Text>
              <Card variant="glass">
                <View style={{ padding: 16 }}>
                  <Text variant="body" color="textMuted">
                    {activePlan.coach_notes}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
