#!/bin/bash
ANDROID_HOME="/opt/android/sdk"
ANDROID_NDK="$ANDROID_HOME/ndk-bundle"
ANDROID_NDK_HOME="$ANDROID_HOME/ndk-bundle"
echo 'export ANDROID_NDK=$ANDROID_HOME/ndk-bundle/' >> $BASH_ENV
echo 'export ANDROID_NDK_HOME=$ANDROID_HOME/ndk-bundle/' >> $BASH_ENV

if [ ! -e ANDROID_NDK ]; then
  cd $ANDROID_HOME
  echo "Downloading NDK..."
  sudo curl -L -o ndk.zip https://dl.google.com/android/repository/android-ndk-r17b-linux-x86_64.zip
  unzip -o -q ndk.zip
  mv android-ndk-r17b ndk-bundle

  echo "Installed Android NDK at $ANDROID_NDK"

  sudo rm ndk.zip
fi
