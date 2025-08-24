#!/bin/bash

# Build Nightly Version
echo "Building Yoroi Nightly..."

# Set environment variables
export BUILD_VARIANT=NIGHTLY
export EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js

# Load environment variables from env.nightly
if [ -f "env.nightly" ]; then
    export $(cat env.nightly | grep -v '^#' | xargs)
fi

# Build for Android
echo "Building Android APK..."
npx eas build --platform android --profile nightly --non-interactive

# Build for iOS
echo "Building iOS IPA..."
npx eas build --platform ios --profile nightly --non-interactive

echo "Nightly build completed!"
