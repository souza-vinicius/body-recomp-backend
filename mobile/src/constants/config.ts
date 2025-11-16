// Environment configuration for the mobile app
import { Platform } from 'react-native';

// Resolve correct host for emulator/device in development
// Android emulator cannot reach host via localhost; uses 10.0.2.2
const DEV_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

const ENV = {
  development: {
    // Base REST path updated to include version segment
    API_BASE_URL: `${DEV_HOST}/api/v1`,
    API_TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: 'https://api.bodyrecomp.com/api/v1',
    API_TIMEOUT: 30000,
  },
};

// Determine current environment
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

export default getEnvVars();
