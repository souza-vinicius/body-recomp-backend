import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const USER_PREFERENCES_KEY = '@body_recomp:preferences';
const CACHED_DATA_PREFIX = '@body_recomp:cache:';

export interface UserPreferences {
  measurementUnit: 'metric' | 'imperial';
  preferredCalculationMethod?: 'navy' | '3-site' | '7-site';
  notificationsEnabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Save user preferences to AsyncStorage
 */
export const savePreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw new Error('Failed to save user preferences');
  }
};

/**
 * Get user preferences from AsyncStorage
 */
export const getPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as UserPreferences;
  } catch (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
};

/**
 * Clear user preferences from AsyncStorage
 */
export const clearPreferences = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing preferences:', error);
    throw new Error('Failed to clear user preferences');
  }
};

/**
 * Cache data for offline access
 */
export const cacheData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheKey = `${CACHED_DATA_PREFIX}${key}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching data:', error);
    throw new Error('Failed to cache data');
  }
};

/**
 * Get cached data
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cacheKey = `${CACHED_DATA_PREFIX}${key}`;
    const data = await AsyncStorage.getItem(cacheKey);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHED_DATA_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw new Error('Failed to clear cache');
  }
};

/**
 * Clear all app data (preferences and cache)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error('Failed to clear all data');
  }
};
