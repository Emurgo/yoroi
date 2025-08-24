#!/bin/bash

# Publish Production Version to Stores
echo "Publishing Yoroi Production to stores..."

# Set environment variables
export BUILD_VARIANT=PRODUCTION
export EXPO_PUBLIC_APP_CONFIG=app.config.production.js

# Load environment variables from env.production
if [ -f "env.production" ]; then
    export $(cat env.production | grep -v '^#' | xargs)
fi

# Set keystore password (you should set this securely)
export ANDROID_KEYSTORE_PASSWORD="your-keystore-password"

# Publish to Android Play Store (Production)
echo "Publishing to Android Play Store Production..."
cd fastlane
fastlane android production
cd ..

# Publish to iOS App Store
echo "Publishing to iOS App Store..."
cd fastlane
fastlane ios production
cd ..

echo "Production publishing completed!"
