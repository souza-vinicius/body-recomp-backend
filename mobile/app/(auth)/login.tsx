// @ts-nocheck
import React, { useState } from 'react';
import { VStack, HStack, Pressable, Text, Box, Heading } from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* @ts-ignore */}
      <Box flex={1} bg="$white">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* @ts-ignore */}
          <VStack flex={1}>
            {/* Header Section with Gradient */}
            {/* @ts-ignore */}
            <Box height={300} width="$full" position="relative" bg="$primary600">
              {/* LinearGradient temporarily removed to fix crash if native module is missing */}
              <LinearGradient
                colors={['#2563EB', '#1E40AF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {/* @ts-ignore */}
              <VStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                space="md"
                pb="$16" // Padding bottom to make room for the card overlap
              >
                {/* @ts-ignore */}
                <Box
                  bg="rgba(255,255,255,0.2)"
                  p="$4"
                  borderRadius="$full"
                  mb="$2"
                >
                  <Ionicons name="fitness" size={48} color="white" />
                </Box>
                {/* @ts-ignore */}
                <Heading color="$white" size="2xl" fontWeight="$bold">
                  Body Recomp
                </Heading>
                {/* @ts-ignore */}
                <Text color="$white" opacity={0.9} fontSize="$md">
                  Transforme seu corpo hoje
                </Text>
              </VStack>
            </Box>

            {/* Login Form Card - Overlapping the header */}
            {/* @ts-ignore */}
            <Box
              flex={1}
              bg="$white"
              mt={-40}
              borderTopLeftRadius="$3xl"
              borderTopRightRadius="$3xl"
              px="$6"
              pt="$8"
              pb="$6"
            >
              {/* @ts-ignore */}
              <VStack space="xl">
                {/* @ts-ignore */}
                <VStack space="xs">
                  {/* @ts-ignore */}
                  <Heading size="xl" color="$textDark900">
                    Bem-vindo de volta
                  </Heading>
                  {/* @ts-ignore */}
                  <Text color="$textLight500">
                    Faça login para continuar seu progresso
                  </Text>
                </VStack>

                {/* Error Message */}
                {loginError && (
                  <ErrorMessage
                    message={
                      loginError instanceof Error
                        ? loginError.message
                        : 'Falha no login. Tente novamente.'
                    }
                    // @ts-ignore
                    variant="error"
                  />
                )}

                {/* Form Fields */}
                {/* @ts-ignore */}
                <VStack space="lg">
                  {/* Email */}
                  {/* @ts-ignore */}
                  <VStack space="xs">
                    {/* @ts-ignore */}
                    <Text fontSize="$sm" fontWeight="$medium" color="$textLight700">
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
                          placeholder="seu.email@exemplo.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          isInvalid={!!errors.email}
                          // @ts-ignore
                          leftIcon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
                        />
                      )}
                    />
                    {errors.email && (
                      // @ts-ignore
                      <Text fontSize="$xs" color="$error500">
                        {errors.email.message}
                      </Text>
                    )}
                  </VStack>

                  {/* Password */}
                  {/* @ts-ignore */}
                  <VStack space="xs">
                    {/* @ts-ignore */}
                    <Text fontSize="$sm" fontWeight="$medium" color="$textLight700">
                      Senha
                    </Text>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Sua senha"
                          type={showPassword ? 'text' : 'password'}
                          isInvalid={!!errors.password}
                          // @ts-ignore
                          leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />}
                        />
                      )}
                    />
                    {errors.password && (
                      // @ts-ignore
                      <Text fontSize="$xs" color="$error500">
                        {errors.password.message}
                      </Text>
                    )}
                    {/* @ts-ignore */}
                    <Box alignItems="flex-end" mt="$1">
                      <Pressable onPress={() => setShowPassword(!showPassword)}>
                        {/* @ts-ignore */}
                        <Text fontSize="$sm" color="$primary500" fontWeight="$medium">
                          {showPassword ? 'Ocultar' : 'Mostrar'} senha
                        </Text>
                      </Pressable>
                    </Box>
                  </VStack>
                </VStack>

                {/* Submit Button */}
                <Button
                  title={isLoggingIn ? 'Entrando...' : 'Entrar'}
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isLoggingIn}
                  isDisabled={isLoggingIn}
                  // @ts-ignore
                  size="xl"
                  mt="$2"
                />

                {/* Register Link */}
                {/* @ts-ignore */}
                <HStack justifyContent="center" space="xs" mt="$4">
                  {/* @ts-ignore */}
                  <Text color="$textLight500">Não tem uma conta?</Text>
                  <Link href="/(auth)/register" asChild>
                    <Pressable>
                      {/* @ts-ignore */}
                      <Text color="$primary500" fontWeight="$bold">
                        Cadastre-se
                      </Text>
                    </Pressable>
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
