#!/bin/bash

set -euo pipefail

# iOS Publish Script for Yoroi mobile app
# Handles build number, signing setup, build, and submit
#
# Usage:
#   ./scripts/publish-ios.sh nightly
#   ./scripts/publish-ios.sh production
#
# Examples:
#   ./scripts/publish-ios.sh nightly
#   ./scripts/publish-ios.sh production

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
        echo -e "${BLUE}🚀 Publishing iOS Nightly Build${NC}"
        BUNDLE_ID="com.emurgo.yoroi-nightly"
        TRACK="testflight"
        APP_CONFIG="app.config.nightly.js"
        ;;
    production)
        echo -e "${BLUE}🚀 Publishing iOS Production Build${NC}"
        BUNDLE_ID="com.emurgo.yoroi"
        TRACK="app-store"
        APP_CONFIG="app.config.production.js"
        ;;
    *)
        echo -e "${RED}Error: Invalid environment. Use 'nightly' or 'production'${NC}"
        exit 1
        ;;
esac

# Check if iOS signing files exist
if [ ! -f "$HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8" ]; then
    echo -e "${RED}Error: iOS signing key not found: $HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}📦 Bundle ID: $BUNDLE_ID${NC}"
echo -e "${BLUE}🎯 Track: $TRACK${NC}"
echo

# Step 1: Set build number
echo -e "${YELLOW}Step 1: Setting build number...${NC}"
./scripts/set-build-number.sh auto
echo

# Step 2: Set iOS signing environment variables
echo -e "${YELLOW}Step 2: Setting iOS signing environment...${NC}"
export APP_STORE_KEY_ID="PH9Z89M567"
export APP_STORE_ISSUER_ID="feff08c0-5259-4e9a-bdbe-26cdb046e1d5"
export APP_STORE_KEY_PATH="$HOME/.yoroi/ios/AuthKey_PH9Z89M567.p8"

echo -e "${GREEN}✓ iOS signing environment set${NC}"
echo -e "${BLUE}  Key ID: $APP_STORE_KEY_ID${NC}"
echo -e "${BLUE}  Issuer ID: $APP_STORE_ISSUER_ID${NC}"
echo -e "${BLUE}  Key Path: $APP_STORE_KEY_PATH${NC}"
echo

# Step 3: Build the app
echo -e "${YELLOW}Step 3: Building iOS app...${NC}"
export EXPO_PUBLIC_APP_CONFIG="$APP_CONFIG"
export BUILD_VARIANT="$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')"

npx eas build --platform ios --profile "$ENVIRONMENT" --local
echo

# Step 4: Submit to App Store Connect
echo -e "${YELLOW}Step 4: Submitting to App Store Connect...${NC}"
if [ "$TRACK" = "testflight" ]; then
    npx eas submit --platform ios --latest --app-id "$BUNDLE_ID" --non-interactive
else
    npx eas submit --platform ios --latest --app-id "$BUNDLE_ID" --non-interactive
fi
echo

echo -e "${GREEN}🎉 iOS $ENVIRONMENT build published successfully!${NC}"
echo -e "${BLUE}📱 Bundle ID: $BUNDLE_ID${NC}"
echo -e "${BLUE}🎯 Track: $TRACK${NC}"
echo -e "${BLUE}🔢 Build Number: $BUILD_NUMBER${NC}"
