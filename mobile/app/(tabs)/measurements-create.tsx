import React, { useState } from 'react';
import { View, Text, VStack, HStack } from '@gluestack-ui/themed';
import { StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { MeasurementFormFields } from '../../src/components/measurements/MeasurementFormFields';
import { CalculationMethod, CreateMeasurementRequest } from '../../src/types/measurements';
import { createMeasurement } from '../../src/services/api/measurements';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';

// Schema for the basic form (excluding conditional method-specific fields handled by MeasurementFormFields)
const baseSchema = z.object({
  weight: z
    .string()
    .min(1, 'Weight is required')
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, 'Weight must be positive'),
  date: z.string().optional(),
  notes: z.string().max(500, 'Max 500 chars').optional(),
  neck: z.string().optional(),
  waist: z.string().optional(),
  hips: z.string().optional(),
  chest: z.string().optional(),
  abdomen: z.string().optional(),
  thigh: z.string().optional(),
  tricep: z.string().optional(),
  suprailiac: z.string().optional(),
  midaxillary: z.string().optional(),
  subscapular: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

export default function MeasurementCreateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<CalculationMethod>('NAVY');
  // Placeholder gender until profile integration
  const gender: 'MALE' | 'FEMALE' = 'MALE';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      weight: '',
      date: new Date().toISOString(),
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const parseNumber = (v?: string) => (v ? parseFloat(v) : undefined);

      // Build measurements object only with provided values
      const measurements: Record<string, number | undefined> = {
        neck: parseNumber(values.neck),
        waist: parseNumber(values.waist),
        hips: parseNumber(values.hips),
        chest: parseNumber(values.chest),
        abdomen: parseNumber(values.abdomen),
        thigh: parseNumber(values.thigh),
        tricep: parseNumber(values.tricep),
        suprailiac: parseNumber(values.suprailiac),
        midaxillary: parseNumber(values.midaxillary),
        subscapular: parseNumber(values.subscapular),
      };

      // Method-specific validation (client side to prevent 500)
      if (method === 'NAVY') {
        if (!measurements.waist || !measurements.neck) {
          throw new Error('Waist and neck are required for Navy method');
        }
      } else if (method === 'THREE_SITE') {
        const maleOk = measurements.chest && measurements.abdomen && measurements.thigh;
        const femaleOk = measurements.tricep && measurements.suprailiac && measurements.thigh;
        if (!maleOk && !femaleOk) {
          throw new Error('3-Site requires (chest, abdomen, thigh) or (tricep, suprailiac, thigh)');
        }
      } else if (method === 'SEVEN_SITE') {
        const required7 = [
          measurements.chest,
          measurements.midaxillary,
          measurements.tricep,
          measurements.subscapular,
          measurements.abdomen,
          measurements.suprailiac,
          measurements.thigh,
        ];
        if (required7.some((v) => v === undefined || v === null)) {
          throw new Error('7-Site requires all seven skinfold measurements');
        }
      }

      const request: CreateMeasurementRequest = {
        date: values.date || new Date().toISOString(),
        weight: values.weight,
        calculationMethod: method,
        measurements: measurements as any,
        notes: values.notes,
        gender: gender,
        height: 0,
        age: 0,
      };
      return createMeasurement(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      router.back();
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <VStack space="lg">
        <VStack space="xs">
          <Text fontSize="$lg" fontWeight="$bold">New Measurement</Text>
          <Text fontSize="$xs" color="$gray600">Record a new body composition entry</Text>
        </VStack>

        {/* Method Selection */}
        <Card title="Method" variant="outline">
          <HStack justifyContent="space-between" style={styles.methodRow}>
            <Button
              title="Navy"
              variant={method === 'NAVY' ? 'solid' : 'outline'}
              size="sm"
              onPress={() => setMethod('NAVY')}
            />
            <Button
              title="3-Site"
              variant={method === 'THREE_SITE' ? 'solid' : 'outline'}
              size="sm"
              onPress={() => setMethod('THREE_SITE')}
            />
            <Button
              title="7-Site"
              variant={method === 'SEVEN_SITE' ? 'solid' : 'outline'}
              size="sm"
              onPress={() => setMethod('SEVEN_SITE')}
            />
          </HStack>
        </Card>

        {/* Core Fields */}
        <Card title="Core Data" variant="elevated">
          <VStack space="md">
            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$medium">Weight (kg)</Text>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value?.toString() || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g., 82.4"
                    keyboardType="decimal-pad"
                    isInvalid={!!errors.weight}
                  />
                )}
              />
              {errors.weight && (
                <Text fontSize="$2xs" color="$error500">{errors.weight.message}</Text>
              )}
            </VStack>

            <VStack space="xs">
              <Text fontSize="$sm" fontWeight="$medium">Notes (optional)</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Observations, context..."
                    isInvalid={!!errors.notes}
                  />
                )}
              />
              {errors.notes && (
                <Text fontSize="$2xs" color="$error500">{errors.notes.message}</Text>
              )}
            </VStack>
          </VStack>
        </Card>

        {/* Method Specific Fields */}
        <Card title="Measurements" variant="outline">
          <MeasurementFormFields
            control={control as any}
            errors={errors as any}
            calculationMethod={method}
            gender={gender}
          />
        </Card>

        {mutation.isError && (
          <ErrorMessage message={(mutation.error as Error)?.message || 'Failed to create measurement'} />
        )}

        <Button
          title={mutation.isLoading ? 'Saving...' : 'Save Measurement'}
          onPress={handleSubmit(onSubmit)}
          isLoading={mutation.isLoading}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => router.back()}
        />
      </VStack>
    </ScrollView>
  );
}

import { Card } from '../../src/components/common/Card';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 64,
  },
  methodRow: {
    width: '100%',
    gap: 8,
  },
});