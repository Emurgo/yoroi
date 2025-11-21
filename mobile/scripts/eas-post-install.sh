#!/usr/bin/env bash
set -euo pipefail

# Inject Firebase production configs if this is a production build
if [[ "${EAS_BUILD_PROFILE:-}" == "production" ]]; then
  echo "Running Firebase config injection for production build..."
  bash ./scripts/eas-firebase-config.sh || {
    echo "ERROR: Firebase config injection failed"
    echo "Production builds require Firebase config secrets. Build cannot continue."
    exit 1
  }
fi

echo "EAS post-install: Android Rust setup/build"

# Only run on Android builds
if [[ "${EAS_BUILD_PLATFORM:-}" != "android" ]]; then
  echo "Skipping Android post-install (platform: ${EAS_BUILD_PLATFORM:-unknown})"
  exit 0
fi

# Ensure Android NDK is installed and exported before Gradle runs (rust-android-gradle checks very early)
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-${HOME}/Android/Sdk}}"
NDK_VERSION="${ANDROID_NDK_VERSION:-27.0.12077973}"

# Resolve sdkmanager path
SDKMANAGER="${SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager"
if [[ ! -x "${SDKMANAGER}" ]]; then
  SDKMANAGER="$(command -v sdkmanager || true)"
fi

if [[ -z "${SDKMANAGER}" ]]; then
  echo "sdkmanager not found; cannot proactively install NDK. Gradle may attempt to install it."
else
  # Accept licenses just in case
  yes | "${SDKMANAGER}" --sdk_root="${SDK_ROOT}" --licenses >/dev/null 2>&1 || true

  if [[ ! -d "${SDK_ROOT}/ndk/${NDK_VERSION}" ]]; then
    echo "Installing Android NDK ${NDK_VERSION} into ${SDK_ROOT}/ndk/${NDK_VERSION}"
    "${SDKMANAGER}" --sdk_root="${SDK_ROOT}" --install "ndk;${NDK_VERSION}"
  else
    echo "Android NDK ${NDK_VERSION} already present at ${SDK_ROOT}/ndk/${NDK_VERSION}"
  fi
fi

# Use the requested (or latest) side-by-side NDK and export common env vars
if [[ -d "${SDK_ROOT}/ndk/${NDK_VERSION}" ]]; then
  SELECTED_NDK_DIR="${SDK_ROOT}/ndk/${NDK_VERSION}"
else
  SELECTED_NDK_DIR="$(ls -1d "${SDK_ROOT}/ndk"/* 2>/dev/null | sort -V | tail -n1 || true)"
fi

if [[ -z "${SELECTED_NDK_DIR}" || ! -d "${SELECTED_NDK_DIR}" ]]; then
  echo "Android NDK directory not found after installation attempt; skipping Rust prebuild"
  exit 0
fi

export ANDROID_NDK_ROOT="${SELECTED_NDK_DIR}"
export ANDROID_NDK_HOME="${SELECTED_NDK_DIR}"
export ANDROID_NDK="${SELECTED_NDK_DIR}"
if command -v set-env >/dev/null 2>&1; then
  set-env ANDROID_NDK_ROOT "${ANDROID_NDK_ROOT}"
  set-env ANDROID_NDK_HOME "${ANDROID_NDK_HOME}"
  set-env ANDROID_NDK "${ANDROID_NDK}"
  # Also provide as JVM system properties for Gradle plugins that only read from system props
  set-env JAVA_TOOL_OPTIONS "-DANDROID_NDK_HOME=${ANDROID_NDK_ROOT} -DANDROID_NDK_ROOT=${ANDROID_NDK_ROOT} -DANDROID_NDK=${ANDROID_NDK_ROOT} ${JAVA_TOOL_OPTIONS:-}"
fi
echo "Using NDK at ${SELECTED_NDK_DIR}"

# Ensure Gradle recognizes the selected NDK version without ndk.dir (deprecated)
PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
GRADLE_PROPERTIES="${PROJECT_ROOT}/android/gradle.properties"
mkdir -p "${PROJECT_ROOT}/android"
if [[ -f "${GRADLE_PROPERTIES}" ]]; then
  if grep -q '^android.ndkVersion=' "${GRADLE_PROPERTIES}"; then
    sed -i.bak -E "s|^android.ndkVersion=.*$|android.ndkVersion=${NDK_VERSION}|" "${GRADLE_PROPERTIES}" || true
  else
    # Ensure file ends with a newline before appending to avoid concatenating with previous property
    if [[ -n "$(tail -c1 "${GRADLE_PROPERTIES}" 2>/dev/null || true)" ]]; then
      printf "\n" >> "${GRADLE_PROPERTIES}"
    fi
    printf "android.ndkVersion=%s\n" "${NDK_VERSION}" >> "${GRADLE_PROPERTIES}"
    printf "org.gradle.project.android.ndkVersion=%s\n" "${NDK_VERSION}" >> "${GRADLE_PROPERTIES}"
  fi
else
  {
    printf "android.ndkVersion=%s\n" "${NDK_VERSION}"
    printf "org.gradle.project.android.ndkVersion=%s\n" "${NDK_VERSION}"
  } > "${GRADLE_PROPERTIES}"
fi
echo "Ensured android.ndkVersion=${NDK_VERSION} in ${GRADLE_PROPERTIES}"

# Ensure Python interpreter is available to linker wrapper
if command -v set-env >/dev/null 2>&1; then
  set-env RUST_ANDROID_GRADLE_PYTHON_COMMAND python3
else
  export RUST_ANDROID_GRADLE_PYTHON_COMMAND=python3
fi

# Patch Emurgo bridge modules to use the correct NDK version
CSL_BRIDGE_GRADLE_PROPS="${PROJECT_ROOT}/node_modules/@emurgo/csl-mobile-bridge-jsi/android/gradle.properties"
MSL_BRIDGE_GRADLE_PROPS="${PROJECT_ROOT}/node_modules/@emurgo/msl-mobile-bridge-jsi/android/gradle.properties"

for BRIDGE_PROPS in "${CSL_BRIDGE_GRADLE_PROPS}" "${MSL_BRIDGE_GRADLE_PROPS}"; do
  if [[ -f "${BRIDGE_PROPS}" ]]; then
    echo "Patching NDK version in ${BRIDGE_PROPS}"
    # Update or add the ndkversion property to match our version
    if grep -q '^.*_ndkversion=' "${BRIDGE_PROPS}"; then
      sed -i.bak -E "s|^.*_ndkversion=.*$|CslMobileBridge_ndkversion=${NDK_VERSION}|" "${BRIDGE_PROPS}" || true
      sed -i.bak -E "s|^.*_ndkversion=.*$|MslMobileBridge_ndkversion=${NDK_VERSION}|" "${BRIDGE_PROPS}" || true
    else
      printf "CslMobileBridge_ndkversion=%s\n" "${NDK_VERSION}" >> "${BRIDGE_PROPS}"
      printf "MslMobileBridge_ndkversion=%s\n" "${NDK_VERSION}" >> "${BRIDGE_PROPS}"
    fi
    # Also add android.ndkVersion for good measure
    if ! grep -q '^android.ndkVersion=' "${BRIDGE_PROPS}"; then
      printf "android.ndkVersion=%s\n" "${NDK_VERSION}" >> "${BRIDGE_PROPS}"
    fi
  fi
done

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
