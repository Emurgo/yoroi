#!/bin/bash

source $HOME/.cargo/env
if rustup --version; then
  echo "Rustup is already installed"
else
  # install rustup
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  source $HOME/.cargo/env

  # use 1.32.0 version. 
  rustup install 1.32.0
  rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

  # cargo-lipo required only for ios build
  if [ "$1" != "--skip-cargo-lipo" ] || [[ -z "$YOROI_ANDROID_BUILD" ]]
  then
    cargo install cargo-lipo
  fi

  if [[ -z "$BASH_ENV" ]]
  then
    echo "$BASH_ENV not set. Rust not added to $PATH"
  else
    echo 'export PATH=$HOME/.cargo/bin/:$PATH' >> $BASH_ENV
  fi

  export
  cargo
fi
