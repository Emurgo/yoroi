# Yoroi Dual App Build Setup

This setup allows you to build both nightly and production versions of Yoroi with different bundle identifiers and configurations.

## Overview

- **Nightly App**: `com.emurgo.yoroi-nightly` (iOS) / `com.emurgo.nightly` (Android)
- **Production App**: `com.emurgo.yoroi` (iOS) / `com.emurgo` (Android)

## Configuration Files

### App Configurations

- `app.config.js` - Dynamic configuration that switches based on environment
- `app.config.nightly.js` - Nightly-specific configuration
- `app.config.production.js` - Production-specific configuration

### Metro Configurations

- `metro.config.js` - Default Metro configuration
- `metro.config.nightly.js` - Nightly-specific Metro configuration
- `metro.config.production.js` - Production-specific Metro configuration

### Environment Files

- `env.nightly` - Nightly environment variables
- `env.production` - Production environment variables

### Build Configuration

- `eas.json` - EAS build profiles for both apps

## Usage

### Development

#### Start Development Server

```bash
# Default (development)
npm start

# Nightly
npm run start:nightly

# Production
npm run start:production
```

#### Run on Device/Simulator

```bash
# Android
npm run android:nightly      # Nightly
npm run android:production   # Production

# iOS
npm run ios:nightly          # Nightly
npm run ios:production       # Production
```

### Building

#### Using NPM Scripts

```bash
# Android
npm run build:android:nightly      # Build APK for nightly
npm run build:android:production   # Build AAB for production

# iOS
npm run build:ios:nightly          # Build IPA for nightly
npm run build:ios:production       # Build IPA for production
```

#### Using Shell Scripts

```bash
# Build both platforms for nightly
./scripts/build-nightly.sh

# Build both platforms for production
./scripts/build-production.sh
```

#### Using EAS CLI Directly

```bash
# Nightly builds
eas build --platform android --profile nightly
eas build --platform ios --profile nightly

# Production builds
eas build --platform android --profile production
eas build --platform ios --profile production
```

## Environment Variables

### Nightly Environment

```bash
BUILD_VARIANT=NIGHTLY
APP_STORE_BUNDLE_ID=com.emurgo.yoroi-nightly
ANDROID_PACKAGE_NAME=com.emurgo.nightly
ANDROID_TRACK=internal
```

### Production Environment

```bash
BUILD_VARIANT=PRODUCTION
APP_STORE_BUNDLE_ID=com.emurgo.yoroi
ANDROID_PACKAGE_NAME=com.emurgo
ANDROID_TRACK=production
```

## Key Differences

### Bundle Identifiers

- **Nightly**: `com.emurgo.yoroi-nightly` (iOS) / `com.emurgo.nightly` (Android)
- **Production**: `com.emurgo.yoroi` (iOS) / `com.emurgo` (Android)

### App Names

- **Nightly**: "yoroi-nightly"
- **Production**: "yoroi"

### Icons and Assets

- **Nightly**: Uses `./assets/yoroi-nightly/` assets
- **Production**: Uses `./assets/yoroi/` assets

### Build Variants

- **Nightly**: `BUILD_VARIANT=NIGHTLY`
- **Production**: `BUILD_VARIANT=PRODUCTION`

### Android Distribution

- **Nightly**: Internal track (APK)
- **Production**: Production track (AAB)

## Setup Requirements

### iOS

- App Store Connect setup for both apps
- Provisioning profiles for both bundle identifiers
- Apple Developer account with appropriate certificates

### Android

- Google Play Console setup for both apps
- Different keystore files:
  - `$HOME/.yoroi/android/nightly.keystore`
  - `$HOME/.yoroi/android/production.keystore`
- Service account JSON file: `$HOME/.yoroi/android/service-account.json`

### Environment Setup

Make sure you have the following environment variables set or use the provided environment files:

- `APP_STORE_KEY_ID`
- `APP_STORE_ISSUER_ID`
- `APP_STORE_KEY_PATH`
- `ANDROID_SA_FILE`
- `ANDROID_KEYSTORE_FILE`
- `ANDROID_KEYSTORE_ALIAS`

## Troubleshooting

### Common Issues

1. **Bundle Identifier Conflicts**: Ensure both apps have unique bundle identifiers
2. **Asset Paths**: Verify that all asset paths exist for both configurations
3. **Environment Variables**: Check that all required environment variables are set
4. **Keystore Files**: Ensure keystore files exist and are accessible

### Debugging

To debug which configuration is being used:

```bash
# Check current build variant
echo $BUILD_VARIANT

# Check app config being used
echo $EXPO_PUBLIC_APP_CONFIG
```

### Switching Between Configurations

The system automatically switches based on the `BUILD_VARIANT` environment variable:

- `NIGHTLY` or contains "nightly" → Uses nightly configuration
- `PRODUCTION` or contains "production" → Uses production configuration
- Default → Uses development configuration
