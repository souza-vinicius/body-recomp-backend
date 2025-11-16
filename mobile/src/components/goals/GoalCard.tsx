/**
 * GoalCard Component
 * Displays goal details in a card format
 */

import React from 'react';
import { Pressable } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Badge,
  BadgeText,
  Progress,
  ProgressFilledTrack,
  Box,
} from '@gluestack-ui/themed';
import { Goal, GoalType, GoalStatus } from '../../types/goals';
import { formatDate } from '../../utils/dates';
import { Card } from '../common/Card';

interface GoalCardProps {
  goal: Goal;
  showProgress?: boolean;
  progressPercentage?: number;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  showProgress = false,
  progressPercentage,
  onPress,
}) => {
  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE:
        return 'success';
      case GoalStatus.COMPLETED:
        return 'info';
      case GoalStatus.CANCELLED:
        return 'muted';
      default:
        return 'muted';
    }
  };

  const getTypeIcon = (type: GoalType) => {
    return type === GoalType.CUTTING ? '📉' : '📈';
  };

  const getTypeLabel = (type: GoalType) => {
    return type === GoalType.CUTTING ? 'Cutting' : 'Bulking';
  };

  const getStatusLabel = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE:
        return 'Active';
      case GoalStatus.COMPLETED:
        return 'Completed';
      case GoalStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const content = (
    // @ts-ignore
    <VStack space="md">
      {/* Header: Type and Status */}
      <HStack justifyContent="space-between" alignItems="center">
        {/* @ts-ignore */}
        <HStack space="sm" alignItems="center">
          <Text fontSize={24}>{getTypeIcon(goal.type)}</Text>
          <Text fontSize={18} fontWeight="$bold" color="$textLight900">
            {getTypeLabel(goal.type)} Goal
          </Text>
        </HStack>
        {/* @ts-ignore */}
        <Badge action={getStatusColor(goal.status)} variant="solid">
          <BadgeText>{getStatusLabel(goal.status)}</BadgeText>
        </Badge>
      </HStack>

      {/* Body Fat Details */}
      {/* @ts-ignore */}
      <VStack space="sm">
        <HStack justifyContent="space-between">
          {/* @ts-ignore */}
          <VStack space="xs">
            <Text fontSize={12} color="$textLight600">
              Current
            </Text>
            <Text fontSize={20} fontWeight="$bold" color="$textLight900">
              {goal.currentBodyFat.toFixed(1)}%
            </Text>
          </VStack>
          {/* @ts-ignore */}
          <VStack space="xs" alignItems="center">
            <Text fontSize={12} color="$textLight600">
              {goal.type === GoalType.CUTTING ? 'Target' : 'Ceiling'}
            </Text>
            <Text fontSize={20} fontWeight="$bold" color="$primary600">
              {goal.targetBodyFat.toFixed(1)}%
            </Text>
          </VStack>
          {/* @ts-ignore */}
          <VStack space="xs" alignItems="flex-end">
            <Text fontSize={12} color="$textLight600">
              Change
            </Text>
            <Text fontSize={20} fontWeight="$bold" color="$textLight900">
              {Math.abs(goal.targetBodyFat - goal.currentBodyFat).toFixed(1)}%
            </Text>
          </VStack>
        </HStack>

        {/* Progress Bar */}
        {showProgress && progressPercentage !== undefined && (
          // @ts-ignore
          <VStack space="xs">
            <HStack justifyContent="space-between">
              <Text fontSize={12} color="$textLight600">
                Progress
              </Text>
              <Text fontSize={12} fontWeight="$semibold" color="$primary600">
                {progressPercentage.toFixed(0)}%
              </Text>
            </HStack>
            {/* @ts-ignore */}
            <Progress value={progressPercentage} size="sm">
              <ProgressFilledTrack />
            </Progress>
          </VStack>
        )}
      </VStack>

      {/* Timeline */}
      <HStack justifyContent="space-between">
        {/* @ts-ignore */}
        <VStack space="xs">
          <Text fontSize={12} color="$textLight600">
            Start Date
          </Text>
          <Text fontSize={14} fontWeight="$medium" color="$textLight900">
            {formatDate(goal.startDate)}
          </Text>
        </VStack>
        {/* @ts-ignore */}
        <VStack space="xs" alignItems="flex-end">
          <Text fontSize={12} color="$textLight600">
            End Date
          </Text>
          <Text fontSize={14} fontWeight="$medium" color="$textLight900">
            {formatDate(goal.endDate)}
          </Text>
        </VStack>
      </HStack>

      {/* Calorie Target */}
      <Box
        backgroundColor="$backgroundLight100"
        // @ts-ignore
        padding="$3"
        borderRadius="$md"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} color="$textLight600">
            Daily Calorie Target
          </Text>
          <Text fontSize={18} fontWeight="$bold" color="$textLight900">
            {goal.recommendedCalories} kcal
          </Text>
        </HStack>
        <Text fontSize={12} color="$textLight600" marginTop="$1">
          {goal.type === GoalType.CUTTING ? 'Deficit' : 'Surplus'}:{' '}
          {Math.abs(goal.weeklyDeficitOrSurplus)} kcal/week
        </Text>
      </Box>

      {/* Notes */}
      {goal.notes && (
        // @ts-ignore
        <VStack space="xs">
          <Text fontSize={12} color="$textLight600">
            Notes
          </Text>
          <Text fontSize={14} color="$textLight700">
            {goal.notes}
          </Text>
        </VStack>
      )}
    </VStack>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <Card variant="elevated">{content}</Card>
      </Pressable>
    );
  }

  return <Card variant="elevated">{content}</Card>;
};
