import React, { useCallback } from 'react';
import { View, Text, VStack, HStack, Icon, Heading } from '@gluestack-ui/themed';
import { StyleSheet, FlatList, RefreshControl, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Header */}
      {UIManager.getViewManagerConfig && UIManager.getViewManagerConfig('ExpoLinearGradient') ? (
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.header}
        >
          {/* @ts-ignore */}
          <VStack space="xs">
            <Heading style={styles.headerTitle}>Medidas</Heading>
            <Text style={styles.headerSubtitle}>Veja suas últimas medições e tendências</Text>
          </VStack>
        </LinearGradient>
      ) : (
        <View style={[styles.header, { backgroundColor: '#2563EB' }]}> 
          {/* @ts-ignore */}
          <VStack space="xs">
            <Heading style={styles.headerTitle}>Medidas</Heading>
            <Text style={styles.headerSubtitle}>Veja suas últimas medições e tendências</Text>
          </VStack>
        </View>
      )}

      <FlatList
        data={measurements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          // @ts-ignore
          <VStack space="lg" style={styles.headerWrapper}>
            <HStack justifyContent="space-between" alignItems="center" style={styles.headerRow}>
              {/* @ts-ignore */}
              <VStack space="xs">
                <Text fontSize={18} fontWeight="$bold" color="$gray900">Measurements</Text>
                <Text fontSize={12} color="$gray600">Track your body composition progress</Text>
              </VStack>
              {/* @ts-ignore */}
              <Button title="Add" size="sm" onPress={() => router.push({ pathname: '/(tabs)/measurements-create' })} />
            </HStack>

            {/* Stats */}
            <Card title="Summary" subtitle="Latest stats and trends" variant="elevated" style={styles.card}>
              {isStatsLoading ? (
                <LoadingSpinner />
              ) : stats ? (
                <HStack justifyContent="space-between" style={styles.statsRow}>
                  {/* @ts-ignore */}
                  <VStack space="xxs">
                    <Text fontSize={12} color="$gray600">Total</Text>
                    <Text fontSize={16} fontWeight="$bold">{stats.totalMeasurements}</Text>
                  </VStack>
                  {/* @ts-ignore */}
                  <VStack space="xxs">
                    <Text fontSize={12} color="$gray600">Avg BF%</Text>
                    <Text fontSize={16} fontWeight="$bold">{stats.averageBodyFat.toFixed(1)}%</Text>
                  </VStack>
                  {/* @ts-ignore */}
                  <VStack space="xxs">
                    <Text fontSize={12} color="$gray600">Current BF%</Text>
                    <Text fontSize={16} fontWeight="$bold">{stats.currentBodyFat.toFixed(1)}%</Text>
                  </VStack>
                  {/* @ts-ignore */}
                  <VStack space="xxs">
                    <Text fontSize={12} color="$gray600">Weight</Text>
                    <Text fontSize={16} fontWeight="$bold">{stats.currentWeight.toFixed(1)}kg</Text>
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
                <Text fontSize={12} color="$gray600">No measurements yet</Text>
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
              <Text fontSize={16} fontWeight="$medium" style={styles.emptyText}>No measurements logged yet</Text>
              {/* @ts-ignore */}
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
    paddingBottom: 64,
  },
  headerWrapper: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  header: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  headerRow: {
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 12,
  },
});
