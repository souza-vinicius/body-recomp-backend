export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  height: number | null;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE' | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  height_cm: number;
  preferred_calculation_method: 'navy' | '3_site' | '7_site';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}

// Registration endpoint returns only the created user (spec: POST /api/v1/users -> User)
export interface RegisterResponse {
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
