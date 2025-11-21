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
echo "✓ Created google-services.json"

# Decode and write iOS Firebase config
echo "Creating GoogleService-Info.plist from secret..."
echo "${FIREBASE_GOOGLE_SERVICES_IOS_PROD}" | base64 -d > GoogleService-Info.plist

# Verify iOS config was created
if [[ ! -f "GoogleService-Info.plist" ]]; then
  echo "ERROR: Failed to create GoogleService-Info.plist"
  exit 1
fi
echo "✓ Created GoogleService-Info.plist"

echo "EAS Firebase Config Injection: Complete"
echo "Production Firebase configs are now in place for build"

