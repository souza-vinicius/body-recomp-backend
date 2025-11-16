import React, { useState } from 'react';
import { View, Text } from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { registerSchema, RegisterFormData } from '../../src/services/validation/schemas';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';

export default function RegisterScreen() {
  const { register, isRegistering, registerError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      date_of_birth: '',
      gender: 'male',
      height_cm: '170',
      preferred_calculation_method: 'navy',
      activity_level: 'moderately_active',
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['full_name', 'email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['date_of_birth', 'gender', 'height_cm'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data: RegisterFormData) => {
    // Remove confirmPassword and convert height to number before sending to API
    const { confirmPassword, height_cm, ...rest } = data;
    const registerData = {
      ...rest,
      height_cm: typeof height_cm === 'string' ? parseFloat(height_cm) : height_cm,
    };
    register(registerData);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {step === 1 && 'Start your body recomposition journey'}
              {step === 2 && 'Tell us about yourself'}
              {step === 3 && 'Your fitness profile'}
            </Text>
            <Text style={styles.stepIndicator}>Step {step} of 3</Text>
          </View>

          {/* Error Message */}
          {registerError && (
            <ErrorMessage
              message={
                registerError instanceof Error
                  ? registerError.message
                  : 'Failed to create account. Please try again.'
              }
              variant="error"
            />
          )}

          {/* Step 1: Account Details */}
          {step === 1 && (
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <Controller
                  control={control}
                  name="full_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="John Doe"
                      autoCapitalize="words"
                      autoCorrect={false}
                      isInvalid={!!errors.full_name}
                    />
                  )}
                />
                {errors.full_name && (
                  <Text style={styles.errorText}>{errors.full_name.message}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="your.email@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      isInvalid={!!errors.email}
                    />
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Create a strong password"
                      type={showPassword ? 'text' : 'password'}
                      isInvalid={!!errors.password}
                    />
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.link}>{showPassword ? 'Hide' : 'Show'} password</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Re-enter your password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      isInvalid={!!errors.confirmPassword}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}
              </View>

              <Button title="Next" onPress={nextStep} size="lg" />
            </View>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <View style={styles.form}>
              {/* Date of Birth */}
              <View style={styles.field}>
                <Text style={styles.label}>Date of Birth</Text>
                <Controller
                  control={control}
                  name="date_of_birth"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="YYYY-MM-DD"
                      isInvalid={!!errors.date_of_birth}
                    />
                  )}
                />
                {errors.date_of_birth && (
                  <Text style={styles.errorText}>{errors.date_of_birth.message}</Text>
                )}
              </View>

              {/* Gender */}
              <View style={styles.field}>
                <Text style={styles.label}>Gender</Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        style={[styles.radioButton, value === 'male' && styles.radioButtonActive]}
                        onPress={() => onChange('male')}
                      >
                        <Text style={[styles.radioText, value === 'male' && styles.radioTextActive]}>
                          Male
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.radioButton, value === 'female' && styles.radioButtonActive]}
                        onPress={() => onChange('female')}
                      >
                        <Text style={[styles.radioText, value === 'female' && styles.radioTextActive]}>
                          Female
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender.message}</Text>
                )}
              </View>

              {/* Height */}
              <View style={styles.field}>
                <Text style={styles.label}>Height (cm)</Text>
                <Controller
                  control={control}
                  name="height_cm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      value={String(value)}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="170"
                      keyboardType="numeric"
                      isInvalid={!!errors.height_cm}
                    />
                  )}
                />
                {errors.height_cm && (
                  <Text style={styles.errorText}>{errors.height_cm.message}</Text>
                )}
              </View>

              <View style={styles.buttonRow}>
                <View style={styles.buttonHalf}>
                  <Button title="Back" onPress={prevStep} size="lg" />
                </View>
                <View style={styles.buttonHalf}>
                  <Button title="Next" onPress={nextStep} size="lg" />
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Fitness Profile */}
          {step === 3 && (
            <View style={styles.form}>
              {/* Calculation Method */}
              <View style={styles.field}>
                <Text style={styles.label}>Body Fat Calculation Method</Text>
                <Controller
                  control={control}
                  name="preferred_calculation_method"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.selectGroup}>
                      <TouchableOpacity
                        style={[styles.selectButton, value === 'navy' && styles.selectButtonActive]}
                        onPress={() => onChange('navy')}
                      >
                        <Text style={[styles.selectText, value === 'navy' && styles.selectTextActive]}>
                          Navy Method
                        </Text>
                        <Text style={styles.selectDesc}>Tape measure only</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.selectButton, value === '3_site' && styles.selectButtonActive]}
                        onPress={() => onChange('3_site')}
                      >
                        <Text style={[styles.selectText, value === '3_site' && styles.selectTextActive]}>
                          3-Site Skinfold
                        </Text>
                        <Text style={styles.selectDesc}>Calipers required</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.selectButton, value === '7_site' && styles.selectButtonActive]}
                        onPress={() => onChange('7_site')}
                      >
                        <Text style={[styles.selectText, value === '7_site' && styles.selectTextActive]}>
                          7-Site Skinfold
                        </Text>
                        <Text style={styles.selectDesc}>Most accurate</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.preferred_calculation_method && (
                  <Text style={styles.errorText}>{errors.preferred_calculation_method.message}</Text>
                )}
              </View>

              {/* Activity Level */}
              <View style={styles.field}>
                <Text style={styles.label}>Activity Level</Text>
                <Controller
                  control={control}
                  name="activity_level"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.selectGroup}>
                      {[
                        { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                        { value: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
                        { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
                        { value: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
                        { value: 'extremely_active', label: 'Extremely Active', desc: 'Physical job + training' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[styles.selectButton, value === option.value && styles.selectButtonActive]}
                          onPress={() => onChange(option.value)}
                        >
                          <Text style={[styles.selectText, value === option.value && styles.selectTextActive]}>
                            {option.label}
                          </Text>
                          <Text style={styles.selectDesc}>{option.desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
                {errors.activity_level && (
                  <Text style={styles.errorText}>{errors.activity_level.message}</Text>
                )}
              </View>

              <View style={styles.buttonRow}>
                <View style={styles.buttonHalf}>
                  <Button title="Back" onPress={prevStep} size="lg" />
                </View>
                <View style={styles.buttonHalf}>
                  <Button
                    title={isRegistering ? 'Creating Account...' : 'Create Account'}
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isRegistering}
                    isDisabled={isRegistering}
                    size="lg"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#999',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
  },
  link: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  radioText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  radioTextActive: {
    color: '#2563eb',
  },
  selectGroup: {
    gap: 8,
  },
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  selectButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectTextActive: {
    color: '#2563eb',
  },
  selectDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});
