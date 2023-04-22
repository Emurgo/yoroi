#!/bin/bash
test -z "${ANDROID_HOME}" && ANDROID_HOME="/opt/android-sdk-linux"
test -z "${BASH_ENV}" && BASH_ENV="$HOME/.bashrc"
echo "Set BASH_ENV as: $BASH_ENV"
ANDROID_NDK="$ANDROID_HOME/ndk-bundle"
ANDROID_NDK_HOME="$ANDROID_HOME/ndk-bundle"
echo 'export ANDROID_NDK=$ANDROID_HOME/ndk-bundle/' >> $BASH_ENV
echo 'export ANDROID_NDK_HOME=$ANDROID_HOME/ndk-bundle/' >> $BASH_ENV

if [ ! -e $ANDROID_NDK ]; then
  test -e ${ANDROID_HOME} || mkdir -p ${ANDROID_HOME}
  cd $ANDROID_HOME
  echo "Downloading NDK..."
  sudo curl -L -o ndk.zip https://dl.google.com/android/repository/android-ndk-r20-linux-x86_64.zip
  sudo unzip -o -q ndk.zip
  sudo mv android-ndk-r17b ndk-bundle

  echo "Installed Android NDK at $ANDROID_NDK"

  sudo rm ndk.zip
fi
