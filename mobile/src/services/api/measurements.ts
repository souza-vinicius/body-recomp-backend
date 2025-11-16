import apiClient from './client';
import {
  Measurement,
  CreateMeasurementRequest,
  UpdateMeasurementRequest,
  MeasurementListParams,
  MeasurementStats,
  CalculationMethod,
} from '../../types/measurements';
import { PaginatedResponse } from '../../types/api';

// Map backend enum -> frontend
const mapCalculationMethod = (value: string): Measurement['calculationMethod'] => {
  switch (value) {
    case 'navy':
      return 'NAVY';
    case '3_site':
      return 'THREE_SITE';
    case '7_site':
      return 'SEVEN_SITE';
    default:
      return 'NAVY';
  }
};

// Map frontend enum -> backend
const toBackendCalculationMethod = (value: CalculationMethod): string => {
  switch (value) {
    case 'NAVY':
      return 'navy';
    case 'THREE_SITE':
      return '3_site';
    case 'SEVEN_SITE':
      return '7_site';
    default:
      return 'navy';
  }
};

// Transform a backend measurement response into the frontend shape
const mapMeasurement = (m: any): Measurement => {
  return {
    id: m.id,
    userId: m.user_id,
    date: m.measured_at,
    weight: m.weight_kg,
    bodyFat: m.calculated_body_fat_percentage,
    calculationMethod: mapCalculationMethod(m.calculation_method),
    measurements: {
      neck: m.neck_cm ?? undefined,
      waist: m.waist_cm ?? 0,
      hips: m.hip_cm ?? undefined,
      chest: m.chest_mm ?? undefined,
      abdomen: m.abdomen_mm ?? undefined,
      thigh: m.thigh_mm ?? undefined,
      tricep: m.tricep_mm ?? undefined,
      subscapular: m.subscapular_mm ?? undefined,
      suprailiac: m.suprailiac_mm ?? undefined,
      midaxillary: m.midaxillary_mm ?? undefined,
    },
    notes: m.notes ?? undefined,
    photos: [],
    createdAt: m.created_at,
    updatedAt: m.created_at,
  };
};

// Default stats when backend returns 404 (no measurements yet)
const emptyStats: MeasurementStats = {
  totalMeasurements: 0,
  averageBodyFat: 0,
  lowestBodyFat: 0,
  highestBodyFat: 0,
  currentBodyFat: 0,
  currentWeight: 0,
  trend: 'STABLE',
};

/**
 * Create a new measurement
 */
export const createMeasurement = async (
  data: CreateMeasurementRequest
): Promise<Measurement> => {
  // Transform frontend shape to backend expected payload
  const measurements = data.measurements || {};
  // Validate required fields by method (basic pre-check to avoid 500)
  const method = data.calculationMethod;
  if (method === 'NAVY') {
    if (!measurements.waist || !measurements.neck) {
      throw new Error('Waist and neck are required for Navy method');
    }
  } else if (method === 'THREE_SITE') {
    // We don't know gender here; assume male subset required minimally
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

  const payload: Record<string, any> = {
    weight_kg: data.weight,
    calculation_method: toBackendCalculationMethod(data.calculationMethod),
    measured_at: data.date || new Date().toISOString(),
    notes: data.notes || undefined,
  };
  // Only include provided numeric fields to avoid sending zeros that fail validation
  const fieldMap: Record<string, any> = {
    waist_cm: measurements.waist,
    neck_cm: measurements.neck,
    hip_cm: measurements.hips,
    chest_mm: measurements.chest,
    abdomen_mm: measurements.abdomen,
    thigh_mm: measurements.thigh,
    tricep_mm: measurements.tricep,
    suprailiac_mm: measurements.suprailiac,
    midaxillary_mm: measurements.midaxillary,
    subscapular_mm: measurements.subscapular,
  };
  Object.entries(fieldMap).forEach(([k, v]) => {
    if (v !== undefined && v !== null) payload[k] = v;
  });

  const response = await apiClient.post('/measurements', payload);
  const raw = (response as any).data?.data ?? response.data;
  return mapMeasurement(raw);
};

/**
 * Get list of measurements with optional filters
 */
export const getMeasurements = async (
  params?: MeasurementListParams
): Promise<PaginatedResponse<Measurement>> => {
  const response = await apiClient.get('/measurements', { params });
  const raw = response.data;
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const mapped = list.map(mapMeasurement);
  // Adapt to PaginatedResponse expected shape
  return {
    data: mapped,
    page: 1,
    pageSize: mapped.length,
    total: mapped.length,
    totalPages: 1,
  };
};

/**
 * Get a single measurement by ID
 */
export const getMeasurement = async (id: string): Promise<Measurement> => {
  const response = await apiClient.get(`/measurements/${id}`);
  const raw = (response as any).data?.data ?? response.data;
  return mapMeasurement(raw);
};

/**
 * Update an existing measurement
 */
export const updateMeasurement = async (
  id: string,
  data: UpdateMeasurementRequest
): Promise<Measurement> => {
  const response = await apiClient.put(`/measurements/${id}`, data);
  const raw = (response as any).data?.data ?? response.data;
  return mapMeasurement(raw);
};

/**
 * Delete a measurement
 */
export const deleteMeasurement = async (id: string): Promise<void> => {
  await apiClient.delete(`/measurements/${id}`);
};

/**
 * Get measurement statistics
 */
export const getMeasurementStats = async (): Promise<MeasurementStats> => {
  try {
    const response = await apiClient.get('/measurements/stats');
    const raw = (response as any).data?.data ?? response.data;
    // Backend shape: { total_count, latest, weight_stats, body_fat_stats }
    if (!raw || typeof raw !== 'object') return emptyStats;
    const avgBodyFat = raw.body_fat_stats?.avg_percentage ?? 0;
    const lowestBodyFat = raw.body_fat_stats?.min_percentage ?? 0;
    const highestBodyFat = raw.body_fat_stats?.max_percentage ?? 0;
    const currentBodyFat = raw.latest?.body_fat_percentage ?? avgBodyFat;
    const currentWeight = raw.latest?.weight_kg ?? 0;
    return {
      totalMeasurements: raw.total_count ?? 0,
      averageBodyFat: avgBodyFat,
      lowestBodyFat,
      highestBodyFat,
      currentBodyFat,
      currentWeight,
      trend: 'STABLE',
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return emptyStats;
    }
    throw err;
  }
};

/**
 * Get the latest measurement
 */
export const getLatestMeasurement = async (): Promise<Measurement | null> => {
  try {
    const response = await apiClient.get('/measurements/latest');
    const raw = (response as any).data?.data ?? response.data;
    return mapMeasurement(raw);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
};
