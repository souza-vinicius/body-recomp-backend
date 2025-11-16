/**
 * Diet Plan Screen
 * Displays calorie targets and macronutrient breakdown
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Heading,
} from '@gluestack-ui/themed';
import { PieChart } from 'react-native-chart-kit';
import { useGoals } from '../../src/hooks/useGoals';
import { useDietPlan, useRegeneratePlan } from '../../src/hooks/usePlans';
import { formatDate } from '../../src/utils/dates';

const { width } = Dimensions.get('window');

export default function DietPlanScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Get active goal
  const { activeGoal, isLoading: goalsLoading, refetchActiveGoal } = useGoals();

  // Get diet plan
  const {
    data: dietPlan,
    isLoading: planLoading,
    refetch: refetchPlan,
  } = useDietPlan(activeGoal?.id || '', !!activeGoal);

  // Regenerate plan mutation
  const regenerateMutation = useRegeneratePlan();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchActiveGoal(), refetchPlan()]);
    setRefreshing(false);
  };

  const handleRegenerate = () => {
    if (!activeGoal) return;

    Alert.alert(
      'Regenerate Plan',
      'This will create a new diet plan based on your current goal. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              await regenerateMutation.mutateAsync({
                goalId: activeGoal.id,
                planType: 'DIET',
              });
              Alert.alert('Success', 'Diet plan regenerated successfully!');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to regenerate plan. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (goalsLoading || planLoading) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading diet plan...</Text>
      </Box>
    );
  }

  // No active goal
  if (!activeGoal) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>No Active Goal</Text>
        <Text style={styles.emptyText}>
          Create a goal first to get personalized nutrition recommendations.
        </Text>
      </Box>
    );
  }

  // No plan available
  if (!dietPlan) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>No Diet Plan</Text>
        <Text style={styles.emptyText}>
          Your diet plan is being generated. Please check back soon.
        </Text>
        <Button onPress={handleRegenerate} style={styles.regenerateButton} marginTop={16}>
          <ButtonText>Generate Plan</ButtonText>
        </Button>
      </Box>
    );
  }

  const isCutting = activeGoal.type === 'CUTTING';
  const macros = dietPlan.recommendations.macros;

  // Prepare chart data
  const chartData = [
    {
      name: 'Protein',
      population: macros.protein.percentage,
      color: '#3B82F6',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Carbs',
      population: macros.carbs.percentage,
      color: '#10B981',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Fats',
      population: macros.fats.percentage,
      color: '#F59E0B',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Box padding={16}>
        <VStack gap={20}>
          {/* Header */}
          <Box>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading style={styles.header}>
                {isCutting ? 'Cutting' : 'Bulking'} Nutrition
              </Heading>
              <Box style={[styles.badge, isCutting ? styles.badgeCutting : styles.badgeBulking]}>
                <Text style={styles.badgeText}>
                  {isCutting ? 'Deficit' : 'Surplus'}
                </Text>
              </Box>
            </HStack>
            <Text style={styles.subheader}>
              Last updated: {formatDate(dietPlan.updatedAt)}
            </Text>
          </Box>

          {/* Daily Calories */}
          <Box style={styles.highlightCard}>
            <VStack gap={4} alignItems="center">
              <Text style={styles.highlightLabel}>Daily Calorie Target</Text>
              <Text style={styles.highlightValue}>
                {dietPlan.recommendations.dailyCalories} kcal
              </Text>
              <Text style={styles.highlightSubtext}>
                {isCutting ? 'Deficit' : 'Surplus'}:{' '}
                {Math.abs(dietPlan.recommendations.weeklyDeficitOrSurplus)} kcal/week
              </Text>
            </VStack>
          </Box>

          {/* Macro Breakdown Chart */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Macronutrient Breakdown</Text>
            <Box alignItems="center" marginTop={16}>
              <PieChart
                data={chartData}
                width={width - 64}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            </Box>
          </Box>

          {/* Detailed Macros */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Daily Macros</Text>
            <VStack gap={16} marginTop={12}>
              {/* Protein */}
              <Box>
                <HStack justifyContent="space-between" alignItems="center" marginBottom={8}>
                  <HStack alignItems="center" gap={8}>
                    <Box style={[styles.macroIndicator, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.macroLabel}>Protein</Text>
                  </HStack>
                  <Text style={styles.macroValue}>{macros.protein.percentage.toFixed(0)}%</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={styles.macroDetail}>{macros.protein.grams}g</Text>
                  <Text style={styles.macroDetail}>{macros.protein.calories} kcal</Text>
                </HStack>
              </Box>

              {/* Carbs */}
              <Box>
                <HStack justifyContent="space-between" alignItems="center" marginBottom={8}>
                  <HStack alignItems="center" gap={8}>
                    <Box style={[styles.macroIndicator, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.macroLabel}>Carbohydrates</Text>
                  </HStack>
                  <Text style={styles.macroValue}>{macros.carbs.percentage.toFixed(0)}%</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={styles.macroDetail}>{macros.carbs.grams}g</Text>
                  <Text style={styles.macroDetail}>{macros.carbs.calories} kcal</Text>
                </HStack>
              </Box>

              {/* Fats */}
              <Box>
                <HStack justifyContent="space-between" alignItems="center" marginBottom={8}>
                  <HStack alignItems="center" gap={8}>
                    <Box style={[styles.macroIndicator, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.macroLabel}>Fats</Text>
                  </HStack>
                  <Text style={styles.macroValue}>{macros.fats.percentage.toFixed(0)}%</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text style={styles.macroDetail}>{macros.fats.grams}g</Text>
                  <Text style={styles.macroDetail}>{macros.fats.calories} kcal</Text>
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* Meal Timing */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Meal Timing</Text>
            <VStack gap={12} marginTop={12}>
              <Box>
                <Text style={styles.timingLabel}>Pre-Workout</Text>
                <Text style={styles.timingText}>
                  {dietPlan.recommendations.mealTiming.preworkout}
                </Text>
              </Box>
              <Box>
                <Text style={styles.timingLabel}>Post-Workout</Text>
                <Text style={styles.timingText}>
                  {dietPlan.recommendations.mealTiming.postworkout}
                </Text>
              </Box>
              <Box>
                <Text style={styles.timingLabel}>General</Text>
                <Text style={styles.timingText}>
                  {dietPlan.recommendations.mealTiming.general}
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Hydration */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Hydration</Text>
            <Text style={styles.bodyText}>{dietPlan.recommendations.hydration}</Text>
          </Box>

          {/* Supplements (if any) */}
          {dietPlan.recommendations.supplements && dietPlan.recommendations.supplements.length > 0 && (
            <Box style={styles.card}>
              <Text style={styles.cardTitle}>Recommended Supplements</Text>
              <VStack gap={8} marginTop={12}>
                {dietPlan.recommendations.supplements.map((supplement, index) => (
                  <HStack key={index} alignItems="flex-start">
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.supplementText}>{supplement}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Tips */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Nutrition Tips</Text>
            <VStack gap={12} marginTop={12}>
              {dietPlan.recommendations.tips.map((tip, index) => (
                <HStack key={index} alignItems="flex-start" gap={8}>
                  <Text style={styles.tipNumber}>{index + 1}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Regenerate Button */}
          <Button
            onPress={handleRegenerate}
            isDisabled={regenerateMutation.isPending}
            style={styles.regenerateButton}
          >
            {regenerateMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ButtonText>Regenerate Plan</ButtonText>
            )}
          </Button>
        </VStack>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subheader: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeCutting: {
    backgroundColor: '#DBEAFE',
  },
  badgeBulking: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  highlightCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  highlightValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  highlightSubtext: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  macroIndicator: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  macroDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  timingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timingText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#3B82F6',
    width: 20,
  },
  supplementText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    width: 24,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  regenerateButton: {
    width: '100%',
    marginTop: 8,
  },
});
