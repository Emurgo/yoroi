# Publishing Setup for Yoroi Apps

This guide covers how to publish both nightly and production versions of Yoroi to the App Store and Google Play Store.

## Prerequisites

### Required Files
- **Android Keystores**: 
  - `$HOME/.yoroi/android/nightly.keystore`
  - `$HOME/.yoroi/android/production.keystore`
- **iOS Certificates**: 
  - `$HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8`
- **Google Play Service Account**: 
  - `$HOME/.yoroi/android/service-account.json`

### Store Accounts
- **App Store Connect** account with access to both apps
- **Google Play Console** account with access to both apps
- **Apple Developer** account with appropriate certificates

## Publishing Options

### Option 1: Fastlane (Recommended for Local Publishing)

#### Install Fastlane
```bash
# Install Fastlane
gem install fastlane

# Or using Homebrew on macOS
brew install fastlane
```

#### Publish Commands
```bash
# Publish nightly to both stores
npm run publish:nightly
./scripts/publish-nightly.sh

# Publish production to both stores
npm run publish:production
./scripts/publish-production.sh

# Publish specific platform
cd fastlane
fastlane android nightly      # Android nightly
fastlane android production   # Android production
fastlane ios nightly          # iOS nightly
fastlane ios production       # iOS production
```

### Option 2: EAS (Cloud Publishing)

#### Build and Submit
```bash
# Build and submit nightly
eas build --platform all --profile nightly --auto-submit

# Build and submit production
eas build --platform all --profile production --auto-submit

# Submit existing builds
eas submit --platform android --profile nightly
eas submit --platform ios --profile nightly
```

## Store-Specific Setup

### Google Play Store

#### Service Account Setup
1. Go to Google Play Console → Setup → API access
2. Create a new service account
3. Download the JSON key file
4. Place it at `$HOME/.yoroi/android/service-account.json`
5. Grant the service account appropriate permissions

#### App Setup
- **Production**: `com.emurgo` (Production track)
- **Nightly**: `com.emurgo.nightly` (Internal testing track)

### App Store Connect

#### API Key Setup
1. Go to App Store Connect → Users and Access → Keys
2. Create a new API key with App Manager role
3. Download the `.p8` file
4. Place it at `$HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8`

#### App Setup
- **Production**: `com.emurgo.yoroi` (App Store)
- **Nightly**: `com.emurgo.yoroi-nightly` (TestFlight)

## Environment Variables

### Required Environment Variables
```bash
# Android
ANDROID_KEYSTORE_PASSWORD=your-keystore-password
ANDROID_SA_FILE=$HOME/.yoroi/android/service-account.json

# iOS
APP_STORE_KEY_ID=PH9Z89M567
APP_STORE_ISSUER_ID=feff08c0-5259-4e9a-bdbe-26cdb046e1d5
APP_STORE_KEY_PATH=$HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8
```

### Setting Environment Variables
```bash
# Option 1: Export in shell
export ANDROID_KEYSTORE_PASSWORD="your-password"

# Option 2: Use .env files (already configured)
source env.nightly
source env.production

# Option 3: Set in publishing scripts
# Edit scripts/publish-nightly.sh and scripts/publish-production.sh
```

## Publishing Workflow

### Nightly Publishing
1. **Build**: Creates signed APK/AAB and IPA
2. **Android**: Uploads to Play Store Internal Testing
3. **iOS**: Uploads to TestFlight
4. **Distribution**: Available to internal testers

### Production Publishing
1. **Build**: Creates signed AAB and IPA
2. **Android**: Uploads to Play Store Production
3. **iOS**: Uploads to App Store Connect
4. **Review**: Goes through store review process

## Troubleshooting

### Common Issues

#### Android Signing Issues
```bash
# Check keystore files
ls -la $HOME/.yoroi/android/

# Verify keystore password
keytool -list -keystore $HOME/.yoroi/android/nightly.keystore

# Clean and rebuild
cd android && ./gradlew clean && cd ..
```

#### iOS Signing Issues
```bash
# Check certificates in Xcode
open ios/yoroi.xcworkspace

# Verify provisioning profiles
security find-identity -v -p codesigning

# Clean Xcode build
npx expo run:ios --clear
```

#### Fastlane Issues
```bash
# Update Fastlane
gem update fastlane

# Check Fastlane setup
fastlane doctor

# Run with verbose output
fastlane android nightly --verbose
```

### Store-Specific Issues

#### Google Play Store
- **API Access**: Ensure service account has correct permissions
- **Track Access**: Verify internal testing track is enabled
- **Bundle ID**: Check that package names match exactly

#### App Store Connect
- **API Key**: Verify API key has App Manager role
- **Bundle ID**: Ensure bundle identifiers are registered
- **Provisioning**: Check provisioning profiles are valid

## Security Best Practices

### Keystore Management
- Store keystores securely (not in version control)
- Use strong passwords
- Backup keystores safely
- Rotate keys periodically

### API Keys
- Store API keys securely
- Use environment variables
- Rotate keys regularly
- Limit key permissions

### Environment Variables
- Never commit passwords to version control
- Use `.env` files for local development
- Use secure environment variables in CI/CD

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Publish Nightly
on:
  push:
    branches: [develop]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Publish Nightly
        run: npm run publish:nightly
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          APP_STORE_KEY_ID: ${{ secrets.APP_STORE_KEY_ID }}
          APP_STORE_ISSUER_ID: ${{ secrets.APP_STORE_ISSUER_ID }}
```

## Monitoring and Analytics

### Build Monitoring
- Monitor build success rates
- Track build times
- Monitor store review times
- Track deployment frequency

### Store Analytics
- Monitor app performance
- Track crash reports
- Monitor user feedback
- Track store ratings
