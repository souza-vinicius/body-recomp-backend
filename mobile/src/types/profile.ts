/**
 * Profile Types
 * User profile data and update requests
 */

export type BodyFatMethod = 'NAVY' | 'JACKSON_POLLOCK_3' | 'JACKSON_POLLOCK_7';

export type UnitPreference = 'METRIC' | 'IMPERIAL';

export interface UserProfile {
  id: string;
  email: string;
  age: number;
  gender: 'MALE' | 'FEMALE';
  heightCm: number;
  weightKg: number;
  preferredMethod: BodyFatMethod;
  unitPreference?: UnitPreference;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  email?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  preferredMethod?: BodyFatMethod;
  unitPreference?: UnitPreference;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMethodRequest {
  preferredMethod: BodyFatMethod;
}
