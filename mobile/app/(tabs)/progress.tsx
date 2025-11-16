/**
 * Progress Screen
 * Allows users to log weekly progress entries and view progress trends
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
} from '@gluestack-ui/themed';

import { Card } from '../../src/components/common/Card';
import { progressEntrySchema } from '../../src/services/validation/schemas';
import { CreateProgressRequest } from '../../src/types/progress';
import { useGoals } from '../../src/hooks/useGoals';
import {
  useLogProgress,
  useProgressHistory,
  useProgressSummary,
  useProgressTrend,
} from '../../src/hooks/useProgress';
import { ProgressChart } from '../../src/components/progress/ProgressChart';
import { ProgressCard } from '../../src/components/progress/ProgressCard';
import { TrendChart } from '../../src/components/progress/TrendChart';

export default function ProgressScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get active goal
  const { goals, activeGoal, isLoading: goalsLoading, refetchGoals, refetchActiveGoal } = useGoals();

  // Get progress data for active goal
  const {
    data: progressHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useProgressHistory(activeGoal?.id || '', !!activeGoal);

  const {
    data: progressSummary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useProgressSummary(activeGoal?.id || '', !!activeGoal);

  const {
    data: progressTrend,
    isLoading: trendLoading,
    refetch: refetchTrend,
  } = useProgressTrend(activeGoal?.id || '', !!activeGoal);

  // Log progress mutation
  const logProgressMutation = useLogProgress();

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(progressEntrySchema),
    mode: 'onChange',
    defaultValues: {
      goalId: activeGoal?.id || '',
      weight: '',
      bodyFatPercentage: '',
      notes: '',
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchGoals(), refetchActiveGoal(), refetchHistory(), refetchSummary(), refetchTrend()]);
    setRefreshing(false);
  };

  const onSubmit = async (data: any) => {
    if (!activeGoal) {
      Alert.alert('Error', 'No active goal found. Please create a goal first.');
      return;
    }

    // Check 7-day interval
    if (progressSummary && !progressSummary.canLogProgress) {
      Alert.alert(
        'Too Soon',
        `Please wait until ${new Date(progressSummary.nextEntryDue).toLocaleDateString()} to log your next progress entry.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const progressRequest: CreateProgressRequest = {
        goalId: activeGoal.id,
        weight: typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight,
        bodyFatPercentage: typeof data.bodyFatPercentage === 'string' 
          ? parseFloat(data.bodyFatPercentage) 
          : data.bodyFatPercentage,
        notes: data.notes || undefined,
      };

      await logProgressMutation.mutateAsync(progressRequest);

      // Check for bulking ceiling approach warning (within 1%)
      const isBulking = activeGoal.type === 'BULKING';
      const bodyFatValue = progressRequest.bodyFatPercentage;
      const ceilingDiff = isBulking ? activeGoal.targetBodyFat - bodyFatValue : 0;
      
      // Check if goal is now completed
      if (progressSummary && progressSummary.progressPercentage >= 100) {
        setShowCelebration(true);
      } else if (isBulking && ceilingDiff <= 1 && ceilingDiff > 0) {
        // Ceiling approach warning
        Alert.alert(
          '⚠️ Approaching Ceiling',
          `You're within 1% of your body fat ceiling (${activeGoal.targetBodyFat.toFixed(1)}%). Consider transitioning to maintenance or starting a cutting phase soon to preserve your gains.`,
          [{ text: 'Got it' }]
        );
      } else if (isBulking && bodyFatValue >= activeGoal.targetBodyFat) {
        // Ceiling reached
        Alert.alert(
          '🎯 Ceiling Reached',
          `You've reached your body fat ceiling of ${activeGoal.targetBodyFat.toFixed(1)}%! Time to transition to maintenance or consider starting a cutting phase.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Success', 'Progress logged successfully!', [{ text: 'OK' }]);
      }

      reset({
        goalId: activeGoal.id,
        weight: '',
        bodyFatPercentage: '',
        notes: '',
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to log progress. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Loading state
  if (goalsLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <VStack flex={1} justifyContent="center" alignItems="center">
          <Card title="Loading progress..." width="100%" maxWidth={480}>
            <VStack space="md" alignItems="center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading progress...</Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    );
  }

  // No active goal state
  if (!activeGoal) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <VStack flex={1} justifyContent="center" alignItems="center">
          <Card
            title="No Active Goal"
            subtitle="Create a goal first to start tracking your progress."
            width="100%"
            maxWidth={480}
          >
            <VStack space="md" alignItems="center">
              <Text style={styles.emptyText}>Create a goal first to start tracking your progress.</Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Box padding={16}>
        {/* Progress Summary */}
        {progressSummary && (
          <Card title="Progress Summary" width="100%">
            <VStack gap={12} marginTop={12}>
              <HStack justifyContent="space-between">
                <Text style={styles.summaryLabel}>Current</Text>
                <Text style={styles.summaryValue}>
                  {progressSummary.currentBodyFat.toFixed(1)}%
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={styles.summaryLabel}>Target</Text>
                <Text style={styles.summaryValue}>
                  {progressSummary.targetBodyFat.toFixed(1)}%
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={styles.summaryLabel}>Progress</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  {progressSummary.progressPercentage.toFixed(0)}%
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text style={styles.summaryLabel}>Status</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        progressSummary.status === 'on-track'
                          ? '#10B981'
                          : progressSummary.status === 'ahead'
                          ? '#3B82F6'
                          : '#EF4444',
                    },
                  ]}
                >
                  {progressSummary.status.replace('-', ' ').toUpperCase()}
                </Text>
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Progress Chart */}
        {progressTrend && progressTrend.chartData.dates.length > 0 && (
          <Card title="Body Fat Trend" width="100%">
            <ProgressChart
              dates={progressTrend.chartData.dates}
              bodyFatPercentages={progressTrend.chartData.bodyFatPercentages}
              targetLine={progressTrend.chartData.targetLine}
              trendLine={progressTrend.chartData.trendLine}
            />
          </Card>
        )}

        {/* Weight & Body Fat Trend */}
        {progressTrend && progressTrend.chartData.dates.length > 0 && (
          <Card title="Combined Trends" width="100%">
            <TrendChart
              dates={progressTrend.chartData.dates}
              weights={progressTrend.chartData.weights}
              bodyFatPercentages={progressTrend.chartData.bodyFatPercentages}
            />
          </Card>
        )}

        {/* Log Progress Form */}
        <Card title="Log Progress" width="100%">
          {progressSummary && (
            <Text style={styles.nextEntryText}>
              {progressSummary.canLogProgress
                ? 'You can log your progress now!'
                : `Next entry due: ${new Date(progressSummary.nextEntryDue).toLocaleDateString()}`}
            </Text>
          )}

          <VStack gap={16} marginTop={16}>
            {/* Weight Input */}
            <FormControl isInvalid={!!errors.weight}>
              <FormControlLabel>
                <FormControlLabelText>Weight (kg)</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Enter your weight"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value?.toString() || ''}
                    />
                  </Input>
                )}
              />
              {errors.weight && (
                <FormControlError>
                  <FormControlErrorText>{String(errors.weight.message)}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Body Fat Percentage Input */}
            <FormControl isInvalid={!!errors.bodyFatPercentage}>
              <FormControlLabel>
                <FormControlLabelText>Body Fat (%)</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="bodyFatPercentage"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Enter your body fat percentage"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value?.toString() || ''}
                    />
                  </Input>
                )}
              />
              {errors.bodyFatPercentage && (
                <FormControlError>
                  <FormControlErrorText>
                    {String(errors.bodyFatPercentage.message)}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Notes Input */}
            <FormControl isInvalid={!!errors.notes}>
              <FormControlLabel>
                <FormControlLabelText>Notes (optional)</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Any notes about your progress?"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      multiline
                      numberOfLines={3}
                    />
                  </Input>
                )}
              />
              {errors.notes && (
                <FormControlError>
                  <FormControlErrorText>{String(errors.notes.message)}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={
                !isValid ||
                logProgressMutation.isPending ||
                (progressSummary && !progressSummary.canLogProgress)
              }
              style={styles.submitButton}
            >
              {logProgressMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ButtonText>Log Progress</ButtonText>
              )}
            </Button>
          </VStack>
        </Card>

        {/* Progress History */}
        {progressHistory && progressHistory.length > 0 && (
          <Card title="Progress History" width="100%" style={{ marginTop: 24 }}>
            <VStack gap={12} marginTop={12}>
              {progressHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <ProgressCard key={entry.id} entry={entry} />
                ))}
            </VStack>
          </Card>
        )}
      </Box>

      {/* Celebration Modal */}
      <Modal isOpen={showCelebration} onClose={() => setShowCelebration(false)}>
        <ModalBackdrop />
        <ModalContent style={styles.modalContent}>
          <ModalHeader>
            <Heading style={styles.celebrationHeading}>🎉 Congratulations! 🎉</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack gap={16}>
              <Text style={styles.celebrationText}>
                {activeGoal?.type === 'BULKING'
                  ? `You've reached your body fat ceiling of ${activeGoal?.targetBodyFat.toFixed(1)}%!`
                  : `You've reached your target body fat of ${activeGoal?.targetBodyFat.toFixed(1)}%!`}
              </Text>
              <Text style={styles.celebrationSubtext}>
                This is an amazing accomplishment! All your hard work and dedication has paid off.
                {activeGoal?.type === 'BULKING'
                  ? ' Consider transitioning to maintenance or starting a cutting phase to optimize your results.'
                  : ' Keep up the great work and consider setting a new goal to continue your fitness journey.'}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setShowCelebration(false)} style={styles.celebrationButton}>
              <ButtonText>Awesome!</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  nextEntryText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  modalContent: {
    padding: 24,
    maxWidth: 400,
  },
  celebrationHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  celebrationButton: {
    width: '100%',
    marginTop: 8,
  },
});
