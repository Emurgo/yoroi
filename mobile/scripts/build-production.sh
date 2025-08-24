#!/bin/bash

# Build Production Version
echo "Building Yoroi Production..."

# Set environment variables
export BUILD_VARIANT=PRODUCTION
export EXPO_PUBLIC_APP_CONFIG=app.config.production.js

# Load environment variables from env.production
if [ -f "env.production" ]; then
    export $(cat env.production | grep -v '^#' | xargs)
fi

# Build for Android
echo "Building Android AAB..."
npx eas build --platform android --profile production --non-interactive

# Build for iOS
echo "Building iOS IPA..."
npx eas build --platform ios --profile production --non-interactive

echo "Production build completed!"
