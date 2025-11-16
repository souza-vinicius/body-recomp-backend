import React, { useCallback } from 'react';
import { View, Text, VStack, HStack } from '@gluestack-ui/themed';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeasurements, getLatestMeasurement, getMeasurementStats, deleteMeasurement } from '../../src/services/api/measurements';
import { Measurement } from '../../src/types/measurements';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { MeasurementCard } from '../../src/components/measurements/MeasurementCard';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';
import { useRouter } from 'expo-router';

export default function MeasurementsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ['measurements', 'list'],
    queryFn: () => getMeasurements(),
  });

  const {
    data: latest,
    isLoading: isLatestLoading,
  } = useQuery({
    queryKey: ['measurements', 'latest'],
    queryFn: () => getLatestMeasurement(),
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['measurements', 'stats'],
    queryFn: () => getMeasurementStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });

  const onDelete = useCallback((m: Measurement) => {
    deleteMutation.mutate(m.id);
  }, [deleteMutation]);

  const measurements: Measurement[] = listData?.data || [];
  const refreshing = isListLoading || isLatestLoading || isStatsLoading;

  const onRefresh = () => {
    refetchList();
    queryClient.invalidateQueries({ queryKey: ['measurements', 'latest'] });
    queryClient.invalidateQueries({ queryKey: ['measurements', 'stats'] });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={measurements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <VStack space="lg" style={styles.headerWrapper}>
            <HStack justifyContent="space-between" alignItems="center" style={styles.headerRow}>
              <VStack space="xs">
                <Text fontSize="$lg" fontWeight="$bold" color="$gray900">Measurements</Text>
                <Text fontSize="$xs" color="$gray600">Track your body composition progress</Text>
              </VStack>
              <Button title="Add" size="sm" onPress={() => router.push({ pathname: '/(tabs)/measurements-create' })} />
            </HStack>

            {/* Stats */}
            <Card title="Summary" subtitle="Latest stats and trends" variant="elevated" style={styles.card}>
              {isStatsLoading ? (
                <LoadingSpinner />
              ) : stats ? (
                <HStack justifyContent="space-between" style={styles.statsRow}>
                  <VStack space="xxs">
                    <Text fontSize="$xs" color="$gray600">Total</Text>
                    <Text fontSize="$md" fontWeight="$bold">{stats.totalMeasurements}</Text>
                  </VStack>
                  <VStack space="xxs">
                    <Text fontSize="$xs" color="$gray600">Avg BF%</Text>
                    <Text fontSize="$md" fontWeight="$bold">{stats.averageBodyFat.toFixed(1)}%</Text>
                  </VStack>
                  <VStack space="xxs">
                    <Text fontSize="$xs" color="$gray600">Current BF%</Text>
                    <Text fontSize="$md" fontWeight="$bold">{stats.currentBodyFat.toFixed(1)}%</Text>
                  </VStack>
                  <VStack space="xxs">
                    <Text fontSize="$xs" color="$gray600">Weight</Text>
                    <Text fontSize="$md" fontWeight="$bold">{stats.currentWeight.toFixed(1)}kg</Text>
                  </VStack>
                </HStack>
              ) : (
                <Text>No stats</Text>
              )}
            </Card>

            {/* Latest */}
            <Card title="Latest" subtitle="Most recent measurement" variant="outline" style={styles.card}>
              {isLatestLoading ? (
                <LoadingSpinner />
              ) : latest ? (
                <MeasurementCard measurement={latest} />
              ) : (
                <Text fontSize="$xs" color="$gray600">No measurements yet</Text>
              )}
            </Card>
          </VStack>
        }
        renderItem={({ item }) => (
          <MeasurementCard
            measurement={item}
            onDelete={() => onDelete(item)}
          />
        )}
        ListEmptyComponent={
          (isListLoading || isLatestLoading || isStatsLoading) ? (
            <LoadingSpinner />
          ) : (
            <Card variant="filled" style={styles.emptyCard}>
              <Text fontSize="$md" fontWeight="$medium" style={styles.emptyText}>No measurements logged yet</Text>
              <Button title="Add your first" onPress={() => router.push({ pathname: '/(tabs)/measurements-create' })} size="sm" />
            </Card>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {isListError && <ErrorMessage message="Failed to load measurements" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
    paddingBottom: 48,
  },
  headerWrapper: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  headerRow: {
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
  },
  statsRow: {
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 12,
  },
});
