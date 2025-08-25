#!/bin/bash

set -euo pipefail

# Android Publish Script for Yoroi mobile app
# Handles build number, signing setup, build, and submit
#
# Usage:
#   ./scripts/publish-android.sh nightly
#   ./scripts/publish-android.sh production
#
# Examples:
#   ./scripts/publish-android.sh nightly
#   ./scripts/publish-android.sh production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: No environment specified${NC}"
    echo -e "${BLUE}Usage: $0 [nightly|production]${NC}"
    exit 1
fi

ENVIRONMENT=$1

case $ENVIRONMENT in
    nightly)
        echo -e "${BLUE}🚀 Publishing Android Nightly Build${NC}"
        PASS_FILE="$HOME/.yoroi/android/nightly.pass"
        KEYSTORE_FILE="$HOME/.yoroi/android/nightly.keystore"
        PACKAGE_NAME="com.emurgo.nightly"
        TRACK="internal"
        APP_CONFIG="app.config.nightly.js"
        ;;
    production)
        echo -e "${BLUE}🚀 Publishing Android Production Build${NC}"
        PASS_FILE="$HOME/.yoroi/android/production.pass"
        KEYSTORE_FILE="$HOME/.yoroi/android/production.keystore"
        PACKAGE_NAME="com.emurgo"
        TRACK="production"
        APP_CONFIG="app.config.production.js"
        ;;
    *)
        echo -e "${RED}Error: Invalid environment. Use 'nightly' or 'production'${NC}"
        exit 1
        ;;
esac

# Check if signing files exist
if [ ! -f "$PASS_FILE" ]; then
    echo -e "${RED}Error: Password file not found: $PASS_FILE${NC}"
    exit 1
fi

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo -e "${RED}Error: Keystore file not found: $KEYSTORE_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}📦 Package: $PACKAGE_NAME${NC}"
echo -e "${BLUE}🎯 Track: $TRACK${NC}"
echo

# Step 1: Set build number
echo -e "${YELLOW}Step 1: Setting build number...${NC}"
./scripts/set-build-number.sh auto
echo

# Step 2: Export signing credentials
echo -e "${YELLOW}Step 2: Exporting signing credentials...${NC}"
source scripts/export-android-pass.sh "$PASS_FILE"
export ANDROID_KEYSTORE_FILE="$KEYSTORE_FILE"
export ANDROID_KEYSTORE_ALIAS="my-key-alias"
export ANDROID_KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASS"

echo -e "${GREEN}✓ Signing credentials exported${NC}"
echo -e "${BLUE}  Keystore: $ANDROID_KEYSTORE_FILE${NC}"
echo -e "${BLUE}  Alias: $ANDROID_KEYSTORE_ALIAS${NC}"
echo

# Step 3: Build the app
echo -e "${YELLOW}Step 3: Building Android app...${NC}"
export EXPO_PUBLIC_APP_CONFIG="$APP_CONFIG"
export BUILD_VARIANT="$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"

npx eas build --platform android --profile "$ENVIRONMENT" --local
echo

# Step 4: Submit to Play Store
echo -e "${YELLOW}Step 4: Submitting to Play Store...${NC}"
npx eas submit --platform android --latest --track "$TRACK" --non-interactive
echo

echo -e "${GREEN}🎉 Android $ENVIRONMENT build published successfully!${NC}"
echo -e "${BLUE}📱 Package: $PACKAGE_NAME${NC}"
echo -e "${BLUE}🎯 Track: $TRACK${NC}"
echo -e "${BLUE}🔢 Build Number: $BUILD_NUMBER${NC}"
