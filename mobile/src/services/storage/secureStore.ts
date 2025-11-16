import * as SecureStore from 'expo-secure-store';

// Keys for storing tokens in SecureStore
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Save authentication tokens to secure storage
 */
export const saveTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw new Error('Failed to save authentication tokens');
  }
};

/**
 * Get authentication tokens from secure storage
 */
export const getTokens = async (): Promise<TokenPair | null> => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
};

/**
 * Clear all authentication tokens from secure storage
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw new Error('Failed to clear authentication tokens');
  }
};

/**
 * Check if user has valid tokens stored
 */
export const hasTokens = async (): Promise<boolean> => {
  const tokens = await getTokens();
  return tokens !== null;
};
