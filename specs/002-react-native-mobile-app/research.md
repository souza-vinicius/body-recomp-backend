# Research: React Native Mobile Application

**Feature**: 002-react-native-mobile-app  
**Date**: 2025-11-15  
**Status**: Complete

## Overview

This document consolidates research findings for building a cross-platform mobile application using React Native with Expo and Gluestack UI. All technical decisions are documented with rationale and alternatives considered.

## Technology Stack Decisions

### 1. React Native Framework: Expo Managed Workflow

**Decision**: Use Expo SDK 51+ with managed workflow

**Rationale**:
- **Rapid Development**: Expo provides out-of-the-box solutions for common needs (camera, storage, notifications, OTA updates)
- **Cross-Platform Consistency**: Single codebase for iOS and Android with consistent APIs
- **Easy Setup**: No need for Xcode or Android Studio for development
- **Built-in Tooling**: Expo Go for testing, EAS Build for production builds, EAS Update for OTA updates
- **Mature Ecosystem**: Expo SDK 51+ is stable and production-ready
- **Developer Experience**: Hot reloading, TypeScript support, file-based routing with Expo Router

**Alternatives Considered**:
- **React Native CLI (Bare Workflow)**: Rejected because it requires native module setup and doesn't provide the rapid development benefits needed for MVP. Expo can always be ejected later if needed.
- **Flutter**: Rejected because team expertise is in JavaScript/TypeScript, and React Native has larger community and more third-party libraries for fitness/health apps.
- **Native iOS/Android**: Rejected because maintaining two codebases would double development time and complexity.

**Best Practices**:
- Use Expo SDK modules instead of community packages when possible
- Keep app.json configuration simple initially
- Use EAS Build for production builds (not Expo build service)
- Configure over-the-air updates for quick bug fixes
- Test on physical devices regularly, not just Expo Go

---

### 2. UI Component Library: Gluestack UI v2

**Decision**: Use Gluestack UI v2 as primary component library

**Rationale**:
- **Modern Design System**: Production-ready components with consistent design tokens
- **Accessibility**: ARIA-compliant components built-in
- **Customization**: Theme-based customization with TypeScript support
- **Performance**: Optimized for React Native performance
- **Documentation**: Comprehensive docs with examples for all components
- **Active Maintenance**: Regular updates and community support
- **TypeScript First**: Full TypeScript support out of the box

**Alternatives Considered**:
- **React Native Paper**: Rejected because Material Design may not fit body recomposition app aesthetic; Gluestack more flexible
- **NativeBase**: Rejected because Gluestack UI is the evolution/successor of NativeBase with better performance
- **React Native Elements**: Rejected because less modern design system and fewer components
- **Custom Components**: Rejected because would require significant design and development time

**Best Practices**:
- Import only needed components to reduce bundle size
- Use Gluestack theme tokens for consistent spacing, colors, typography
- Extend Gluestack components for app-specific needs rather than building from scratch
- Follow Gluestack composition patterns for complex components
- Use Gluestack's responsive design utilities for different screen sizes

---

### 3. Navigation: Expo Router (React Navigation v6)

**Decision**: Use Expo Router for file-based routing

**Rationale**:
- **File-Based Routing**: Intuitive structure where file system = navigation structure
- **Type Safety**: Automatic TypeScript types for routes
- **Deep Linking**: Built-in support for deep links and universal links
- **Layouts**: Shared layouts reduce code duplication
- **Stack Navigation**: Native stack navigator for performance
- **Tab Navigation**: Built-in tab navigation support
- **Modern**: Latest approach recommended by Expo team

**Alternatives Considered**:
- **React Navigation directly**: Rejected because Expo Router provides file-based routing on top of React Navigation, reducing boilerplate
- **React Native Navigation (Wix)**: Rejected because native navigation is overkill for this app and has more complex setup

