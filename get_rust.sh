#!/bin/bash

if [ -f $HOME/.cargo/env ]
then
  source $HOME/.cargo/env
  echo "Rustup is already installed"
else
  # install rustup
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  source $HOME/.cargo/env

  # use 1.41.0 version.
  rustup install 1.41.0

  # cargo-lipo required only for ios build
  if [ -z "$YOROI_ANDROID_BUILD" ]
  then
    rustup target add aarch64-apple-ios armv7-apple-ios armv7s-apple-ios x86_64-apple-ios i386-apple-ios
    cargo install cargo-lipo
  else
    rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
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
