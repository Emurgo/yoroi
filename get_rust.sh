#!/bin/bash

echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> $BASH_ENV

if rustup --version; then
  echo "Rustup is already installed"
else
  # install rustup
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  source $HOME/.cargo/env

  # use nightly version. 
  rustup install nightly-2018-10-30
  rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android \
                    aarch64-apple-ios armv7-apple-ios armv7s-apple-ios x86_64-apple-ios i386-apple-ios
  cargo install cargo-lipo
  export
  cargo
fi
