#!/bin/bash

set -euo pipefail

# Local iOS Nightly: archive with xcodebuild and export IPA
echo "Building Yoroi iOS Nightly locally (archive + IPA)..."

# Ensure we're in mobile directory
if [ ! -d "ios" ] || [ ! -f "package.json" ]; then
  echo "Run from mobile directory (contains ios/ and package.json)"
  exit 1
fi

# Env
export BUILD_VARIANT=NIGHTLY
export EXPO_PUBLIC_APP_CONFIG=app.config.nightly.js

# Load env.nightly if present
if [ -f "env.nightly" ]; then
  set -a
  # shellcheck disable=SC2046
  export $(cat env.nightly | grep -v '^#' | xargs)
  set +a
fi

# Set build number to 801 (next after 800)
./scripts/set-build-number.sh 801

# Ensure BUILD_NUMBER is exported for Expo config
export BUILD_NUMBER=801

SCHEME="yoroi"
CONFIGURATION="Release"
WORKSPACE="ios/yoroi.xcworkspace"
ARCHIVE_DIR="$HOME/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)"
ARCHIVE_PATH="$ARCHIVE_DIR/yoroi-$(date +%H-%M-%S).xcarchive"
EXPORT_DIR="./dist/ios/nightly-${BUILD_NUMBER:-local}"

mkdir -p "$EXPORT_DIR"

echo "Running pod install (ios/)..."
(cd ios && pod install --repo-update)

echo "Archiving with xcodebuild..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  DEVELOPMENT_TEAM="${APPLE_TEAM_ID:-F8NVT2G2L4}" \
  CODE_SIGN_STYLE=Automatic \
  PRODUCT_BUNDLE_IDENTIFIER="${APP_STORE_BUNDLE_ID:-com.emurgo.yoroi-nightly}" \
  CURRENT_PROJECT_VERSION="${BUILD_NUMBER:-801}" \
  -allowProvisioningUpdates \
  clean archive | xcpretty || true

if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "Archive not found at $ARCHIVE_PATH"
  exit 1
fi

echo "Exporting IPA..."
./scripts/export-ios-ipa.sh "$SCHEME" "$CONFIGURATION" "$ARCHIVE_PATH" "$EXPORT_DIR" app-store

echo "Done. Exported files in: $EXPORT_DIR"


