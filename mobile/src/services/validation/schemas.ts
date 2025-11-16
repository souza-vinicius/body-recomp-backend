import { z } from 'zod';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// Email schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

// Password schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    passwordRegex,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must be less than 255 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    date_of_birth: z.string().refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      },
      {
        message: 'You must be between 13 and 120 years old',
      }
    ),
    gender: z.enum(['male', 'female'], {
      message: 'Gender is required',
    }),
    height_cm: z.union([
      z.number(),
      z.string().transform((val) => parseFloat(val))
    ]).pipe(
      z.number()
        .min(120, 'Height must be at least 120 cm')
        .max(250, 'Height must be less than 250 cm')
    ),
    preferred_calculation_method: z.enum(['navy', '3_site', '7_site'], {
      message: 'Calculation method is required',
    }),
    activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'], {
      message: 'Activity level is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Measurement schema
export const measurementSchema = z.object({
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(500, 'Weight must be less than 500')
    .or(z.string().transform((val) => parseFloat(val))),
  bodyFat: z
    .number()
    .min(0, 'Body fat cannot be negative')
    .max(100, 'Body fat must be a percentage (0-100)')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  date: z.string().refine((date) => {
    const measurementDate = new Date(date);
    const today = new Date();
    return measurementDate <= today;
  }, 'Measurement date cannot be in the future'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  // Optional body measurements - circumferences
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  neck: z.number().positive().optional(),
  biceps: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  calves: z.number().positive().optional(),
  // Skinfold measurements
  abdomen: z.number().positive().optional(),
  thigh: z.number().positive().optional(),
  tricep: z.number().positive().optional(),
  suprailiac: z.number().positive().optional(),
  subscapular: z.number().positive().optional(),
  midaxillary: z.number().positive().optional(),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;

// Goal schema with safety limits
export const goalSchema = z
  .object({
    type: z.enum(['CUTTING', 'BULKING'], {
      message: 'Goal type is required',
    }),
    initialMeasurementId: z.string().min(1, 'Initial measurement is required'),
    startDate: z.string(),
    endDate: z.string(),
    targetBodyFat: z
      .number()
      .min(0, 'Target body fat cannot be negative')
      .max(100, 'Target body fat must be a percentage (0-100)')
      .or(z.string().transform((val) => parseFloat(val))),
    currentBodyFat: z.number(),
    gender: z.enum(['MALE', 'FEMALE'], {
      message: 'Gender is required for safety validation',
    }),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return durationDays >= 7;
    },
    {
      message: 'Goal duration must be at least 7 days',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return durationDays <= 365;
    },
    {
      message: 'Goal duration cannot exceed 1 year',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'CUTTING') {
        return data.targetBodyFat < data.currentBodyFat;
      }
      return true;
    },
    {
      message: 'Target body fat must be lower than current for cutting goals',
      path: ['targetBodyFat'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'BULKING') {
        return data.targetBodyFat > data.currentBodyFat;
      }
      return true;
    },
    {
      message: 'Target body fat must be higher than current for bulking goals',
      path: ['targetBodyFat'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'CUTTING') {
        const minSafe = data.gender === 'MALE' ? 8 : 15;
        return data.targetBodyFat >= minSafe;
      }
      return true;
    },
    {
      message: 'Target body fat is below safe limits (8% for men, 15% for women)',
      path: ['targetBodyFat'],
    }
  )
  .refine(
    (data) => {
      return !!data.initialMeasurementId;
    },
    {
      message: 'Initial measurement is required to create a goal',
      path: ['initialMeasurementId'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'CUTTING') {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const weeks = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7);
        const totalLoss = data.currentBodyFat - data.targetBodyFat;
        const weeklyLoss = totalLoss / weeks;
        return weeklyLoss <= 1.0;
      }
      return true;
    },
    {
      message: 'Goal is too aggressive. Maximum safe loss is 1% body fat per week',
      path: ['targetBodyFat'],
    }
  );

export type GoalFormData = z.infer<typeof goalSchema>;

// Profile schema
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  dateOfBirth: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13;
    },
    {
      message: 'You must be at least 13 years old',
    }
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Gender is required',
  }),
  height: z
    .number()
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm')
    .or(z.string().transform((val) => parseFloat(val))),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'], {
    message: 'Activity level is required',
  }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Progress entry schema
export const progressEntrySchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  date: z
    .string()
    .refine(
      (date) => {
        const entryDate = new Date(date);
        const today = new Date();
        return entryDate <= today;
      },
      { message: 'Progress date cannot be in the future' }
    )
    .optional(),
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(500, 'Weight must be less than 500 kg')
    .or(z.string().transform((val) => parseFloat(val))),
  bodyFatPercentage: z
    .number()
    .min(0, 'Body fat cannot be negative')
    .max(100, 'Body fat must be a percentage (0-100)')
    .or(z.string().transform((val) => parseFloat(val))),
  measurements: z
    .object({
      waist: z.number().positive().optional(),
      neck: z.number().positive().optional(),
      hip: z.number().positive().optional(),
      chest: z.number().positive().optional(),
      abdomen: z.number().positive().optional(),
      thigh: z.number().positive().optional(),
      tricep: z.number().positive().optional(),
      subscapular: z.number().positive().optional(),
      suprailiac: z.number().positive().optional(),
      midaxillary: z.number().positive().optional(),
    })
    .optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type ProgressEntryFormData = z.infer<typeof progressEntrySchema>;

// Update profile schema
export const updateProfileSchema = z.object({
  email: emailSchema.optional(),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Age must be less than 120')
    .or(z.string().transform((val) => parseInt(val, 10)))
    .optional(),
  heightCm: z
    .number()
    .positive('Height must be positive')
    .min(50, 'Height must be at least 50 cm')
    .max(300, 'Height must be less than 300 cm')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  weightKg: z
    .number()
    .positive('Weight must be positive')
    .max(500, 'Weight must be less than 500 kg')
    .or(z.string().transform((val) => parseFloat(val)))
    .optional(),
  preferredMethod: z.enum(['NAVY', 'JACKSON_POLLOCK_3', 'JACKSON_POLLOCK_7']).optional(),
  unitPreference: z.enum(['METRIC', 'IMPERIAL']).optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
