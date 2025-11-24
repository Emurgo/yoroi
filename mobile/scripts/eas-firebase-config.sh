#!/usr/bin/env bash
set -euo pipefail

# Script to inject production Firebase config files from EAS secrets
# This script runs during EAS builds to replace dev Firebase configs with production ones

echo "EAS Firebase Config Injection: Starting..."

# Determine build profile
BUILD_PROFILE="${EAS_BUILD_PROFILE:-development}"
echo "Build profile: ${BUILD_PROFILE}"

# Only inject production configs for production builds
if [[ "${BUILD_PROFILE}" != "production" ]]; then
  echo "Skipping Firebase config injection (profile: ${BUILD_PROFILE})"
  echo "Using development Firebase configs from repository"
  exit 0
fi

echo "Production build detected - injecting production Firebase configs..."

# Get project root (script is in scripts/, so go up one level)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${PROJECT_ROOT}"

# Check if secrets are available (these are set as environment variables from EAS secrets)
if [[ -z "${FIREBASE_GOOGLE_SERVICES_PROD:-}" ]]; then
  echo "ERROR: FIREBASE_GOOGLE_SERVICES_PROD secret not found"
  echo "Production builds require Firebase config secrets to be set in EAS."
  echo "Please create the secret via:"
  echo "  eas env:create production --scope project --name FIREBASE_GOOGLE_SERVICES_PROD --type string --visibility secret"
  echo "Or via Expo Dashboard: https://expo.dev → Your Project → Secrets"
  exit 1
fi

if [[ -z "${FIREBASE_GOOGLE_SERVICES_IOS_PROD:-}" ]]; then
  echo "ERROR: FIREBASE_GOOGLE_SERVICES_IOS_PROD secret not found"
  echo "Production builds require Firebase config secrets to be set in EAS."
  echo "Please create the secret via:"
  echo "  eas env:create production --scope project --name FIREBASE_GOOGLE_SERVICES_IOS_PROD --type string --visibility secret"
  echo "Or via Expo Dashboard: https://expo.dev → Your Project → Secrets"
  exit 1
fi

# Decode and write Android Firebase config
echo "Creating google-services.json from secret..."
echo "${FIREBASE_GOOGLE_SERVICES_PROD}" | base64 -d > google-services.json

# Verify Android config was created
if [[ ! -f "google-services.json" ]]; then
  echo "ERROR: Failed to create google-services.json"
  exit 1
fi

# Validate that this is actually a production config (not dev)
PROJECT_ID=$(grep -o '"project_id": *"[^"]*"' google-services.json | head -1 | sed 's/.*"project_id": *"\([^"]*\)".*/\1/')
if [[ -z "${PROJECT_ID}" ]]; then
  echo "ERROR: Failed to extract project_id from google-services.json"
  echo "The Firebase config file may be malformed or missing the project_id field."
  exit 1
fi
if [[ "${PROJECT_ID}" == "yoroi-mobile-dev-1" ]]; then
  echo "ERROR: Firebase config contains dev project ID 'yoroi-mobile-dev-1'"
  echo "The EAS secret FIREBASE_GOOGLE_SERVICES_PROD appears to contain the development config."
  echo "Please update the secret with the production Firebase config."
  exit 1
fi
echo "✓ Created google-services.json (project: ${PROJECT_ID})"

# Copy to android/app/ if it exists (from previous build or if prebuild already ran)
# Expo prebuild will copy from project root to android/app/ automatically, but this ensures
# it's in place if android/app/ already exists
if [[ -d "android/app" ]]; then
  echo "Copying google-services.json to android/app/..."
  cp google-services.json android/app/google-services.json
  echo "✓ Copied google-services.json to android/app/"
else
  echo "Note: android/app/ will be created by Expo prebuild, which will copy google-services.json automatically"
fi

# Decode and write iOS Firebase config
echo "Creating GoogleService-Info.plist from secret..."
echo "${FIREBASE_GOOGLE_SERVICES_IOS_PROD}" | base64 -d > GoogleService-Info.plist

# Verify iOS config was created
if [[ ! -f "GoogleService-Info.plist" ]]; then
  echo "ERROR: Failed to create GoogleService-Info.plist"
  exit 1
fi

# Validate that this is actually a production config (not dev)
IOS_PROJECT_ID=$(grep -A 1 "PROJECT_ID" GoogleService-Info.plist | grep -o '<string>[^<]*</string>' | head -1 | sed 's/<string>\(.*\)<\/string>/\1/')
if [[ -z "${IOS_PROJECT_ID}" ]]; then
  echo "ERROR: Failed to extract PROJECT_ID from GoogleService-Info.plist"
  echo "The Firebase config file may be malformed or missing the PROJECT_ID field."
  exit 1
fi
if [[ "${IOS_PROJECT_ID}" == "yoroi-mobile-dev-1" ]]; then
  echo "ERROR: Firebase iOS config contains dev project ID 'yoroi-mobile-dev-1'"
  echo "The EAS secret FIREBASE_GOOGLE_SERVICES_IOS_PROD appears to contain the development config."
  echo "Please update the secret with the production Firebase config."
  exit 1
fi
echo "✓ Created GoogleService-Info.plist (project: ${IOS_PROJECT_ID})"

# Copy to ios/ if it exists (from previous build or if prebuild already ran)
# Expo prebuild will copy from project root to ios/ automatically, but this ensures
# it's in place if ios/ already exists
if [[ -d "ios" ]]; then
  echo "Copying GoogleService-Info.plist to ios/..."
  cp GoogleService-Info.plist ios/GoogleService-Info.plist
  echo "✓ Copied GoogleService-Info.plist to ios/"
else
  echo "Note: ios/ will be created by Expo prebuild, which will copy GoogleService-Info.plist automatically"
fi

echo "EAS Firebase Config Injection: Complete"
echo "Production Firebase configs are now in place for build"

