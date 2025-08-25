# Versioning and Building Guide

This document explains how version bumping and building works in the Yoroi mobile app.

## 📋 Table of Contents

1. [Version Structure](#version-structure)
2. [Version Bumping](#version-bumping)
3. [Build Configuration](#build-configuration)
4. [Building Process](#building-process)
5. [Signing](#signing)
6. [Deployment](#deployment)

## 🔢 Version Structure

### Current Version Setup

- **Package Version**: `1.0.0` (semantic versioning)
- **Build Number**: Stored in `package.json` → `build` field, incremented for each build
- **Platform-Specific**:
  - **iOS**: Uses `CFBundleShortVersionString` (version) + `CFBundleVersion` (build number)
  - **Android**: Uses `versionName` (version) + `versionCode` (build number)

### Version Sources

1. **Primary Source**: `package.json` → `version` field
2. **Build Number**: `package.json` → `build` field
3. **App Configs**: All config files inherit from `package.json`
   - `app.config.js` (development)
   - `app.config.nightly.js` (nightly builds)
   - `app.config.production.js` (production builds)

## 🔄 Version Bumping

### Automated Version Bumping

Use the version bump script:

```bash
# Bump patch version (1.0.0 → 1.0.1)
./scripts/version-bump.sh patch

# Bump minor version (1.0.1 → 1.1.0)
./scripts/version-bump.sh minor

# Bump major version (1.1.0 → 2.0.0)
./scripts/version-bump.sh major

# Bump build number only (keep same version)
./scripts/version-bump.sh build

# Set specific version
./scripts/version-bump.sh set 2.1.3

# Set build number for builds
./scripts/set-build-number.sh auto  # Auto-increment
./scripts/set-build-number.sh 42    # Set specific build number

# Dry run (preview changes without applying)
./scripts/version-bump.sh patch --dry-run
```

### What Gets Updated

1. **`package.json`**: `version` and `build` fields
2. **App Config Files**: `version` field in all config files
3. **Build Numbers**: 
   - **iOS**: `buildNumber` in app configs
   - **Android**: `versionCode` in app configs
   - **Environment**: `BUILD_NUMBER` exported for builds
4. **Git**: Creates commit and tag (when not dry-run)

### Manual Version Updates

If you need to update versions manually:

```bash
# Update package.json
npm version patch  # or minor, major

# Update app configs manually
sed -i "s/version: '[^']*'/version: '1.0.1'/g" app.config.*.js
```

## 🏗️ Build Configuration

### Build Variants

The app supports three build variants:

1. **Development** (`app.config.js`)
   - Bundle ID: `com.emurgo.yoroi`
   - Package: `com.emurgo.dev`
   - Name: "Yoroi Dev"

2. **Nightly** (`app.config.nightly.js`)
   - Bundle ID: `com.emurgo.yoroi-nightly`
   - Package: `com.emurgo.nightly`
   - Name: "Yoroi Nightly"
   - Track: Internal Testing

3. **Production** (`app.config.production.js`)
   - Bundle ID: `com.emurgo`
   - Package: `com.emurgo`
   - Name: "Yoroi"
   - Track: Production

### Environment Variables

Key environment variables for builds:

```bash
# Build variant selection
BUILD_VARIANT=NIGHTLY|PRODUCTION
EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js|app.config.production.js

# Build number
BUILD_NUMBER=42

# Android signing
ANDROID_KEYSTORE_FILE=~/.yoroi/android/nightly.keystore
ANDROID_KEYSTORE_PASSWORD=<from-pass-file>
ANDROID_KEYSTORE_ALIAS=my-key-alias

# iOS signing (handled by Xcode/App Store Connect)
APP_STORE_KEY_ID=PH9Z89M567
APP_STORE_ISSUER_ID=feff08c0-5259-4e9a-bdbe-26cdb046e1d5
APP_STORE_KEY_PATH=~/.yoroi/ios/AuthKey_PH9Z89M567.p8
```

## 🔨 Building Process

### Build Methods

#### 1. EAS Build (Recommended)

```bash
# Set build number first
./scripts/set-build-number.sh auto

# Local builds
npx eas build --platform android --profile nightly --local
npx eas build --platform ios --profile nightly --local

# Cloud builds
npx eas build --platform android --profile nightly
npx eas build --platform ios --profile nightly
```

#### 2. Fastlane (Legacy)

```bash
# Set build number first
./scripts/set-build-number.sh auto

# Set signing credentials
source scripts/export-android-pass.sh ~/.yoroi/android/nightly.pass
export ANDROID_KEYSTORE_FILE="$HOME/.yoroi/android/nightly.keystore"
export ANDROID_KEYSTORE_ALIAS="my-key-alias"

# Run fastlane
cd fastlane
DRY_RUN=true bundle exec fastlane android nightly
DRY_RUN=true bundle exec fastlane ios nightly
```

#### 3. Direct Expo Commands

```bash
# Android
EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js BUILD_VARIANT=NIGHTLY npx expo run:android --variant release

# iOS
EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js BUILD_VARIANT=NIGHTLY npx expo run:ios --configuration Release
```

### Build Outputs

#### Android

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Format**: AAB for Play Store, APK for direct distribution

#### iOS

- **App**: `~/Library/Developer/Xcode/DerivedData/yoroi-*/Build/Products/Release-iphonesimulator/yoroi.app`
- **Archive**: `~/Library/Developer/Xcode/Archives/`
- **IPA**: Generated from archive for distribution

## 🔐 Signing

### Android Signing

```bash
# Export signing credentials
source scripts/export-android-pass.sh ~/.yoroi/android/nightly.pass
export ANDROID_KEYSTORE_FILE="$HOME/.yoroi/android/nightly.keystore"
export ANDROID_KEYSTORE_ALIAS="my-key-alias"
export ANDROID_KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASS"

# Sign existing APK/AAB
./scripts/sign-android.sh path/to/app.apk
./scripts/sign-android.sh path/to/app.aab
```

### iOS Signing

```bash
# Export IPA from archive
./scripts/export-ios-ipa.sh yoroi Release auto ./dist app-store
```

### Signing Files Location

```
~/.yoroi/
├── android/
│   ├── nightly.keystore
│   ├── nightly.pass
│   ├── production.keystore
│   ├── production.pass
│   └── service-account.json
└── ios/
    └── AuthKey_PH9Z89M567.p8
```

## 🚀 Deployment

### Automated Deployment Scripts

```bash
# Nightly deployment
./scripts/publish-nightly.sh

# Production deployment
./scripts/publish-production.sh
```

### Manual Deployment Steps

#### Android (Play Store)

1. Build signed AAB
2. Upload to Play Console
3. Release to Internal Testing/Production

#### iOS (App Store/TestFlight)

1. Build and archive
2. Export IPA
3. Upload to App Store Connect
4. Submit for review/release

### Dry Run Mode

```bash
# Enable dry run (no uploads)
export DRY_RUN=true

# Or use the convenience scripts
./scripts/dry-run-on.sh
./scripts/dry-run-off.sh
```

## 📝 Best Practices

### Version Management

1. **Always bump version before release**
2. **Use semantic versioning** (major.minor.patch)
3. **Test with dry-run first**
4. **Tag releases in git**

### Build Process

1. **Clean build folders** before building
2. **Verify signing** before deployment
3. **Test on both platforms**
4. **Use EAS Build for production**

### Signing Security

1. **Never commit signing files**
2. **Use environment variables** for passwords
3. **Rotate keys regularly**
4. **Backup signing credentials securely**

## 🔧 Troubleshooting

### Common Issues

#### Version Mismatch

```bash
# Check current versions
node -p "require('./package.json').version"
grep "version:" app.config.*.js
```

#### Signing Issues

```bash
# Verify Android signing
jarsigner -verify -verbose app-release.aab

# Check iOS signing
codesign -dv --verbose=4 yoroi.app
```

#### Build Failures

```bash
# Clean build folders
rm -rf android/build android/app/build android/.gradle
rm -rf ios/build

# Clear Expo cache
npx expo start --clear
```

## 📚 Additional Resources

- [Expo Build Properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Fastlane Documentation](https://docs.fastlane.tools/)
- [Semantic Versioning](https://semver.org/)
