#!/bin/bash

# Prebuild script for iOS builds with Rust support
set -e

# Handle any arguments passed by expo
while [[ $# -gt 0 ]]; do
  case $1 in
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

echo "🔧 Setting up Rust toolchain for iOS build..."

# Install Rust if not already installed
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
    source $HOME/.cargo/env
fi

rustup default 1.86

# Add iOS targets
echo "🎯 Adding iOS targets..."
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

# Show Rust configuration
echo "📋 Rust configuration:"
rustup show

# Check if Rust libraries exist
echo "🔍 Checking Rust libraries..."
find node_modules/@emurgo -name "*.a" -o -name "*.dylib" | grep -i ios | head -5

echo "✅ Prebuild setup complete!"