**Best Practices**:
- Use directory-based layouts `(tabs)`, `(auth)` for navigation groups
- Keep route components thin, delegate logic to hooks and services
- Use typed navigation params with TypeScript
- Implement auth guards in layouts
- Use `router.push()` for imperative navigation, `<Link>` for declarative

---

### 4. State Management & Data Fetching: React Query (TanStack Query)

**Decision**: Use React Query v5 for server state management

**Rationale**:
- **Built for APIs**: Designed specifically for asynchronous data fetching
- **Caching**: Automatic caching, background refetching, stale-while-revalidate
- **Optimistic Updates**: Easy optimistic UI updates for better UX
- **Offline Support**: Built-in offline query support and retry logic
- **DevTools**: React Query DevTools for debugging
- **TypeScript**: Full TypeScript support
- **Simple**: Minimal boilerplate compared to Redux for API data

**Alternatives Considered**:
- **Redux Toolkit + RTK Query**: Rejected because React Query is simpler for API-only state management
- **Context + useReducer**: Rejected because lacks caching, refetching, and offline capabilities
- **Zustand**: Rejected because better suited for client state, not server state
- **MobX**: Rejected because React Query better handles asynchronous data patterns

**Best Practices**:
- Use query keys with proper dependency arrays
- Implement optimistic updates for create/update operations
- Configure staleTime and cacheTime based on data volatility
- Use mutations for POST/PUT/DELETE operations
- Implement proper error boundaries
- Use `enabled` option for dependent queries

---

### 5. HTTP Client: Axios

**Decision**: Use Axios for API communication

**Rationale**:
- **Interceptors**: Easy to add auth tokens, error handling, logging
- **Request/Response Transformation**: Automatic JSON parsing
- **Timeout Support**: Built-in timeout configuration
- **Cancel Requests**: Ability to cancel in-flight requests
- **TypeScript Support**: Good TypeScript definitions
- **Wide Adoption**: Well-documented, large community

**Alternatives Considered**:
- **Fetch API**: Rejected because lacks interceptors and requires more boilerplate for error handling
- **Apollo Client**: Rejected because backend is REST, not GraphQL
- **ky**: Rejected because less mature in React Native ecosystem

**Best Practices**:
- Create single Axios instance with base configuration
- Use interceptors for token injection and refresh
- Implement request/response error handling globally
- Add timeout configuration (10-30 seconds)
- Use TypeScript types for request/response payloads
- Log API errors for debugging

---

### 6. Form Management: React Hook Form

**Decision**: Use React Hook Form v7 with Zod validation

**Rationale**:
- **Performance**: Minimizes re-renders with uncontrolled components
- **Validation**: Integrates seamlessly with Zod schemas
- **Developer Experience**: Simple API with TypeScript support
- **Bundle Size**: Lightweight (9KB)
- **React Native Support**: Works well with React Native inputs
- **Error Handling**: Built-in error state management

**Alternatives Considered**:
- **Formik**: Rejected because heavier and slower performance-wise
- **React Final Form**: Rejected because less active maintenance
- **Manual State**: Rejected because reinventing the wheel

**Best Practices**:
- Define Zod schemas for all forms
- Use `Controller` for React Native inputs
- Implement proper error display
- Use `watch` sparingly to avoid re-renders
- Reset forms after successful submission
- Handle async validation properly

---

### 7. Schema Validation: Zod

**Decision**: Use Zod for runtime validation

**Rationale**:
- **TypeScript First**: Generates TypeScript types from schemas
- **Runtime Safety**: Validates data at runtime, not just compile time
- **Composable**: Easy to compose and reuse schemas
- **Error Messages**: Clear, customizable error messages
- **React Hook Form Integration**: Works seamlessly with RHF
- **API Validation**: Can validate API responses

**Alternatives Considered**:
- **Yup**: Rejected because Zod has better TypeScript inference
- **Joi**: Rejected because designed for Node.js, not client-side
- **Custom Validation**: Rejected because Zod provides better DX

