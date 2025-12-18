#!/bin/bash

# Build script for iOS with Rust support
set -e

echo "🔧 Setting up iOS build environment..."

# Install Rust if not already installed
if ! command -v rustc &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
    source $HOME/.cargo/env
fi

rustup default 1.86

# Add iOS targets (including x86_64-apple-darwin for Intel Macs)
echo "🎯 Adding iOS targets..."
rustup target add aarch64-apple-darwin
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add wasm32-unknown-unknown
rustup target add x86_64-apple-darwin
rustup target add x86_64-apple-ios
rustup target add x86_64-linux-android

# Show Rust configuration
echo "📋 Rust configuration:"
rustup show

# Build CSL mobile bridge
echo "🔨 Building CSL mobile bridge..."
cd node_modules/@emurgo/csl-mobile-bridge/rust
cargo build --release --target aarch64-apple-darwin
cargo build --release --target aarch64-apple-ios
cargo build --release --target aarch64-apple-ios-sim
cargo build --release --target aarch64-linux-android
cargo build --release --target armv7-linux-androideabi
cargo build --release --target i686-linux-android
cargo build --release --target wasm32-unknown-unknown
cargo build --release --target x86_64-apple-ios
cargo build --release --target x86_64-linux-android

cd ../../../

# Build MSL mobile bridge
echo "🔨 Building MSL mobile bridge..."
cd node_modules/@emurgo/msl-mobile-bridge/rust
cargo build --release --target aarch64-apple-darwin
cargo build --release --target aarch64-apple-ios
cargo build --release --target aarch64-apple-ios-sim
cargo build --release --target aarch64-linux-android
cargo build --release --target armv7-linux-androideabi
cargo build --release --target i686-linux-android
cargo build --release --target wasm32-unknown-unknown
cargo build --release --target x86_64-apple-ios
cargo build --release --target x86_64-linux-android
cd ../../../

# Check if Rust libraries exist
echo "🔍 Checking Rust libraries..."
find node_modules/@emurgo -name "*.a" -o -name "*.dylib" | grep -i ios | head -10

echo "✅ iOS build setup complete!"
