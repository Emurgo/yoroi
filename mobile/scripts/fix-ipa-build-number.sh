#!/bin/bash

set -euo pipefail

# Fix IPA build number by modifying the Info.plist inside the IPA
# Usage: ./fix-ipa-build-number.sh <ipa_path> <new_build_number>

IPA_PATH="$1"
NEW_BUILD_NUMBER="$2"

if [ ! -f "$IPA_PATH" ]; then
  echo "Error: IPA file not found at $IPA_PATH"
  exit 1
fi

echo "Fixing build number in IPA: $IPA_PATH"
echo "New build number: $NEW_BUILD_NUMBER"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Working in temporary directory: $TEMP_DIR"

# Extract IPA
echo "Extracting IPA..."
unzip -q "$IPA_PATH" -d "$TEMP_DIR"

# Find the app bundle
APP_BUNDLE=$(find "$TEMP_DIR" -name "*.app" -type d | head -1)
if [ -z "$APP_BUNDLE" ]; then
  echo "Error: Could not find app bundle in IPA"
  exit 1
fi

echo "Found app bundle: $APP_BUNDLE"

# Update Info.plist
INFO_PLIST="$APP_BUNDLE/Info.plist"
if [ ! -f "$INFO_PLIST" ]; then
  echo "Error: Info.plist not found in app bundle"
  exit 1
fi

echo "Updating build number in Info.plist..."
plutil -replace CFBundleVersion -string "$NEW_BUILD_NUMBER" "$INFO_PLIST"

# Verify the change
echo "Verifying build number change..."
plutil -p "$INFO_PLIST" | grep -E "(CFBundleVersion|CFBundleShortVersionString)"

# Create new IPA
echo "Creating new IPA with updated build number..."
cd "$TEMP_DIR"
rm -f "$IPA_PATH"
zip -qr "$IPA_PATH" Payload/
cd - > /dev/null

# Clean up
echo "Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

echo "✅ Successfully updated build number to $NEW_BUILD_NUMBER in $IPA_PATH"
