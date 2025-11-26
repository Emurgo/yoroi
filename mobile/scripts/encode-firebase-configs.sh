#!/usr/bin/env bash
set -euo pipefail

# Script to encode Firebase production config files as base64
# Output can be copied directly into EAS Dashboard secrets

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FIREBASE_DIR="${PROJECT_ROOT}/firebase/production"

echo "Firebase Config Encoder"
echo "======================"
echo ""

# Check if production configs exist
if [[ ! -f "${FIREBASE_DIR}/google-services-production.json" ]]; then
  echo "ERROR: Production Android config not found at:"
  echo "  ${FIREBASE_DIR}/google-services-production.json"
  exit 1
fi

if [[ ! -f "${FIREBASE_DIR}/GoogleService-Info-production.plist" ]]; then
  echo "ERROR: Production iOS config not found at:"
  echo "  ${FIREBASE_DIR}/GoogleService-Info-production.plist"
  exit 1
fi

echo "Encoding Firebase production configs..."
echo ""

# Encode Android config
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ANDROID CONFIG (FIREBASE_GOOGLE_SERVICES_PROD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
ANDROID_B64=$(base64 -i "${FIREBASE_DIR}/google-services-production.json" | tr -d '\n')
echo "${ANDROID_B64}"
echo ""
echo ""

# Encode iOS config
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "iOS CONFIG (FIREBASE_GOOGLE_SERVICES_IOS_PROD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
IOS_B64=$(base64 -i "${FIREBASE_DIR}/GoogleService-Info-production.plist" | tr -d '\n')
echo "${IOS_B64}"
echo ""
echo ""

# Save to files for easy copying
OUTPUT_DIR="${PROJECT_ROOT}/firebase/production"
ANDROID_OUTPUT="${OUTPUT_DIR}/google-services-production.b64"
IOS_OUTPUT="${OUTPUT_DIR}/GoogleService-Info-production.b64"

echo "${ANDROID_B64}" > "${ANDROID_OUTPUT}"
echo "${IOS_B64}" > "${IOS_OUTPUT}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUCCESS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Base64-encoded configs have been saved to:"
echo "  Android: ${ANDROID_OUTPUT}"
echo "  iOS:     ${IOS_OUTPUT}"
echo ""
echo "To create EAS secrets:"
echo ""
echo "1. Copy the Android base64 string above (or from ${ANDROID_OUTPUT})"
echo "2. Go to https://expo.dev → Your Project → Secrets"
echo "3. Create secret:"
echo "   Name:  FIREBASE_GOOGLE_SERVICES_PROD"
echo "   Value: [paste Android base64 string]"
echo "   Scope: Project"
echo ""
echo "4. Copy the iOS base64 string above (or from ${IOS_OUTPUT})"
echo "5. Create secret:"
echo "   Name:  FIREBASE_GOOGLE_SERVICES_IOS_PROD"
echo "   Value: [paste iOS base64 string]"
echo "   Scope: Project"
echo ""
echo "Or use EAS CLI:"
echo "  cat ${ANDROID_OUTPUT} | eas secret:create --scope project --name FIREBASE_GOOGLE_SERVICES_PROD --value-file -"
echo "  cat ${IOS_OUTPUT} | eas secret:create --scope project --name FIREBASE_GOOGLE_SERVICES_IOS_PROD --value-file -"
echo ""

