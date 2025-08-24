# Local Build Setup (Without EAS)

You can build your Yoroi apps locally without using EAS cloud builds. This approach uses Expo's local build system.

## Prerequisites

### For Android Local Builds
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK)
- Keystore files in place:
  - `$HOME/.yoroi/android/nightly.keystore`
  - `$HOME/.yoroi/android/production.keystore`

### For iOS Local Builds
- Xcode installed (macOS only)
- iOS Developer account
- Provisioning profiles for both bundle identifiers
- Certificates configured in Xcode

## Local Build Commands

### Using Shell Scripts
```bash
# Build nightly locally
./scripts/build-local-nightly.sh

# Build production locally
./scripts/build-local-production.sh
```

### Using NPM Scripts
```bash
# Build nightly locally
npm run build:local:nightly

# Build production locally
npm run build:local:production
```

### Manual Commands
```bash
# Set environment and build manually
export BUILD_VARIANT=NIGHTLY
export EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js

# Android
npx expo run:android --variant release

# iOS
npx expo run:ios --configuration Release
```

## Build Output Locations

### Android
- **APK files**: `android/app/build/outputs/apk/release/`
- **AAB files**: `android/app/build/outputs/bundle/release/`

### iOS
- **IPA files**: Generated in Xcode's derived data or specified output directory

## Configuration

The local builds use the same configuration files as EAS builds:
- `app.config.nightly.js` / `app.config.production.js`
- `env.nightly` / `env.production`
- Environment variables for bundle identifiers and keystores

## Advantages of Local Builds

✅ **No EAS dependency** - Build without cloud services  
✅ **Faster iteration** - No upload/download time  
✅ **Offline capability** - Build without internet  
✅ **Full control** - Direct access to build process  
✅ **Cost effective** - No EAS build minutes used  

## Disadvantages of Local Builds

❌ **Platform specific** - iOS builds require macOS  
❌ **Setup complexity** - Need local development environment  
❌ **Resource intensive** - Uses local machine resources  
❌ **Manual management** - Need to handle certificates/keystores manually  

## Troubleshooting

### Common Issues

1. **Android Build Issues**
   ```bash
   # Clean and rebuild
   cd android && ./gradlew clean && cd ..
   npx expo run:android --variant release
   ```

2. **iOS Build Issues**
   ```bash
   # Clean Xcode build
   npx expo run:ios --clear
   ```

3. **Environment Variables**
   ```bash
   # Check current environment
   echo $BUILD_VARIANT
   echo $EXPO_PUBLIC_APP_CONFIG
   ```

### Keystore Issues
Make sure your keystore files exist and are accessible:
```bash
ls -la $HOME/.yoroi/android/
# Should show: nightly.keystore, production.keystore
```

### Certificate Issues (iOS)
- Open Xcode
- Go to Preferences → Accounts
- Ensure certificates and provisioning profiles are up to date
- Check that both bundle identifiers have valid profiles

## Hybrid Approach

You can use both local and EAS builds:
- **Local builds** for development and testing
- **EAS builds** for CI/CD and production releases

This gives you flexibility to choose the best approach for each situation.
