# Description

The instruction is suitable for MacOS and Ubuntu (with some tweaks).

## Preparation

- Install last version of [Android Studio](https://developer.android.com/studio) and install the latest version of Android SDK Command-line tools and Android SDK Platform-Tools. It can be done from `Android Studio -> Appearance & Behavior -> System Settings -> Android SDK -> "SDK Tools" tab` after activating in this section `Show Package Details`

- Add these lines to your .bashrc/.zshrc file:

```shell
export ANDROID_SDK_ROOT=<PATH_TO_AndroidSdk> # example $HOME/Library/Android/sdk
export ANDROID_NDK=$ANDROID_SDK_ROOT/ndk/
export ANDROID_NDK_HOME=$ANDROID_SDK_ROOT/ndk/
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
```

- Update the Android SDK:

```shell
sdkmanager "tools"
sdkmanager --update
sdkmanager --list
sdkmanager "build-tools;31.0.0" "platform-tools" "platforms;android-31" "tools"
sdkmanager --licenses
```

- Install the Android NDK version `23.1.7779620`:

```shell
sdkmanager --install "ndk;23.1.7779620"
```

### Optional

- Create a virtual device from Android studio with the following specs:

  - Pixel 6 device
  - System Image:
    - Release name: Tiramisu
    - API level: 33
    - ABI: x86_64
    - Target: Android 13 (Google APIs)

## Building

Before building the app, please don't forget to ensure that all preparation steps are full field.

To run the developer's debug version you need to run the command `yarn start` in one terminal and open the second terminal and run the command `yarn run:android:dev:debug`

For other build versions please check [the package.json file](./package.json)
