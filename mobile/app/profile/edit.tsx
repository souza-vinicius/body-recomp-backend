/**
 * Profile Edit Screen
 * Form for updating user profile information
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  VStack,
  Text,
  Button,
  ButtonText,
  Heading,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';
import { useProfile, useUpdateProfile } from '../../src/hooks/useProfile';
import { updateProfileSchema, type UpdateProfileFormData } from '../../src/services/validation/schemas';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: '',
      age: undefined,
      heightCm: undefined,
      weightKg: undefined,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        email: profile.email,
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      // Only send changed fields
      const updatedFields: Partial<UpdateProfileFormData> = {};
      if (data.email !== profile?.email) updatedFields.email = data.email;
      if (data.age !== profile?.age) updatedFields.age = data.age;
      if (data.heightCm !== profile?.heightCm) updatedFields.heightCm = data.heightCm;
      if (data.weightKg !== profile?.weightKg) updatedFields.weightKg = data.weightKg;

      if (Object.keys(updatedFields).length === 0) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        return;
      }

      await updateMutation.mutateAsync(updatedFields);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </Box>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Box padding={16}>
        <VStack gap={20}>
          {/* Header */}
          <Box>
            <Heading style={styles.header}>Edit Profile</Heading>
            <Text style={styles.subheader}>Update your personal information</Text>
          </Box>

          {/* Form */}
          <Box style={styles.card}>
            <VStack gap={16}>
              {/* Email */}
              <FormControl isInvalid={!!errors.email}>
                <FormControlLabel>
                  <FormControlLabelText>Email</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input>
                      <InputField
                        placeholder="your.email@example.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </Input>
                  )}
                />
                {errors.email && (
                  <FormControlError>
                    <FormControlErrorText>{errors.email.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Age */}
              <FormControl isInvalid={!!errors.age}>
                <FormControlLabel>
                  <FormControlLabelText>Age</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="age"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input>
                      <InputField
                        placeholder="25"
                        value={value?.toString() || ''}
                        onChangeText={(text) => {
                          const num = parseInt(text, 10);
                          onChange(isNaN(num) ? undefined : num);
                        }}
                        onBlur={onBlur}
                        keyboardType="number-pad"
                      />
                    </Input>
                  )}
                />
                {errors.age && (
                  <FormControlError>
                    <FormControlErrorText>{errors.age.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Height */}
              <FormControl isInvalid={!!errors.heightCm}>
                <FormControlLabel>
                  <FormControlLabelText>Height (cm)</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="heightCm"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input>
                      <InputField
                        placeholder="175"
                        value={value?.toString() || ''}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          onChange(isNaN(num) ? undefined : num);
                        }}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                      />
                    </Input>
                  )}
                />
                {errors.heightCm && (
                  <FormControlError>
                    <FormControlErrorText>{errors.heightCm.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* Weight */}
              <FormControl isInvalid={!!errors.weightKg}>
                <FormControlLabel>
                  <FormControlLabelText>Weight (kg)</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="weightKg"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input>
                      <InputField
                        placeholder="70"
                        value={value?.toString() || ''}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          onChange(isNaN(num) ? undefined : num);
                        }}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                      />
                    </Input>
                  )}
                />
                {errors.weightKg && (
                  <FormControlError>
                    <FormControlErrorText>{errors.weightKg.message}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>
          </Box>

          {/* Actions */}
          <VStack gap={12}>
            <Button
              onPress={handleSubmit(onSubmit)}
              isDisabled={!isDirty || updateMutation.isPending}
              style={styles.saveButton}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ButtonText>Save Changes</ButtonText>
              )}
            </Button>
            <Button onPress={() => router.back()} variant="outline" style={styles.cancelButton}>
              <ButtonText style={styles.cancelButtonText}>Cancel</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#6B7280',
  },
});
