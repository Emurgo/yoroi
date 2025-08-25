#!/bin/bash

# Local Build Production Version (without EAS)
echo "Building Yoroi Production locally..."

# Set environment variables
export BUILD_VARIANT=PRODUCTION
export EXPO_PUBLIC_APP_CONFIG=app.config.production.js

# Load environment variables from env.production
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build for Android
echo "Building Android APK locally..."
npx expo run:android --variant release

# Build for iOS
echo "Building iOS IPA locally..."
npx expo run:ios --configuration Release

echo "Local production build completed!"
