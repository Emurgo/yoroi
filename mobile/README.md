# Yoroi Mobile Wallet

A secure, multi-platform Cardano wallet built with React Native and Expo. Yoroi provides a user-friendly interface for managing ADA and other Cardano-based assets across iOS and Android platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Platform-Specific Instructions](#platform-specific-instructions)
  - [iOS Development](#ios-development)
  - [Android Development](#android-development)
- [Build and Deployment](#build-and-deployment)
  - [EAS Build](#eas-build)
  - [Local Builds](#local-builds)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v22.12.0) - [Download](https://nodejs.org/)
- **Git** (latest version) - [Download](https://git-scm.com/)
- **Rust** (v1.86.0) - [Download](https://rustup.rs/)
- **Java Development Kit (JDK)** (v17.0.10+7) - [Download](https://adoptium.net/)
- **Ruby** (v3.2.2) - [Download](https://www.ruby-lang.org/)
- **Python** (v3.11.3) - [Download](https://www.python.org/)

### Platform-Specific Requirements

#### For iOS Development

- **macOS** (required for iOS development)
- **Xcode** (v15.0 or higher) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **iOS Simulator** (included with Xcode)
- **CocoaPods** - Install with: `sudo gem install cocoapods`

#### For Android Development

- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** (API level 35)
- **Android NDK** (v27.0.12077973)
- **Java Development Kit (JDK)** (v17 or higher)
- **Alternative**: Use asdf to install all dependencies from .tool-versions:\*\*

### Rust Toolchain (Required for Native Modules)

The app uses Rust-based native modules that need to be compiled for each platform:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env

# Set default Rust version
rustup default 1.86

# Add platform targets
rustup target add \
  aarch64-apple-darwin \
  aarch64-apple-ios \
  aarch64-apple-ios-sim \
  aarch64-linux-android \
  armv7-linux-androideabi \
  i686-linux-androideabi \
  wasm32-unknown-unknown \
  x86_64-apple-ios \
  x86_64-linux-android
```

```bash
asdf install
```

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/emurgo/yoroi.git
   cd yoroi/mobile
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

## Development Setup

### Environment Configuration

The app supports multiple build variants:

- **Development** - Default development build

- **Production** - Release build

### Start Development Server

```bash
# Start Expo development server
npm start

# Or for specific variants:
npm run start:production
```

### Available Scripts

```bash
# Development
npm start                    # Start Expo dev server
npm run start:nightly       # Start with nightly config
npm run start:production    # Start with production config

# Platform-specific development
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
npm run web                 # Run on web browser

# Device testing
npm run ios:device          # Run on physical iOS device
npm run android:device      # Run on physical Android device

# Reset and rebuild
npm run ios:reset           # Clean and rebuild iOS
npm run android:reset       # Clean and rebuild Android

# Code quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run tsc                 # TypeScript type checking
npm run test                # Run tests
npm run format              # Format code with Prettier
```

## Platform-Specific Instructions

### iOS Development

#### Prerequisites

- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing)

#### Setup Steps

1. **Install iOS dependencies:**

   ```bash
   cd ios && pod install && cd ..
   ```

2. **Run on iOS Simulator:**

   ```bash
   npm run ios
   ```

3. **Run on Physical Device:**

   ```bash
   npm run ios:device
   ```

4. **Build for iOS:**

   ```bash
   # Development build
   npx expo run:ios --configuration Debug

   # Production build
   npx expo run:ios --configuration Release
   ```

#### iOS-Specific Features

- Face ID/Touch ID authentication
- Camera access for QR code scanning
- Bluetooth for hardware wallet connection
- Background app refresh
- Push notifications

### Android Development

#### Prerequisites

- Android Studio with Android SDK
- Android emulator or physical device
- Java Development Kit (JDK 17+)

#### Setup Steps

1. **Configure Android SDK:**

   - Open Android Studio
   - Go to SDK Manager
   - Install Android SDK API 35
   - Install Android NDK v27.0.12077973

2. **Set Environment Variables:**

   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Run on Android Emulator:**

   ```bash
   npm run android
   ```

4. **Run on Physical Device:**

   ```bash
   npm run android:device
   ```

5. **Build for Android:**

   ```bash
   # Development build
   npx expo run:android --variant debug

   # Production build
   npx expo run:android --variant release
   ```

#### Android-Specific Features

- Fingerprint/Biometric authentication
- Camera access for QR code scanning
- Bluetooth for hardware wallet connection
- Edge-to-edge display support
- Adaptive icons

## Build and Deployment

### EAS Build (Recommended)

The project uses Expo Application Services (EAS) for cloud builds:

#### Prerequisites

- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli`
- EAS account: `eas login`

#### Build Commands

```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Preview build (internal testing)
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# Build for all platforms
eas build --platform all --profile production
```

#### Build Profiles

- **development** - Development client with debugging
- **preview** - Internal testing build
- **production** - App Store/Play Store ready build

### Local Builds

#### iOS Local Build

1. **Configure Xcode project:**

   ```bash
   npx expo prebuild --platform ios
   ```

   > **Warning:** This command can overwrite files in `ios/`. In this repo, only run it when you intentionally want to regenerate/sync native changes (e.g., after adding/removing a native plugin). For routine development, use `npm run ios` instead.

2. **Open in Xcode:**

   ```bash
   open ios/yoroi.xcworkspace
   ```

3. **Build and archive in Xcode**

#### Android Local Build

1. **Configure Android project:**

   ```bash
   npx expo prebuild --platform android
   ```

   > **Warning:** Same as above for Android. This command can overwrite files in `android/`. Only run it when you intentionally want to regenerate/sync native changes (e.g., after adding/removing a native plugin). For routine development, use `npm run android` instead.

2. **Build APK:**

   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Build AAB (for Play Store):**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

## Configuration

### Environment Variables

The app uses environment variables for configuration:

```bash
# Build variant
EXPO_PUBLIC_BUILD_VARIANT=PROD|NIGHTLY|DEV

# Sentry DSN for error tracking
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Network configuration
EXPO_PUBLIC_USE_TESTNET=true|false

# API keys
EXPO_PUBLIC_UNSTOPPABLE_API_KEY=your_api_key
```

### App Configuration

Configuration files are located in the root directory:

- `eas.json` - Main Expo configuration

### Platform-Specific Configuration

#### iOS Configuration

- Bundle identifier: `com.emurgo.yoroi`
- Minimum iOS version: 15.1
- Permissions: Camera, Location, Bluetooth, Face ID

#### Android Configuration

- Package name: `com.emurgo`
- Target SDK: 35
- Minimum SDK: 24
- Permissions: Camera, Location, Bluetooth, Biometric

## Troubleshooting

### Common Issues

#### iOS Issues

**Build fails with Rust errors:**

```bash
# Clean and rebuild Rust modules
cd node_modules/@emurgo/csl-mobile-bridge-jsi/rust
cargo clean
cargo build --release --target aarch64-apple-ios
```

**Pod install fails:**

```bash
# Clean and reinstall
cd ios
rm -rf Pods Podfile.lock
pod install
```

**Simulator not found:**

```bash
# List available simulators
xcrun simctl list devices
# Boot a simulator
xcrun simctl boot "iPhone 15 Pro"
```

#### Android Issues

**Build fails with NDK errors:**

```bash
# Ensure correct NDK version
export ANDROID_NDK_VERSION=27.0.12077973
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

**Emulator not found:**

```bash
# List available emulators
emulator -list-avds
# Start an emulator
emulator -avd your_avd_name
```

**Gradle build fails:**

```bash
# Clean Gradle cache
cd android
./gradlew clean
rm -rf .gradle
./gradlew assembleDebug
```

#### General Issues

**Metro bundler issues:**

```bash
# Clear Metro cache
npx expo start -c
```

**Node modules issues:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**

```bash
# Check TypeScript configuration
npm run tsc
```

### Performance Optimization

1. **Enable Hermes (Android):**

   - Hermes is enabled by default in the configuration

2. **Optimize bundle size:**

   - Use `expo export` for production builds
   - Enable tree shaking in Metro config

3. **Memory optimization:**
   - The build process uses increased memory limits
   - Monitor memory usage during development

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
4. **Run tests and linting:**

   ```bash
   npm run test
   npm run lint
   npm run tsc
   ```

5. **Commit your changes:**

   ```bash
   git commit -m "feat: add your feature"
   ```

6. **Push and create a pull request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write tests for new features
- Follow React Native best practices

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Powered by [React Native](https://reactnative.dev/)
- Native modules built with [Rust](https://www.rust-lang.org/)
