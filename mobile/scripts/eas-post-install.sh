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

# Prebuild Rust JNI libraries for Emurgo bridges (all Android platforms)
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
