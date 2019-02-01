#!/bin/bash

echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> $BASH_ENV

if rustup --version; then
  echo "Rustup is already installed"
else
  # install rustup
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  source $HOME/.cargo/env

  # use 1.32.0 version. 
  rustup install 1.32.0
  rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
  cargo install cargo-lipo
  export
  cargo
fi
