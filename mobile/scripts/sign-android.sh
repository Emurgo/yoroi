#!/bin/bash

set -euo pipefail

# Signs an Android APK or AAB using env-provided keystore credentials.
#
# Requirements (env):
#   ANDROID_KEYSTORE_FILE    - path to .keystore or .jks
#   ANDROID_KEYSTORE_ALIAS   - alias name inside keystore
#   ANDROID_KEYSTORE_PASS    - store password (also used as key password if ANDROID_KEY_PASS not set)
#   ANDROID_KEY_PASS         - optional, key password (defaults to ANDROID_KEYSTORE_PASS)
#
# Usage:
#   ./scripts/sign-android.sh <path-to-apk-or-aab>
#
# Notes:
# - APKs are re-signed using apksigner (Android SDK build-tools);
# - AABs are signed using jarsigner.

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path-to-apk-or-aab>"
  exit 1
fi

ARTIFACT="$1"

if [ ! -f "$ARTIFACT" ]; then
  echo "File not found: $ARTIFACT"
  exit 1
fi

if [ -z "${ANDROID_KEYSTORE_FILE:-}" ] || [ -z "${ANDROID_KEYSTORE_ALIAS:-}" ] || [ -z "${ANDROID_KEYSTORE_PASS:-}" ]; then
  echo "Missing required env vars. Ensure you exported: ANDROID_KEYSTORE_FILE, ANDROID_KEYSTORE_ALIAS, ANDROID_KEYSTORE_PASS"
  exit 1
fi

KEY_PASS="${ANDROID_KEY_PASS:-$ANDROID_KEYSTORE_PASS}"

EXT="${ARTIFACT##*.}"

case "$EXT" in
  apk)
    # Use apksigner (part of Android SDK build-tools)
    if ! command -v apksigner >/dev/null 2>&1; then
      echo "apksigner not found in PATH. Ensure Android SDK build-tools are installed and apksigner is on PATH."
      exit 1
    fi

    echo "[sign-android] Signing APK with apksigner..."
    apksigner sign \
      --ks "$ANDROID_KEYSTORE_FILE" \
      --ks-key-alias "$ANDROID_KEYSTORE_ALIAS" \
      --ks-pass "pass:$ANDROID_KEYSTORE_PASS" \
      --key-pass "pass:$KEY_PASS" \
      "$ARTIFACT"

    echo "[sign-android] Verifying APK signature..."
    apksigner verify --print-certs "$ARTIFACT"
    ;;
  aab)
    # Use jarsigner for AABs
    if ! command -v jarsigner >/dev/null 2>&1; then
      echo "jarsigner not found in PATH (part of JDK)."
      exit 1
    fi

    echo "[sign-android] Signing AAB with jarsigner..."
    jarsigner -sigalg SHA256withRSA -digestalg SHA-256 \
      -keystore "$ANDROID_KEYSTORE_FILE" \
      -storepass "$ANDROID_KEYSTORE_PASS" \
      -keypass "$KEY_PASS" \
      "$ARTIFACT" "$ANDROID_KEYSTORE_ALIAS"

    echo "[sign-android] Verifying AAB signature..."
    jarsigner -verify -verbose -certs "$ARTIFACT" | sed -n '1,120p'
    ;;
  *)
    echo "Unsupported artifact extension: .$EXT (expected .apk or .aab)"
    exit 1
    ;;
esac

echo "[sign-android] Done."


