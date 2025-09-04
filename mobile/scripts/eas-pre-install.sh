#!/usr/bin/env bash
set -euo pipefail

echo "EAS pre-install: Rust setup"

# Only run on iOS builds
if [[ "${EAS_BUILD_PLATFORM:-}" != "ios" ]]; then
  echo "Skipping Rust install (platform: ${EAS_BUILD_PLATFORM:-unknown})"
  exit 0
fi

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

# iOS device + simulators
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

echo "Rust installed and iOS targets added"


