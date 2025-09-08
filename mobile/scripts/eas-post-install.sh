#!/usr/bin/env bash
set -euo pipefail

echo "EAS post-install: Android Rust setup/build"

# Only run on Android builds
if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  echo "Skipping Android post-install (platform: ${EAS_BUILD_PLATFORM:-unknown})"
  exit 0
fi

# Ensure Android NDK is available before invoking Gradle (EAS may install it later)
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "${SDK_ROOT}" || ! -d "${SDK_ROOT}/ndk" || -z "$(ls -A "${SDK_ROOT}/ndk" 2>/dev/null || true)" ]]; then
  echo "Android NDK not found yet; skipping Rust prebuild (will be built during Gradle assemble)"
  exit 0
fi

# Use the latest installed side-by-side NDK and export common env vars
LATEST_NDK_DIR="$(ls -1d "${SDK_ROOT}/ndk"/* 2>/dev/null | sort -V | tail -n1 || true)"
if [[ -z "${LATEST_NDK_DIR}" || ! -d "${LATEST_NDK_DIR}" ]]; then
  echo "Android NDK directory is empty; skipping Rust prebuild"
  exit 0
fi
export ANDROID_NDK_ROOT="${LATEST_NDK_DIR}"
export ANDROID_NDK_HOME="${LATEST_NDK_DIR}"
export ANDROID_NDK="${LATEST_NDK_DIR}"
if command -v set-env >/dev/null 2>&1; then
  set-env ANDROID_NDK_ROOT "${ANDROID_NDK_ROOT}"
  set-env ANDROID_NDK_HOME "${ANDROID_NDK_HOME}"
  set-env ANDROID_NDK "${ANDROID_NDK}"
fi
echo "Using NDK at ${LATEST_NDK_DIR}"

# Ensure Python interpreter is available to linker wrapper
if command -v set-env >/dev/null 2>&1; then
  set-env RUST_ANDROID_GRADLE_PYTHON_COMMAND python3
else
  export RUST_ANDROID_GRADLE_PYTHON_COMMAND=python3
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
