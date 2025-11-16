/**
 * Training Plan Screen
 * Displays workout recommendations based on goal type
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Heading,
} from '@gluestack-ui/themed';
import { useGoals } from '../../src/hooks/useGoals';
import { useTrainingPlan, useRegeneratePlan } from '../../src/hooks/usePlans';
import { formatDate } from '../../src/utils/dates';

export default function TrainingPlanScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Get active goal
  const { activeGoal, isLoading: goalsLoading, refetchActiveGoal } = useGoals();

  // Get training plan
  const {
    data: trainingPlan,
    isLoading: planLoading,
    refetch: refetchPlan,
  } = useTrainingPlan(activeGoal?.id || '', !!activeGoal);

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
      'This will create a new training plan based on your current goal. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              await regenerateMutation.mutateAsync({
                goalId: activeGoal.id,
                planType: 'TRAINING',
              });
              Alert.alert('Success', 'Training plan regenerated successfully!');
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
        <Text style={styles.loadingText}>Loading training plan...</Text>
      </Box>
    );
  }

  // No active goal
  if (!activeGoal) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>No Active Goal</Text>
        <Text style={styles.emptyText}>
          Create a goal first to get personalized training recommendations.
        </Text>
      </Box>
    );
  }

  // No plan available
  if (!trainingPlan) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>No Training Plan</Text>
        <Text style={styles.emptyText}>
          Your training plan is being generated. Please check back soon.
        </Text>
        <Button onPress={handleRegenerate} style={styles.regenerateButton} marginTop={16}>
          <ButtonText>Generate Plan</ButtonText>
        </Button>
      </Box>
    );
  }

  const isCutting = activeGoal.type === 'CUTTING';

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
                {isCutting ? 'Cutting' : 'Bulking'} Training
              </Heading>
              <Box style={[styles.badge, isCutting ? styles.badgeCutting : styles.badgeBulking]}>
                <Text style={styles.badgeText}>{trainingPlan.recommendations.focus}</Text>
              </Box>
            </HStack>
            <Text style={styles.subheader}>
              Last updated: {formatDate(trainingPlan.updatedAt)}
            </Text>
          </Box>

          {/* Overview */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Overview</Text>
            <VStack gap={12} marginTop={12}>
              <HStack justifyContent="space-between">
                <Text style={styles.label}>Workouts per Week</Text>
                <Text style={styles.value}>{trainingPlan.recommendations.workoutsPerWeek}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={styles.label}>Training Sessions</Text>
                <Text style={styles.value}>{trainingPlan.recommendations.sessionsPerWeek}</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={styles.label}>Rest Days</Text>
                <Text style={styles.value}>{trainingPlan.recommendations.restDays}</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Exercise Recommendations */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Recommended Exercises</Text>
            <VStack gap={16} marginTop={12}>
              {trainingPlan.recommendations.exercises.map((category, index) => (
                <Box key={index}>
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                  {category.frequency && (
                    <Text style={styles.frequency}>{category.frequency}</Text>
                  )}
                  {category.setsReps && (
                    <Text style={styles.setsReps}>{category.setsReps}</Text>
                  )}
                  {category.duration && (
                    <Text style={styles.duration}>{category.duration}</Text>
                  )}
                  <VStack gap={8} marginTop={8}>
                    {category.exercises.map((exercise, i) => (
                      <HStack key={i} alignItems="flex-start">
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.exerciseName}>{exercise}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Progression */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Progression Strategy</Text>
            <Text style={styles.bodyText}>{trainingPlan.recommendations.progression}</Text>
          </Box>

          {/* Tips */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Training Tips</Text>
            <VStack gap={12} marginTop={12}>
              {trainingPlan.recommendations.tips.map((tip, index) => (
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
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  frequency: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  setsReps: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bullet: {
    fontSize: 16,
    color: '#3B82F6',
    width: 20,
  },
  exerciseName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
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
