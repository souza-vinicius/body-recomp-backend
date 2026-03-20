# Capacitor Integration

This directory contains configuration and native packages for building the Body Recomp PWA as a native iOS/Android shell.

## Requirements
- Node.js 18+
- XCode (for iOS)
- Android Studio (for Android)
- `npx @capacitor/cli` installed.

## Workflow

1. Build Next.js (ensure static export is configured in `next.config.js`):
```bash
npm run build
```

2. Sync the built `/out` directory with native platforms:
```bash
npx cap sync
```

3. Open IDE and run:
```bash
npx cap open ios
# OR
npx cap open android
```
