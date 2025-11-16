/**
 * Dashboard Screen
 * Home screen providing at-a-glance view of current goal status,
 * latest metrics, and progress visualization
 */

import React, { useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  ProgressFilledTrack,
  Button,
  ButtonText,
  Spinner,
} from '@gluestack-ui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

import { useGoals } from '../../src/hooks/useGoals';
import { useMeasurements } from '../../src/hooks/useMeasurements';
import { useProgressSummary } from '../../src/hooks/useProgress';

import { Card } from '../../src/components/common/Card';
import { useAuth } from '../../src/hooks/useAuth';

// Helper to calculate BMI
const calculateBMI = (weight: number, height: number) => {
  if (!weight || !height) return 'N/A';
  return (weight / (height * height)).toFixed(1);
};

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();

  // Debug log
  React.useEffect(() => {
    console.log('[Dashboard] currentUser:', currentUser);
    console.log('[Dashboard] latestMeasurement:', latestMeasurement);
    console.log('[Dashboard] weight:', weight, 'bodyFat:', bodyFat);
  }, [currentUser, latestMeasurement, weight, bodyFat]);

  // --- Data Fetching ---
  const {
    activeGoal,
    isLoading: goalsLoading,
    isError: goalsError,
    error: goalsErrorMessage,
    refetchActiveGoal,
  } = useGoals();

  const {
    latestMeasurement,
    isLoading: measurementsLoading,
    refetch: refetchMeasurements,
  } = useMeasurements();

  const {
    data: progressSummary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useProgressSummary(activeGoal?.id ?? '', activeGoal, !!activeGoal);

  // --- State and Callbacks ---
  const isLoading = goalsLoading || measurementsLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchActiveGoal(), refetchMeasurements(), refetchSummary()]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
    setRefreshing(false);
  }, [refetchActiveGoal, refetchMeasurements, refetchSummary]);

  // --- Render Logic ---

  const renderLoading = () => (
    <VStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight50">
      <Spinner size="large" />
      <Text mt="$3" fontSize="$md" color="$textLight600">
        Loading Dashboard...
      </Text>
    </VStack>
  );

  const renderError = () => (
    <VStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight50" p="$4">
      <Icon name="alert-circle-outline" size={48} color="$error700" />
      <Heading mt="$4" textAlign="center">
        Unable to Load Dashboard
      </Heading>
      <Text mt="$2" textAlign="center" color="$textLight600">
        {goalsErrorMessage instanceof Error
          ? goalsErrorMessage.message
          : 'An unexpected error occurred.'}
      </Text>
      <Button mt="$6" onPress={onRefresh}>
        <ButtonText>Retry</ButtonText>
      </Button>
    </VStack>
  );

  const renderNoGoal = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F1F5F9' }}
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <VStack flex={1} justifyContent="center" alignItems="center">
        <Card
          title="Welcome to Body Recomp!"
          subtitle="Set a goal to start your transformation journey. Track your progress and stay motivated."
          width="100%"
          maxWidth={480}
        >
          <VStack space="lg" alignItems="center">
            <Icon name="flag-outline" size={64} color="$primary500" />
            <VStack space="md" w="$full">
              <Button size="lg" onPress={() => router.push('/(tabs)/goals')}>
                <ButtonText>Create Your First Goal</ButtonText>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onPress={() => router.push('/(tabs)/measurements')}
              >
                <ButtonText>Record Measurements</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );

  if (isLoading && !refreshing) {
    return renderLoading();
  }

  if (goalsError) {
    return renderError();
  }

  if (!activeGoal) {
    return renderNoGoal();
  }

  // --- Main Dashboard View ---
  const weight = latestMeasurement?.weight ?? 0;
  const bodyFat = latestMeasurement?.bodyFat ?? 0;
  
  // Calculate target weight based on target body fat, accounting for 10% muscle loss
  const leanMass = weight * (1 - bodyFat / 100);
  
  // Initial calculation assuming no muscle loss
  const targetWeightInitial = leanMass / (1 - activeGoal.targetBodyFat / 100);
  const kgToLoseInitial = Math.max(0, weight - targetWeightInitial);
  
  // Adjust for 10% muscle loss from total weight loss
  const muscleLoss = 0.1 * kgToLoseInitial;
  const finalLeanMass = leanMass - muscleLoss;
  
  // Recalculate target weight with adjusted lean mass
  const targetWeight = finalLeanMass / (1 - activeGoal.targetBodyFat / 100);
  const kgToLose = Math.max(0, weight - targetWeight);
  const goalProgress = progressSummary?.progressPercentage ?? 0;
  const goalTypeLabel = activeGoal.type === 'CUTTING' ? 'Cutting' : 'Bulking';
  const weekNumber = progressSummary?.weeksElapsed ?? 1;
  const totalWeeks = progressSummary?.totalWeeks ?? 16;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header com gradiente azul */}
      <Box style={styles.header}>
        {/* @ts-ignore */}
        <VStack space="xs">
          <Heading style={styles.greeting}>Olá, {currentUser.full_name ? currentUser.full_name : 'atleta'}! 👋</Heading>
          <Text style={styles.subtitle}>
            Semana {weekNumber} de {totalWeeks} do seu programa
          </Text>
        </VStack>
      </Box>

      {/* Cards de estatísticas principais */}
      <HStack style={styles.statsRow}>
        <Box style={styles.statCard}>
          <Text style={styles.statEmoji}>💪</Text>
          <Text style={styles.statValue}>{weight.toFixed(1)}kg</Text>
          <Text style={styles.statLabel}>Peso</Text>
        </Box>

        <Box style={styles.statCard}>
          <Text style={styles.statEmoji}>🎯</Text>
          <Text style={[styles.statValue, { color: '#F97316' }]}>{bodyFat.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Gordura</Text>
        </Box>

        <Box style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>
            {activeGoal.recommendedCalories || 1900}
          </Text>
          <Text style={styles.statLabel}>Kcal/dia</Text>
        </Box>
      </HStack>

      {/* Progresso até a meta */}
      <Box style={styles.progressCard}>
        <HStack style={styles.progressHeader}>
          <Heading style={styles.progressTitle}>Progresso até a meta</Heading>
          <Text style={styles.progressPercentage}>{goalProgress.toFixed(0)}%</Text>
        </HStack>

        <Progress value={goalProgress} style={styles.progressBar}>
          <ProgressFilledTrack />
        </Progress>

        <HStack style={styles.progressFooter}>
          <Text style={styles.progressDetail}>
            {bodyFat.toFixed(1)}% → {activeGoal.targetBodyFat}%
          </Text>
          <Text style={styles.progressDetail}>
            aproximadamente {kgToLose.toFixed(1)}kg para perder
          </Text>
        </HStack>
      </Box>

      {/* Treino de Hoje */}
      {/* @ts-ignore */}
      <VStack space="md" mt="$4">
        {/* @ts-ignore */}
        <Heading size="xl">Treino de Hoje</Heading>

        <Box style={styles.workoutCard}>
          {/* @ts-ignore */}
          <VStack space="sm">
            <Text style={styles.workoutDay}>
              {format(new Date(), 'EEEE')}
            </Text>
            <Heading style={styles.workoutTitle}>Upper Body A</Heading>
          </VStack>
          <Text style={styles.workoutIcon}>💪</Text>
        </Box>

        <Box style={styles.workoutDetails}>
          {/* @ts-ignore */}
          <HStack justifyContent="space-between" mb="$3">
            <Text style={styles.detailLabel}>Duração estimada</Text>
            <Text style={styles.detailValue}>45 minutos</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text style={styles.detailLabel}>Exercícios</Text>
            <Text style={styles.detailValue}>5 exercícios</Text>
          </HStack>

          <Button style={styles.startButton} onPress={() => router.push('/(tabs)/measurements')}>
            <ButtonText style={styles.startButtonText}>Iniciar Treino →</ButtonText>
          </Button>
        </Box>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  header: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  statsRow: {
    gap: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 120,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  progressDetail: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  workoutCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  workoutDay: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutIcon: {
    fontSize: 40,
  },
  workoutDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  startButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