**Best Practices**:
- Create reusable schema fragments
- Use `.parse()` for API responses
- Use `.safeParse()` for user input
- Generate TypeScript types with `z.infer<typeof schema>`
- Implement custom error messages for UX
- Validate on client and trust backend validation

---

### 8. Secure Storage: Expo SecureStore

**Decision**: Use Expo SecureStore for authentication tokens

**Rationale**:
- **Security**: Uses Keychain (iOS) and Keystore (Android) for encryption
- **Expo Integration**: Part of Expo SDK, no additional setup
- **Simple API**: Easy to use async get/set methods
- **Biometric Support**: Can require biometric authentication
- **Platform-Specific**: Leverages native security features

**Alternatives Considered**:
- **AsyncStorage**: Rejected because not encrypted, unsuitable for tokens
- **react-native-keychain**: Rejected because Expo SecureStore provides same functionality
- **react-native-encrypted-storage**: Rejected because Expo SecureStore is simpler

**Best Practices**:
- Store only tokens, never passwords
- Implement token refresh logic
- Clear tokens on logout
- Handle storage errors gracefully
- Don't store sensitive data beyond tokens

---

### 9. Data Visualization: Victory Native

**Decision**: Use Victory Native for charts

**Rationale**:
- **React Native Optimized**: Built specifically for React Native
- **SVG-Based**: Smooth, scalable charts
- **Customizable**: Extensive customization options
- **TypeScript Support**: Good TypeScript definitions
- **Animations**: Built-in chart animations
- **Documentation**: Comprehensive examples

**Alternatives Considered**:
- **React Native Chart Kit**: Rejected because less flexible customization
- **Recharts**: Rejected because designed for web, not React Native
- **react-native-svg-charts**: Rejected because less active maintenance
- **Custom D3**: Rejected because too complex for this use case

**Best Practices**:
- Use VictoryLine for body fat trends
- Implement responsive chart sizing
- Add touch interactions for data points
- Use consistent color scheme from Gluestack theme
- Optimize data points for performance (limit to 50-100 points)

---

### 10. Testing Strategy

**Decision**: Multi-layer testing approach

**Testing Stack**:
1. **E2E Tests**: Maestro (preferred) or Detox
2. **Component Tests**: React Native Testing Library
3. **Unit Tests**: Jest
4. **Type Safety**: TypeScript

**Rationale**:
- **Maestro**: Simpler setup than Detox, YAML-based tests, cloud testing
- **RNTL**: Official recommendation for React Native component testing
- **Jest**: Standard for React Native unit testing
- **TypeScript**: Catches type errors at compile time

**Alternatives Considered**:
- **Appium**: Rejected because Maestro/Detox are more React Native specific
- **Cypress**: Rejected because designed for web, not mobile

**Best Practices**:
- Follow test-first development (write failing tests first)
- E2E tests for critical user journeys (auth, goal creation, progress logging)
- Component tests for complex UI logic
- Unit tests for utilities, validators, formatters
- Mock API responses with MSW or similar
- Test accessibility features

---

### 11. Performance Optimization

**Strategies**:
- **Code Splitting**: Use `React.lazy()` for heavy screens
- **Image Optimization**: Use Expo Image with caching
- **List Virtualization**: Use `FlashList` instead of `FlatList` for long lists
- **Memoization**: Use `React.memo`, `useMemo`, `useCallback` strategically
- **Bundle Size**: Analyze bundle with `expo-updates` and optimize
- **Network**: Implement proper loading states and optimistic updates

**Rationale**: Mobile apps require careful performance tuning. These strategies ensure 60 FPS and quick load times.

---

### 12. Offline Support Strategy

**Approach**:
- Use React Query's `networkMode: 'offlineFirst'`
- Cache API responses in AsyncStorage
- Queue mutations when offline
- Show clear offline indicators
- Sync when connection restored
- Implement retry logic

