#!/usr/bin/env bash
set -euo pipefail

echo "EAS pre-install: Rust setup"

# # Only run on iOS builds
# if [[ "${EAS_BUILD_PLATFORM:-}" != "ios" ]]; then
#   echo "Skipping Rust install (platform: ${EAS_BUILD_PLATFORM:-unknown})"
#   exit 0
# fi

# Install rustup non-interactively if not installed
if ! command -v rustup >/dev/null 2>&1; then
  echo "Installing rustup..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y
else
  echo "rustup already installed"
fi

# Ensure cargo bin is on PATH for the rest of the build
export PATH="$HOME/.cargo/bin:$PATH"

# Persist PATH for subsequent EAS build steps if helper is available
if command -v set-env >/dev/null 2>&1; then
  set-env PATH "$HOME/.cargo/bin:$PATH"
fi

# Determine git commit hash and always set EXPO_PUBLIC_COMMIT for Expo runtime
COMMIT_CANDIDATE=""
if [[ -n "${EAS_BUILD_GIT_COMMIT_HASH:-}" ]]; then
  COMMIT_CANDIDATE="${EAS_BUILD_GIT_COMMIT_HASH}"
  echo "Setting EXPO_PUBLIC_COMMIT from EAS_BUILD_GIT_COMMIT_HASH"
elif git rev-parse --verify HEAD >/dev/null 2>&1; then
  COMMIT_CANDIDATE="$(git rev-parse HEAD)"
  echo "Setting EXPO_PUBLIC_COMMIT from local git HEAD ${COMMIT_CANDIDATE}"
else
  COMMIT_CANDIDATE="unknown"
  echo "Warning: Unable to determine commit hash; using 'unknown'"
fi

# Some CI environments may set EXPO_PUBLIC_COMMIT to the literal string '$EAS_BUILD_GIT_COMMIT_HASH'.
# Always override to ensure a real value is embedded in the bundle.
if command -v set-env >/dev/null 2>&1; then
  set-env EXPO_PUBLIC_COMMIT "${COMMIT_CANDIDATE}"
else
  export EXPO_PUBLIC_COMMIT="${COMMIT_CANDIDATE}"
fi

# iOS device + simulators + android
rustup target add \
 aarch64-apple-darwin \
 aarch64-apple-ios \
 aarch64-apple-ios-sim \
 aarch64-linux-android \
 armv7-linux-androideabi \
 i686-linux-android \
 wasm32-unknown-unknown \
 x86_64-apple-ios \
 x86_64-linux-android

echo "Rust installed and iOS and Android targets added"


# If this is an Android build, ensure the requested Android NDK is installed early
if [[ "${EAS_BUILD_PLATFORM:-}" == "android" ]]; then
  # Default to the version Expo root project uses (seen in build logs)
  NDK_VERSION="${ANDROID_NDK_VERSION:-27.1.12297006}"

  SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-${HOME}/Android/Sdk}}"
  SDKMANAGER="${SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager"
  if [[ ! -x "${SDKMANAGER}" ]]; then
    SDKMANAGER="$(command -v sdkmanager || true)"
  fi

  if [[ -z "${SDKMANAGER}" ]]; then
    echo "sdkmanager not found; cannot install NDK proactively. Gradle will attempt installation later."
  else
    echo "Ensuring Android NDK ${NDK_VERSION} is installed (SDK root: ${SDK_ROOT})"
    # Accept licenses non-interactively
    yes | "${SDKMANAGER}" --sdk_root="${SDK_ROOT}" --licenses >/dev/null 2>&1 || true

    if [[ -d "${SDK_ROOT}/ndk/${NDK_VERSION}" ]]; then
      echo "NDK ${NDK_VERSION} already installed at ${SDK_ROOT}/ndk/${NDK_VERSION}"
    else
      "${SDKMANAGER}" --sdk_root="${SDK_ROOT}" --install "ndk;${NDK_VERSION}"
    fi

    if [[ -d "${SDK_ROOT}/ndk/${NDK_VERSION}" ]]; then
      export ANDROID_NDK_ROOT="${SDK_ROOT}/ndk/${NDK_VERSION}"
      export ANDROID_NDK_HOME="${SDK_ROOT}/ndk/${NDK_VERSION}"
      export ANDROID_NDK="${SDK_ROOT}/ndk/${NDK_VERSION}"
      if command -v set-env >/dev/null 2>&1; then
        set-env ANDROID_NDK_ROOT "${ANDROID_NDK_ROOT}"
        set-env ANDROID_NDK_HOME "${ANDROID_NDK_HOME}"
        set-env ANDROID_NDK "${ANDROID_NDK}"
      fi
      echo "NDK ready at ${ANDROID_NDK_ROOT}"

      # Ensure Gradle subprojects (like Emurgo bridges) can resolve NDK by setting ndk.dir
      PROJECT_ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
      LOCAL_PROPERTIES="${PROJECT_ROOT}/android/local.properties"
      mkdir -p "${PROJECT_ROOT}/android"
      if [[ -f "${LOCAL_PROPERTIES}" ]]; then
        if grep -q '^ndk.dir=' "${LOCAL_PROPERTIES}"; then
          # Replace existing ndk.dir line
          sed -i.bak -E "s|^ndk.dir=.*$|ndk.dir=${ANDROID_NDK_ROOT}|" "${LOCAL_PROPERTIES}" || true
        else
          echo "ndk.dir=${ANDROID_NDK_ROOT}" >> "${LOCAL_PROPERTIES}"
        fi
      else
        # Also include sdk.dir if known
        {
          if [[ -n "${SDK_ROOT}" ]]; then echo "sdk.dir=${SDK_ROOT}"; fi
          echo "ndk.dir=${ANDROID_NDK_ROOT}"
        } > "${LOCAL_PROPERTIES}"
      fi
      echo "Wrote ndk.dir to ${LOCAL_PROPERTIES}"
    else
      echo "Warning: NDK ${NDK_VERSION} not found after installation attempt"
    fi
  fi
fi


