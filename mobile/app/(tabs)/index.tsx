/**
 * Dashboard Screen
 * Home screen providing at-a-glance view of current goal status,
 * latest metrics, and progress visualization
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGoals } from '../../src/hooks/useGoals';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Get active goal and progress data
  const { activeGoal, isLoading: goalsLoading, isError, error, refetchActiveGoal } = useGoals();
  
  // Debug logs
  console.log('Dashboard - goalsLoading:', goalsLoading);
  console.log('Dashboard - isError:', isError);
  console.log('Dashboard - error:', error);
  console.log('Dashboard - activeGoal:', activeGoal);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchActiveGoal();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!activeGoal?.endDate) return null;
    const today = new Date();
    const end = new Date(activeGoal.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Loading state
  if (goalsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { padding: 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.emptyContainer, { marginTop: 20 }]}>
          <Text style={styles.emptyTitle}>Unable to load dashboard</Text>
          <Text style={styles.emptySubtitle}>
            {error instanceof Error ? error.message : 'An error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => refetchActiveGoal()}
          >
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // No active goal state
  if (!activeGoal) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyContainer}>
          <View style={styles.emptyHeader}>
            <Text style={styles.emptyTitle}>Welcome to Body Recomp!</Text>
            <Text style={styles.emptySubtitle}>
              Start your transformation journey
            </Text>
          </View>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardTitle}>Get Started</Text>
            <Text style={styles.emptyCardText}>
              To begin tracking your progress, you'll need to:
            </Text>
            
            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Complete your initial body measurements
                </Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Create your first goal (cutting or bulking)
                </Text>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Log progress weekly to track your journey
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/measurements')}
            >
              <Text style={styles.actionButtonText}>Record Measurements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() => router.push('/goals')}
            >
              <Text style={styles.actionButtonOutlineText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Main dashboard with active goal
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Dashboard</Text>
        <Text style={styles.subheader}>Track your transformation</Text>
      </View>

      {/* Active Goal Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Current Goal</Text>
          <View style={[
            styles.badge,
            activeGoal.type === 'CUTTING' ? styles.badgeCutting : styles.badgeBulking
          ]}>
            <Text style={styles.badgeText}>
              {activeGoal.type === 'CUTTING' ? 'Cutting' : 'Bulking'}
            </Text>
          </View>
        </View>

        {/* Goal Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Current Body Fat</Text>
            <Text style={styles.value}>
              {activeGoal.currentBodyFat.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>
              {activeGoal.type === 'BULKING' ? 'Body Fat Ceiling' : 'Target Body Fat'}
            </Text>
            <Text style={styles.value}>{activeGoal.targetBodyFat.toFixed(1)}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Target Calories</Text>
            <Text style={styles.value}>{activeGoal.recommendedCalories} kcal</Text>
          </View>
        </View>

        {/* Timeline */}
        {daysRemaining !== null && (
          <View style={styles.timelineBox}>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Days Remaining</Text>
              <Text style={styles.timelineValue}>{daysRemaining} days</Text>
            </View>
            <View style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>Target Date</Text>
              <Text style={styles.timelineValue}>
                {new Date(activeGoal.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/progress')}
          >
            <Text style={styles.quickActionButtonText}>Log Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/goals')}
          >
            <Text style={styles.quickActionButtonText}>View Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  headerSection: {
    gap: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 16,
    gap: 24,
    marginTop: 40,
  },
  emptyHeader: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 16,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyCardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    width: 24,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonOutlineText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
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
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCutting: {
    backgroundColor: '#DBEAFE',
  },
  badgeBulking: {
    backgroundColor: '#FEF3C7',
  },
  badge_CUTTING: {
    backgroundColor: '#DBEAFE',
  },
  badge_BULKING: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  timelineBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineItem: {
    gap: 4,
  },
  timelineLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  quickActionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