**Rationale**: Users may log measurements in gyms with poor connectivity. Offline support is critical for good UX.

---

## Development Workflow

### Environment Setup
1. Install Node.js 18+ and npm/yarn
2. Install Expo CLI globally: `npm install -g expo-cli`
3. Install Expo Go app on test devices
4. Install EAS CLI: `npm install -g eas-cli`
5. Configure EAS for builds

### Development
1. `npx expo start` for development server
2. Use Expo Go for testing during development
3. Use EAS Build for production/preview builds
4. Use EAS Update for OTA updates

### Testing
1. `npm test` for unit tests
2. `npm run test:e2e` for E2E tests
3. Test on physical devices regularly
4. Use Expo DevClient for custom native code

---

## Security Considerations

### Token Management
- Store JWT tokens in Expo SecureStore
- Implement automatic token refresh
- Clear tokens on logout
- Never log tokens

### API Communication
- Always use HTTPS
- Validate SSL certificates
- Implement request timeouts
- Sanitize user input before sending

### Data Privacy
- No sensitive data in AsyncStorage (only cache)
- Implement proper error logging (no sensitive data)
- Follow GDPR requirements for data handling
- Implement user data export/delete flows

---

## Deployment Strategy

### Development
- Use Expo Go for rapid testing
- Use development builds for native modules

### Staging
- Use EAS Preview builds
- Test on TestFlight (iOS) and Google Play Internal Testing (Android)
- Use EAS Update for OTA fixes

### Production
- Use EAS Production builds
- Submit to App Store and Google Play
- Use EAS Update for non-native code updates
- Monitor crashes with Sentry or similar

---

## Dependencies Summary

### Core
- `expo` (^51.0.0)
- `react` (^18.2.0)
- `react-native` (^0.74.0)
- `typescript` (^5.3.0)

### UI & Navigation
- `@gluestack-ui/themed` (^2.0.0)
- `expo-router` (^3.5.0)
- `react-native-safe-area-context` (^4.10.0)
- `react-native-screens` (^3.31.0)

### Data & State
- `@tanstack/react-query` (^5.0.0)
- `axios` (^1.6.0)
- `react-hook-form` (^7.50.0)
- `zod` (^3.22.0)

### Storage
- `expo-secure-store` (^13.0.0)
- `@react-native-async-storage/async-storage` (^1.23.0)

### Charts & Visualization
- `victory-native` (^37.0.0)
- `react-native-svg` (^15.0.0)

### Testing
- `jest` (^29.7.0)
- `@testing-library/react-native` (^12.4.0)
- `@maestro/cli` (latest)

### DevTools
- `@tanstack/react-query-devtools` (^5.0.0)
- `react-devtools` (^5.0.0)

---

## Open Questions & Risks

### Resolved
✅ UI Library choice → Gluestack UI v2  
✅ Navigation approach → Expo Router  
✅ State management → React Query  
✅ Testing framework → Maestro + RNTL + Jest  
✅ Chart library → Victory Native  

### Remaining (Low Risk)
- **Analytics**: Which analytics platform? (Expo Analytics, Firebase Analytics, Mixpanel)
  - **Recommendation**: Start with Expo Analytics, add Firebase later if needed
- **Crash Reporting**: Sentry vs BugSnag vs Firebase Crashlytics
  - **Recommendation**: Sentry (free tier sufficient, good React Native support)
- **Push Notifications**: When to implement? (Not MVP)
  - **Recommendation**: Phase 2 feature
- **Biometric Auth**: iOS Face ID / Android Fingerprint support?
  - **Recommendation**: Phase 2 feature, use `expo-local-authentication`

---

## Conclusion

All technical decisions are documented with clear rationale. The stack is production-ready, well-supported, and aligns with React Native best practices. No blocking unknowns remain. Ready to proceed to Phase 1: Data Model and Contracts.
