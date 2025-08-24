#!/bin/bash

# Local Build Nightly Version (without EAS)
echo "Building Yoroi Nightly locally..."

# Set environment variables
export BUILD_VARIANT=NIGHTLY
export EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js

# Load environment variables from env.nightly
if [ -f "env.nightly" ]; then
    export $(cat env.nightly | grep -v '^#' | xargs)
fi

# Build for Android
echo "Building Android APK locally..."
npx expo run:android --variant release

# Build for iOS
echo "Building iOS IPA locally..."
npx expo run:ios --configuration Release

echo "Local nightly build completed!"
