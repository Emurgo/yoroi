#!/bin/bash

# Publish Nightly Version to Stores
echo "Publishing Yoroi Nightly to stores..."

# Set environment variables
export BUILD_VARIANT=NIGHTLY
export EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js

# Load environment variables from env.nightly
if [ -f "env.nightly" ]; then
    export $(cat env.nightly | grep -v '^#' | xargs)
fi

# Set keystore password (you should set this securely)
export ANDROID_KEYSTORE_PASSWORD="your-keystore-password"

# Publish to Android Play Store (Internal Testing)
echo "Publishing to Android Play Store Internal Testing..."
cd fastlane
fastlane android nightly
cd ..

# Publish to iOS TestFlight
echo "Publishing to iOS TestFlight..."
cd fastlane
fastlane ios nightly
cd ..

echo "Nightly publishing completed!"
