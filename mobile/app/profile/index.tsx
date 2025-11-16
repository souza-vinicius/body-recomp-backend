/**
 * Profile Home Screen
 * Displays current user profile information
 */

import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Heading,
  Pressable,
} from '@gluestack-ui/themed';
import { useProfile } from '../../src/hooks/useProfile';
import { useAuth } from '../../src/hooks/useAuth';

export default function ProfileHomeScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box style={styles.container} justifyContent="center" alignItems="center" padding={24}>
        <Text style={styles.emptyTitle}>Profile Not Found</Text>
        <Text style={styles.emptyText}>Unable to load your profile information.</Text>
      </Box>
    );
  }

  const methodLabels = {
    NAVY: 'US Navy Method',
    JACKSON_POLLOCK_3: 'Jackson-Pollock 3-Site',
    JACKSON_POLLOCK_7: 'Jackson-Pollock 7-Site',
  };

  const unitLabels = {
    METRIC: 'Metric (kg, cm)',
    IMPERIAL: 'Imperial (lb, in)',
  };

  return (
    <ScrollView style={styles.container}>
      <Box padding={16}>
        <VStack gap={20}>
          {/* Header */}
          <Box>
            <Heading style={styles.header}>Profile</Heading>
            <Text style={styles.subheader}>Manage your account and preferences</Text>
          </Box>

          {/* Account Information */}
          <Box style={styles.card}>
            <HStack justifyContent="space-between" alignItems="center" marginBottom={16}>
              <Text style={styles.cardTitle}>Account Information</Text>
              <Pressable onPress={() => router.push('/profile/edit')}>
                <Text style={styles.editLink}>Edit</Text>
              </Pressable>
            </HStack>
            <VStack gap={12}>
              <Box>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{profile.email}</Text>
              </Box>
              <Box>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{profile.age} years</Text>
              </Box>
              <Box>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{profile.gender}</Text>
              </Box>
              <Box>
                <Text style={styles.label}>Height</Text>
                <Text style={styles.value}>{profile.heightCm} cm</Text>
              </Box>
              <Box>
                <Text style={styles.label}>Weight</Text>
                <Text style={styles.value}>{profile.weightKg} kg</Text>
              </Box>
            </VStack>
          </Box>

          {/* Preferences */}
          <Box style={styles.card}>
            <HStack justifyContent="space-between" alignItems="center" marginBottom={16}>
              <Text style={styles.cardTitle}>Preferences</Text>
              <Pressable onPress={() => router.push('/profile/settings')}>
                <Text style={styles.editLink}>Settings</Text>
              </Pressable>
            </HStack>
            <VStack gap={12}>
              <Box>
                <Text style={styles.label}>Body Fat Calculation Method</Text>
                <Text style={styles.value}>{methodLabels[profile.preferredMethod]}</Text>
              </Box>
              {profile.unitPreference && (
                <Box>
                  <Text style={styles.label}>Unit Preference</Text>
                  <Text style={styles.value}>{unitLabels[profile.unitPreference]}</Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Account Actions */}
          <Box style={styles.card}>
            <Text style={styles.cardTitle}>Account Actions</Text>
            <VStack gap={12} marginTop={16}>
              <Button
                onPress={handleLogout}
                style={styles.logoutButton}
                variant="outline"
              >
                <ButtonText style={styles.logoutButtonText}>Logout</ButtonText>
              </Button>
            </VStack>
          </Box>

          {/* Account Info */}
          <Box style={styles.infoCard}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
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
    fontSize: 28,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
  },
  logoutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  logoutButtonText: {
    color: '#EF4444',
  },
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
});
