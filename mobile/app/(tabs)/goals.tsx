/**
 * Goals Screen
 * Create and manage body recomposition goals (cutting/bulking)
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, View, Text, TouchableOpacity } from 'react-native';
import {
  VStack,
  HStack,
  Button,
  ButtonText,
  Heading,
} from '@gluestack-ui/themed';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, GoalFormData } from '../../src/services/validation/schemas';
import { GoalType } from '../../src/types/goals';
import { useGoals } from '../../src/hooks/useGoals';
import { useMeasurements } from '../../src/hooks/useMeasurements';
import { GoalTypeSelector } from '../../src/components/goals/GoalTypeSelector';
import { GoalForm } from '../../src/components/goals/GoalForm';
import { GoalCard } from '../../src/components/goals/GoalCard';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';
import { Card } from '../../src/components/common/Card';

export default function GoalsScreen() {
  const [goalType, setGoalType] = useState<GoalType>(GoalType.CUTTING);
  const [showForm, setShowForm] = useState(false);

  // Mock user data - TODO: Get from profile context/API
  const gender: 'MALE' | 'FEMALE' = 'MALE';

  // Fetch latest measurement for current body fat
  const { latestMeasurement, measurements, isLoadingMeasurements: isMeasurementsLoading } = useMeasurements();

  // Goals hook
  const {
    activeGoal,
    createGoal,
    isCreating,
    createError,
    isLoading: isGoalsLoading,
    refetchActiveGoal,
  } = useGoals();

  // React Hook Form setup
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: goalType,
      initialMeasurementId: '',
      startDate: new Date().toISOString(),
      endDate: '',
      targetBodyFat: undefined,
      currentBodyFat: latestMeasurement?.bodyFat || 0,
      gender,
      notes: '',
    },
  });

  const { handleSubmit, reset, setValue } = form;

  // Update form when goal type changes
  useEffect(() => {
    setValue('type', goalType);
  }, [goalType, setValue]);

  // Update current body fat from latest measurement
  useEffect(() => {
    if (latestMeasurement?.bodyFat) {
      setValue('currentBodyFat', latestMeasurement.bodyFat);
    }
  }, [latestMeasurement, setValue]);

  // Handle form submission
  const onSubmit = async (data: GoalFormData) => {
    console.log('[GoalsScreen] Form submitted with data:', data);
    
    // Check if user already has an active goal
    if (activeGoal) {
      Alert.alert(
        'Active Goal Exists',
        'You already have an active goal. Please complete or cancel it before creating a new one.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate that we have a current body fat measurement
    if (!latestMeasurement?.bodyFat) {
      Alert.alert(
        'No Measurements',
        'Please enter a body measurement first to establish your current body fat percentage.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate initialMeasurementId
    if (!data.initialMeasurementId) {
      Alert.alert(
        'Validation Error',
        'Please select an initial measurement.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Create goal
    createGoal(
      {
        type: data.type as GoalType,
        startDate: data.startDate,
        endDate: data.endDate,
        targetBodyFat: data.targetBodyFat!,
        notes: data.notes,
        initialMeasurementId: data.initialMeasurementId,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your goal has been created!', [
            {
              text: 'OK',
              onPress: () => {
                reset();
                setShowForm(false);
                refetchActiveGoal();
              },
            },
          ]);
        },
        onError: (error: any) => {
          console.error('Goal creation error:', error);
          Alert.alert(
            'Error',
            error?.response?.data?.message ||
              'Failed to create goal. Please try again.',
            [{ text: 'OK' }]
          );
        },
      }
    );
  };

  // Loading state
  if (isGoalsLoading || isMeasurementsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // No measurements yet
  if (!latestMeasurement?.bodyFat) {
    return (
      <View style={styles.container}>
        <VStack space="lg" padding="$6" flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$2xl" fontWeight="$bold" textAlign="center">
            📊 No Measurements Yet
          </Text>
          <Text fontSize="$md" color="$textLight600" textAlign="center">
            Please enter your first body measurement in the Measurements tab to get started with goal creation.
          </Text>
        </VStack>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <VStack space="xl" padding="$6">
        <Heading size="2xl">Your Goals</Heading>

        {/* Show active goal if exists */}
        {activeGoal && (
          <Card title="Active Goal" width="100%">
            <VStack space="md">
              <GoalCard goal={activeGoal} showProgress />
              <Text fontSize="$sm" color="$textLight600" textAlign="center">
                Complete or cancel your current goal before creating a new one.
              </Text>
            </VStack>
          </Card>
        )}

        {/* Show create goal form if no active goal */}
        {!activeGoal && (
          <VStack space="xl">
            {!showForm ? (
              <VStack space="md" alignItems="center">
                <Text fontSize="$md" color="$textLight600" textAlign="center">
                  You don't have an active goal. Create one to start tracking your progress!
                </Text>
                <Button
                  onPress={() => setShowForm(true)}
                  size="lg"
                  action="primary"
                >
                  <ButtonText>Create New Goal</ButtonText>
                </Button>
              </VStack>
            ) : (
              <VStack space="xl">
                <Text fontSize="$lg" fontWeight="$semibold">
                  Create New Goal
                </Text>

                {/* Goal Type Selector - wrapped in plain View for visibility */}
                <View style={styles.selectorWrapper}>
                  <GoalTypeSelector
                    value={goalType}
                    onChange={setGoalType}
                    disabled={isCreating}
                  />
                </View>

                {/* Initial Measurement Selector */}
                <MeasurementSelector
                  measurements={(measurements?.data || []).slice(0, 20)}
                  selectedId={form.watch('initialMeasurementId')}
                  onSelect={(id) => form.setValue('initialMeasurementId', id, { shouldValidate: true })}
                  disabled={isCreating}
                  error={(form.formState.errors as any)?.initialMeasurementId?.message}
                />

                {/* Goal Form */}
                <GoalForm
                  form={form}
                  goalType={goalType}
                  currentBodyFat={latestMeasurement.bodyFat}
                  gender={gender}
                  disabled={isCreating}
                />

                {/* Error Display */}
                {createError && (
                  <ErrorMessage
                    message={
                      (createError as any)?.response?.data?.message ||
                      'Failed to create goal. Please try again.'
                    }
                    variant="error"
                  />
                )}

                {/* Action Buttons - plain RN for visibility */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonOutline, isCreating && styles.buttonDisabled]}
                    onPress={() => {
                      setShowForm(false);
                      reset({
                        type: goalType,
                        initialMeasurementId: '',
                        startDate: new Date().toISOString(),
                        endDate: '',
                        targetBodyFat: undefined,
                        currentBodyFat: latestMeasurement?.bodyFat || 0,
                        gender,
                        notes: '',
                      });
                    }}
                    disabled={isCreating}
                  >
                    <Text style={styles.buttonTextOutline}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, isCreating && styles.buttonDisabled]}
                    onPress={() => {
                      console.log('[GoalsScreen] Create button pressed');
                      handleSubmit(onSubmit)();
                    }}
                    disabled={isCreating}
                  >
                    <Text style={styles.buttonTextPrimary}>
                      {isCreating ? 'Creating...' : 'Create Goal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectorWrapper: {
    marginVertical: 8,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
});

