# Body Recomp Mobile App

React Native mobile application for body recomposition tracking built with Expo.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **UI Library**: Gluestack UI v2
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Storage**: Expo SecureStore (tokens), AsyncStorage (cache)

## Prerequisites

- Node.js 20+ (recommended)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- iOS Simulator or Android Emulator (optional)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
   - Update `src/constants/config.ts` with your API base URL
   - For development, the default is `http://localhost:8000/api`

3. Start the development server:
```bash
npm start
```

4. Run on a platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
mobile/
├── app/                    # Expo Router app directory (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── profile/           # Profile and settings
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Generic components (Button, Input, Card)
│   │   ├── measurements/  # Measurement-specific components
│   │   ├── goals/         # Goal-specific components
│   │   ├── progress/      # Progress tracking components
│   │   └── charts/        # Data visualization components
│   ├── services/
│   │   ├── api/          # API client and endpoints
│   │   ├── storage/      # SecureStore and AsyncStorage wrappers
│   │   └── validation/   # Zod schemas
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── constants/        # App configuration and theme
├── __tests__/            # Test files
│   ├── e2e/             # End-to-end tests
│   ├── integration/      # Integration tests
│   └── unit/            # Unit tests
└── assets/              # Images, fonts, icons
```

## Development Workflow

### Adding a New Feature

1. Create necessary type definitions in `src/types/`
2. Add Zod schemas in `src/services/validation/`
3. Implement API functions in `src/services/api/`
4. Create React Query hooks in `src/hooks/`
5. Build UI components in `src/components/`
6. Add screens in `app/` directory

### Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## API Integration

The app connects to the Body Recomp backend API. Key endpoints:

- **Authentication**: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`
- **Measurements**: `/api/measurements`
- **Goals**: `/api/goals`
- **Progress**: `/api/goals/:id/progress`
- **Plans**: `/api/goals/:id/plans`
- **Profile**: `/api/profile`

All API requests include JWT tokens from SecureStore for authentication.

## Environment Configuration

Edit `src/constants/config.ts` to configure:
- API base URL (development vs production)
- Request timeout
- Other app-wide settings

## Deployment

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Over-the-Air Updates

```bash
# Publish update
eas update --branch production
```

## Troubleshooting

### Metro bundler issues
```bash
# Clear Metro cache
npm start -- --clear
```

### Dependency issues
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

## License

Private - Body Recomp Backend Project
