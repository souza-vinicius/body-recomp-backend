/**
 * TrendChart component
 * Displays combined weight and body fat trends over time
 */

import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Box, Text } from '@gluestack-ui/themed';

interface TrendChartProps {
  dates: string[];
  weights: number[];
  bodyFatPercentages: number[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  dates,
  weights,
  bodyFatPercentages,
}) => {
  const screenWidth = Dimensions.get('window').width;

  if (dates.length === 0) {
    return (
      <Box padding={16} alignItems="center" justifyContent="center" style={{ minHeight: 200 }}>
        <Text style={{ color: '#6B7280' }}>
          Not enough data yet. Log more progress entries to see trends.
        </Text>
      </Box>
    );
  }

  // Show last 10 entries or all if less than 10
  const displayCount = Math.min(dates.length, 10);
  const displayLabels = dates.slice(-displayCount).map((date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Normalize data to similar scale for better visualization
  const maxWeight = Math.max(...weights.slice(-displayCount));
  const minWeight = Math.min(...weights.slice(-displayCount));
  const maxBodyFat = Math.max(...bodyFatPercentages.slice(-displayCount));
  const minBodyFat = Math.min(...bodyFatPercentages.slice(-displayCount));

  // Scale body fat to weight range for dual axis effect
  const normalizedBodyFat = bodyFatPercentages.slice(-displayCount).map((bf) => {
    const normalized = ((bf - minBodyFat) / (maxBodyFat - minBodyFat)) * (maxWeight - minWeight) + minWeight;
    return isNaN(normalized) ? bf : normalized;
  });

  return (
    <Box>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: [
            {
              data: weights.slice(-displayCount),
              color: () => '#8B5CF6', // Purple for weight
              strokeWidth: 3,
            },
            {
              data: normalizedBodyFat,
              color: () => '#EC4899', // Pink for body fat
              strokeWidth: 2,
              withDots: false,
            },
          ],
          legend: ['Weight (kg)', 'Body Fat (%)'],
        }}
        width={screenWidth - 32}
        height={250}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines
        withOuterLines
        withVerticalLines={false}
        withHorizontalLines
      />

      {/* Legend with actual values */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>
            Weight: {weights[weights.length - 1]?.toFixed(1)} kg
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
          <Text style={styles.legendText}>
            Body Fat: {bodyFatPercentages[bodyFatPercentages.length - 1]?.toFixed(1)}%
          </Text>
        </View>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
