import React from 'react';
import { View, Text, VStack, HStack } from '@gluestack-ui/themed';
import { Pressable, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Measurement } from '../../types/measurements';
import { formatDate } from '../../utils/dates';
import { formatWeight, formatBodyFat } from '../../utils/formatting';

interface MeasurementCardProps {
  measurement: Measurement;
  onPress?: () => void;
  onDelete?: () => void;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({
  measurement,
  onPress,
  onDelete,
}) => {
  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'NAVY':
        return 'Navy Method';
      case 'THREE_SITE':
        return '3-Site Skinfold';
      case 'SEVEN_SITE':
        return '7-Site Skinfold';
      default:
        return method;
    }
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card variant="elevated">
        <VStack space="sm">
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Text fontSize="$lg" fontWeight="$semibold">
                {formatDate(measurement.date)}
              </Text>
              <Text fontSize="$xs" color="$gray600">
                {getMethodLabel(measurement.calculationMethod)}
              </Text>
            </VStack>
            {onDelete && (
              <Pressable onPress={onDelete}>
                <Text fontSize="$sm" color="$error500" fontWeight="$medium">
                  Delete
                </Text>
              </Pressable>
            )}
          </HStack>

          {/* Metrics */}
          <HStack space="xl" mt="$2">
            <VStack space="xxs">
              <Text fontSize="$xs" color="$gray600">
                Weight
              </Text>
              <Text fontSize="$xl" fontWeight="$bold" color="$gray900">
                {formatWeight(measurement.weight)}
              </Text>
            </VStack>

            <VStack space="xxs">
              <Text fontSize="$xs" color="$gray600">
                Body Fat
              </Text>
              <Text fontSize="$xl" fontWeight="$bold" color="$primary500">
                {formatBodyFat(measurement.bodyFat)}
              </Text>
            </VStack>
          </HStack>

          {/* Notes */}
          {measurement.notes && (
            <Text fontSize="$sm" color="$gray700" mt="$2">
              {measurement.notes}
            </Text>
          )}
        </VStack>
      </Card>
    </Pressable>
  );
};
