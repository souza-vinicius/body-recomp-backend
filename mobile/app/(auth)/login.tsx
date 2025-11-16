import React, { useState } from 'react';
import { VStack, HStack, Pressable, Text } from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { loginSchema, LoginFormData } from '../../src/services/validation/schemas';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';

export default function LoginScreen() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
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
        {/* @ts-ignore */}
        <VStack space="xl" p="$6" flex={1} justifyContent="center">
          {/* Header */}
          {/* @ts-ignore */}
          <VStack space="sm" alignItems="center">
            <Text fontSize={30} fontWeight="$bold">
              Welcome Back
            </Text>
            <Text fontSize={16} color="$gray600">
              Sign in to continue tracking your progress
            </Text>
          </VStack>

          {/* Error Message */}
          {loginError && (
            <ErrorMessage
              message={
                loginError instanceof Error
                  ? loginError.message
                  : 'Failed to login. Please try again.'
              }
              // @ts-ignore
              variant="error"
            />
          )}

          {/* Login Form */}
          {/* @ts-ignore */}
          <VStack space="md">
            {/* Email Field */}
            {/* @ts-ignore */}
            <VStack space="xs">
              <Text fontSize={14} fontWeight="$medium">
                Email
              </Text>
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
                <Text fontSize={12} color="$error500">
                  {errors.email.message}
                </Text>
              )}
            </VStack>

            {/* Password Field */}
            {/* @ts-ignore */}
            <VStack space="xs">
              <Text fontSize={14} fontWeight="$medium">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    isInvalid={!!errors.password}
                  />
                )}
              />
              {errors.password && (
                <Text fontSize={12} color="$error500">
                  {errors.password.message}
                </Text>
              )}
            </VStack>

            {/* Show Password Toggle */}
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text fontSize={14} color="$primary500">
                {showPassword ? 'Hide' : 'Show'} password
              </Text>
            </Pressable>
          </VStack>

          {/* Login Button */}
          <Button
            title={isLoggingIn ? 'Signing in...' : 'Sign In'}
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoggingIn}
            isDisabled={isLoggingIn}
            // @ts-ignore
            size="lg"
          />

          {/* Register Link */}
          {/* @ts-ignore */}
          <HStack space="xs" justifyContent="center">
            <Text fontSize={14} color="$gray600">
              Don't have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text fontSize={14} color="$primary500" fontWeight="$medium">
                  Sign Up
                </Text>
              </Pressable>
            </Link>
          </HStack>
        </VStack>
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
});
