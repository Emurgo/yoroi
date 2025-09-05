#!/usr/bin/env bash
set -euo pipefail

echo "EAS post-install: Android Rust setup/build"

# Only run on Android builds
if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  echo "Skipping Android post-install (platform: ${EAS_BUILD_PLATFORM:-unknown})"
  exit 0
fi

# Ensure Python interpreter is available to linker wrapper
if command -v set-env >/dev/null 2>&1; then
  set-env RUST_ANDROID_GRADLE_PYTHON_COMMAND python3
else
  export RUST_ANDROID_GRADLE_PYTHON_COMMAND=python3
fi

# Ensure Android NDK env vars are set for Rust/Gradle plugin
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-/home/expo/Android/Sdk}}"
if [ -d "$SDK_ROOT/ndk" ]; then
  # Pick the newest installed NDK version
  LATEST_NDK_DIR=$(ls -1 "$SDK_ROOT/ndk" 2>/dev/null | sort -V | tail -n1 || true)
  if [ -n "$LATEST_NDK_DIR" ] && [ -d "$SDK_ROOT/ndk/$LATEST_NDK_DIR" ]; then
    export ANDROID_NDK_HOME="$SDK_ROOT/ndk/$LATEST_NDK_DIR"
    export ANDROID_NDK_ROOT="$ANDROID_NDK_HOME"
    if command -v set-env >/dev/null 2>&1; then
      set-env ANDROID_NDK_HOME "$ANDROID_NDK_HOME"
      set-env ANDROID_NDK_ROOT "$ANDROID_NDK_ROOT"
    fi
    echo "Using NDK at $ANDROID_NDK_HOME"
  else
    echo "Warning: Could not determine NDK directory under $SDK_ROOT/ndk"
  fi
else
  echo "Warning: ANDROID SDK root not found at $SDK_ROOT"
fi

# Prebuild Rust JNI libraries for Emurgo bridges (arm64)
cd android
./gradlew \
  :emurgo_csl-mobile-bridge-jsi:cargoBuildArm \
  :emurgo_csl-mobile-bridge-jsi:cargoBuildArm64 \
  :emurgo_csl-mobile-bridge-jsi:cargoBuildX86 \
  :emurgo_csl-mobile-bridge-jsi:cargoBuildX86_64 \
  :emurgo_msl-mobile-bridge-jsi:cargoBuildArm \
  :emurgo_msl-mobile-bridge-jsi:cargoBuildArm64 \
  :emurgo_msl-mobile-bridge-jsi:cargoBuildX86 \
  :emurgo_msl-mobile-bridge-jsi:cargoBuildX86_64
