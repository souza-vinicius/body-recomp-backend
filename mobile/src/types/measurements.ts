export type CalculationMethod = 'NAVY' | 'THREE_SITE' | 'SEVEN_SITE';

export interface BodyMeasurements {
  // Navy Method (required for males)
  neck?: number; // cm
  waist: number; // cm
  hips?: number; // cm (required for females)
  
  // Skinfold measurements (optional, for 3-site and 7-site methods)
  chest?: number; // mm
  abdomen?: number; // mm
  thigh?: number; // mm
  tricep?: number; // mm
  subscapular?: number; // mm
  suprailiac?: number; // mm
  midaxillary?: number; // mm
}

export interface Measurement {
  id: string;
  userId: string;
  date: string;
  weight: number; // kg
  bodyFat: number; // percentage (0-100)
  calculationMethod: CalculationMethod;
  measurements: BodyMeasurements;
  notes?: string;
  photos?: string[]; // URLs to photos
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeasurementRequest {
  date: string;
  weight: number;
  calculationMethod: CalculationMethod;
  measurements: BodyMeasurements;
  notes?: string;
  gender: 'MALE' | 'FEMALE';
  height: number; // cm (required for Navy method)
  age: number; // required for some calculations
}

export interface UpdateMeasurementRequest {
  date?: string;
  weight?: number;
  calculationMethod?: CalculationMethod;
  measurements?: Partial<BodyMeasurements>;
  notes?: string;
}

export interface MeasurementListParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface MeasurementStats {
  totalMeasurements: number;
  averageBodyFat: number;
  lowestBodyFat: number;
  highestBodyFat: number;
  currentBodyFat: number;
  currentWeight: number;
  trend: 'DECREASING' | 'INCREASING' | 'STABLE';
}
