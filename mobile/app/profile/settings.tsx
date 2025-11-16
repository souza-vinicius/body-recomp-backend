/**
 * Settings Screen
 * App preferences, password change, and account management
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  VStack,
  HStack,
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
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  Switch,
  Pressable,
} from '@gluestack-ui/themed';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUpdateMethod,
  useDeleteAccount,
} from '../../src/hooks/useProfile';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../../src/services/validation/schemas';
import type { BodyFatMethod, UnitPreference } from '../../src/types/profile';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updateMethodMutation = useUpdateMethod();
  const deleteAccountMutation = useDeleteAccount();

  // Application info fallback (dynamic require avoids native module crash in dev clients lacking module)
  let appVersion = '0.0.0';
  let buildNumber = '0';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Application = require('expo-application');
    appVersion = Application.nativeApplicationVersion || appVersion;
    buildNumber = Application.nativeBuildVersion || buildNumber;
  } catch {
    // keep fallback values
  }

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Success', 'Password changed successfully!');
      reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password. Please try again.'
      );
    }
  };

  const handleMethodChange = (method: BodyFatMethod) => {
    Alert.alert(
      'Change Calculation Method',
      'Changing your calculation method will only affect future measurements. Existing measurements will not be recalculated. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            try {
              await updateMethodMutation.mutateAsync({ preferredMethod: method });
              Alert.alert('Success', 'Calculation method updated successfully!');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to update method. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUnitToggle = async (useMetric: boolean) => {
    const newPreference: UnitPreference = useMetric ? 'METRIC' : 'IMPERIAL';
    try {
      await updateProfileMutation.mutateAsync({ unitPreference: newPreference });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update unit preference. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type DELETE to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccountMutation.mutateAsync();
                      Alert.alert('Account Deleted', 'Your account has been deleted.', [
                        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
                      ]);
                    } catch (error: any) {
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>Settings Not Available</Text>
        <Text style={styles.emptyText}>Unable to load settings.</Text>
      </Box>
    );
  }

  const methodLabels = {
    NAVY: 'US Navy Method',
    JACKSON_POLLOCK_3: 'Jackson-Pollock 3-Site',
    JACKSON_POLLOCK_7: 'Jackson-Pollock 7-Site',
  };


  return (
    <ScrollView style={styles.container}>
      <Box padding={16}>
        <VStack gap={20}>
          {/* Header */}
          <Box>
            <Heading style={styles.header}>Settings</Heading>
            <Text style={styles.subheader}>Manage preferences and account settings</Text>
          </Box>

          {/* Calculation Method */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Body Fat Calculation Method</Text>
            <Text style={styles.cardDescription}>
              Choose your preferred method for calculating body fat percentage
            </Text>
            <VStack gap={8} marginTop={16}>
              {Object.entries(methodLabels).map(([method, label]) => (
                <Pressable
                  key={method}
                  onPress={() => handleMethodChange(method as BodyFatMethod)}
                  style={[
                    styles.methodOption,
                    profile.preferredMethod === method && styles.methodOptionSelected,
                  ]}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text
                      style={[
                        styles.methodLabel,
                        profile.preferredMethod === method && styles.methodLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                    {profile.preferredMethod === method && (
                      <Box style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </Box>
                    )}
                  </HStack>
                </Pressable>
              ))}
            </VStack>
          </Box>

          {/* Unit Preference */}
          <Box style={styles.card}>
            <HStack justifyContent="space-between" alignItems="center">
              <Box flex={1}>
                <Text style={styles.cardTitle}>Use Metric Units</Text>
                <Text style={styles.cardDescription}>kg and cm instead of lb and in</Text>
              </Box>
              <Switch
                value={profile.unitPreference === 'METRIC'}
                onValueChange={handleUnitToggle}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#ffffff"
              />
            </HStack>
          </Box>

          {/* Password Change */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Change Password</Text>
            {!showPasswordForm ? (
              <Button
                onPress={() => setShowPasswordForm(true)}
                style={styles.changePasswordButton}
                marginTop={12}
              >
                <ButtonText>Change Password</ButtonText>
              </Button>
            ) : (
              <VStack gap={16} marginTop={16}>
                {/* Current Password */}
                <FormControl isInvalid={!!errors.currentPassword}>
                  <FormControlLabel>
                    <FormControlLabelText>Current Password</FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="currentPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input>
                        <InputField
                          placeholder="Enter current password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry
                          autoCapitalize="none"
                        />
                      </Input>
                    )}
                  />
                  {errors.currentPassword && (
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.currentPassword.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* New Password */}
                <FormControl isInvalid={!!errors.newPassword}>
                  <FormControlLabel>
                    <FormControlLabelText>New Password</FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input>
                        <InputField
                          placeholder="Enter new password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry
                          autoCapitalize="none"
                        />
                      </Input>
                    )}
                  />
                  {errors.newPassword && (
                    <FormControlError>
                      <FormControlErrorText>{errors.newPassword.message}</FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Confirm New Password */}
                <FormControl isInvalid={!!errors.confirmNewPassword}>
                  <FormControlLabel>
                    <FormControlLabelText>Confirm New Password</FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="confirmNewPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input>
                        <InputField
                          placeholder="Confirm new password"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry
                          autoCapitalize="none"
                        />
                      </Input>
                    )}
                  />
                  {errors.confirmNewPassword && (
                    <FormControlError>
                      <FormControlErrorText>
                        {errors.confirmNewPassword.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                <HStack gap={8}>
                  <Button
                    onPress={handleSubmit(handlePasswordChange)}
                    isDisabled={changePasswordMutation.isPending}
                    style={styles.submitButton}
                    flex={1}
                  >
                    {changePasswordMutation.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <ButtonText>Update</ButtonText>
                    )}
                  </Button>
                  <Button
                    onPress={() => {
                      setShowPasswordForm(false);
                      reset();
                    }}
                    style={styles.cancelButton}
                    flex={1}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Danger Zone */}
          <Box style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              Once you delete your account, there is no going back. Please be certain.
            </Text>
            <Button
              onPress={handleDeleteAccount}
              isDisabled={deleteAccountMutation.isPending}
              style={styles.deleteButton}
              marginTop={16}
            >
              {deleteAccountMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ButtonText>Delete Account</ButtonText>
              )}
            </Button>
          </Box>

          {/* App Info */}
          <Box style={styles.infoCard}>
            <VStack gap={8} alignItems="center">
              <Text style={styles.appName}>Body Recomp Tracker</Text>
              <Text style={styles.appVersion}>
                Version {appVersion} ({buildNumber})
              </Text>
              <Text style={styles.appPlatform}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            </VStack>
          </Box>
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  methodOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  methodOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  methodLabel: {
    fontSize: 14,
    color: '#374151',
  },
  methodLabelSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  changePasswordButton: {
    width: '100%',
  },
  submitButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    width: '100%',
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  appVersion: {
    fontSize: 12,
    color: '#6B7280',
  },
  appPlatform: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