// Inline lightweight selector component to avoid separate file complexity
import { Pressable } from 'react-native';

interface MeasurementSelectorProps {
  measurements: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  error?: string;
}

const MeasurementSelector: React.FC<MeasurementSelectorProps> = ({
  measurements,
  selectedId,
  onSelect,
  disabled,
  error,
}) => {
  return (
    <VStack space="md">
      <Text fontSize="$sm" fontWeight="$medium">Initial Measurement</Text>
      {measurements.length === 0 && (
        <Text fontSize="$xs" color="$textLight600">
          No measurements available. Create one first.
        </Text>
      )}
      <VStack space="sm">
        {measurements.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => !disabled && onSelect(m.id)}
            disabled={disabled}
          >
            <Card variant={selectedId === m.id ? 'elevated' : 'outline'}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="$sm" fontWeight="$semibold">{m.date?.split('T')[0]}</Text>
                  <Text fontSize="$xs" color="$textLight600">
                    BF: {m.bodyFat?.toFixed(1)}% · W: {m.weight?.toFixed(1)}kg
                  </Text>
                </VStack>
                {selectedId === m.id && (
                  <Text fontSize="$lg" color="$primary600">✓</Text>
                )}
              </HStack>
            </Card>
          </Pressable>
        ))}
      </VStack>
      {error && (
        <Text fontSize="$2xs" color="$error600">
          {error}
        </Text>
      )}
    </VStack>
  );
};
