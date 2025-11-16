/**
 * ProgressCard component
 * Displays a single progress entry with date, weight, and body fat percentage
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text, HStack, VStack, Pressable } from '@gluestack-ui/themed';
import { ProgressEntry } from '../../types/progress';

interface ProgressCardProps {
  entry: ProgressEntry;
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ entry, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const content = (
    <Box
      style={styles.card}
      backgroundColor="$white"
      borderRadius="$lg"
      padding={16}
      marginBottom={12}
      shadowColor="$black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={3.84}
      elevation={5}
    >
      <VStack gap={8}>
        {/* Date Header */}
        <Text style={styles.dateText}>{formatDate(entry.date)}</Text>

        {/* Metrics */}
        <HStack justifyContent="space-between">
          <VStack gap={4}>
            <Text style={styles.labelText}>Body Fat</Text>
            <Text style={styles.valueText}>{entry.bodyFatPercentage.toFixed(1)}%</Text>
          </VStack>

          <VStack gap={4} alignItems="flex-end">
            <Text style={styles.labelText}>Weight</Text>
            <Text style={styles.valueText}>{entry.weight.toFixed(1)} kg</Text>
          </VStack>
        </HStack>

        {/* Notes (if any) */}
        {entry.notes && (
          <Box
            backgroundColor="$coolGray100"
            borderRadius="$sm"
            padding={8}
            marginTop={4}
          >
            <Text style={styles.notesText}>{entry.notes}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  notesText: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
  },
});
