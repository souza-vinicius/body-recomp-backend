/**
 * ProgressChart component
 * Displays body fat percentage trend over time using Line Chart
 */

import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Box, Text } from '@gluestack-ui/themed';

interface ProgressChartProps {
  dates: string[];
  bodyFatPercentages: number[];
  targetLine?: number[];
  trendLine?: number[];
  goalTarget?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  dates,
  bodyFatPercentages,
  targetLine,
  trendLine,
}) => {
  const screenWidth = Dimensions.get('window').width;

  if (bodyFatPercentages.length === 0) {
    return (
      <Box padding={16} alignItems="center" justifyContent="center" style={{ minHeight: 200 }}>
        <Text style={{ color: '#6B7280' }}>
          No progress data yet. Log your first entry to see trends.
        </Text>
      </Box>
    );
  }

  // Format dates for labels (show only last 6 entries to avoid crowding)
  const displayLabels = dates.slice(-6).map((date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Prepare datasets
  const datasets: any[] = [
    {
      data: bodyFatPercentages.slice(-6),
      color: () => '#3B82F6', // Blue for actual
      strokeWidth: 3,
    },
  ];

  if (trendLine && trendLine.length > 0) {
    datasets.push({
      data: trendLine.slice(-6),
      color: () => '#F59E0B', // Orange for trend
      strokeWidth: 2,
      withDots: false,
    });
  }

  if (targetLine && targetLine.length > 0) {
    datasets.push({
      data: targetLine.slice(-6),
      color: () => '#10B981', // Green for target
      strokeWidth: 2,
      withDots: false,
    });
  }

  return (
    <Box>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: datasets,
        }}
        width={screenWidth - 32}
        height={250}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#3B82F6',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        yAxisSuffix="%"
        withInnerLines
        withOuterLines
        withVerticalLines={false}
        withHorizontalLines
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Actual</Text>
        </View>
        {trendLine && trendLine.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Trend</Text>
          </View>
        )}
        {targetLine && targetLine.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Target</Text>
          </View>
        )}
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
