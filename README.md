# Download

| Android                                                                                                                                                          | iOS                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://pbs.twimg.com/profile_images/1164525925242986497/N5_DCXYQ_400x400.jpg" width="48">](https://play.google.com/store/apps/details?id=com.emurgo) | [<img src="https://pbs.twimg.com/profile_images/1283958620359516160/p7zz5dxZ_400x400.jpg" width="48">](https://apps.apple.com/us/app/emurgos-yoroi-cardano-wallet/id1447326389) |

Looking for the Yoroi Extension? See [here](https://github.com/Emurgo/yoroi-frontend)

# Development

## Installation

---

**NOTE**

The **Windows + WSL2 Ubuntu** is used in the instruction for building project for android devices.<br/>The instruction is checked.<br/>It should work for the Ubuntu also, but it is not checked.

---

### iOS preparation

---

- Install cocoapods and download ios dependencies:

```
gem install cocoapods
```

- Install Rust:

```shell
curl https://sh.rustup.rs -sSf | sh
rustup toolchain install 1.41.0
rustup install 1.41.0
rustup target add wasm32-unknown-unknown --toolchain 1.41.0
rustup default 1.41.0
```

- Make sure your Node.js version matches `v16.5.0`.<br/>If you have `nvm` installed, you can just `nvm use`.
- Install rust build targets:
  </br>`rustup target add aarch64-apple-ios armv7-apple-ios armv7s-apple-ios x86_64-apple-ios i386-apple-ios`
- Install cargo-lipo for building:
  </br>`cargo install cargo-lipo`

#### Additional configuration for MacOS Big Sur users

MacOS Big Sur changed the default path of the system C linker, which breaks `cargo lipo`. Some approaches to fix this are detailed here https://github.com/TimNN/cargo-lipo/issues/41.

---

### Android preparation

---

<div style="background-color: #299EFE;border: 2px solid #0271CB;padding: 1em;color: antiquewhite; border-radius: 10px">
NOTE. For windows users only.
<p style="color: antiquewhite">It is necessary to activate WSL2 and install the Ubuntu distribution on it.</p>
How to do that, please read <a href='https://docs.microsoft.com/en-us/windows/wsl/setup/environment'><span style="color: firebrick">here</span></a>
</div>

#### WSL2 Ubuntu preparation

- Install Rust:

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup toolchain install 1.41.0
rustup install 1.41.0
rustup target add wasm32-unknown-unknown --toolchain 1.41.0
rustup default 1.41.0
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

- Install `wasm-prkg`:
  </br>`curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
- [Install git](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-git)
- [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Clone the project
- Run the `nvm use` command in the project rot directory
- Install `yarn`:
  </br>`npm --install yarn`
- Check that Yarn is installed:
  </br>`yarn --version`
- Install Java 8:
  </br>`sudo apt-get install openjdk-8-jdk`.
- If you have other java version switch to the 8 version by running the command:
  </br>`sudo update-alternatives --config java`
- Install Python 2:
  </br>`sudo apt-get install python`
- Install the Android SDK:

```shell
wget https://dl.google.com/android/repository/commandlinetools-linux-6200805_latest.zip
cd ~
mkdir -p Android/Sdk
unzip commandlinetools-linux-6200805_latest.zip -d Android/Sdk
```

- Add the next two lines to your `.bashrc`

```shell
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH"
# Make sure emulator path comes before tools. Had trouble on Ubuntu with emulator from /tools being loaded instead of the one from /emulator
```

- Update the Android SDK:

```shell
sdkmanager --sdk_root=${ANDROID_HOME} "tools"
sdkmanager --update
sdkmanager --list
sdkmanager "build-tools;28.0.3" "platform-tools" "platforms;android-28" "tools"
sdkmanager --licenses
```

- Install the Gradle:
  </br>`sudo apt install gradle`
- Install the Android NDK:
  </br>`sdkmanager --install "ndk;20.0.5594570"`

---

#### Windows + WSL2 Ubuntu (Physical device)

This requires a physical Android phone & USB cable, the Android Studio should be installed on Windows

**On Windows**

1. Connect a device to your Windows PC, the developer option on the Android phone should be ON, debugging via USB is also ON
2. Run the Windows Terminal as Admin
3. Enter the following commands:

```shell
adb devices # check device is appeared
adb kill-server
adb tcpip 5555
```

> Make sure your PC and the device are connected to the same WiFi network 4. Grab your phone ip

**On WSL2 Ubuntu** 5. Connect to your device

```shell
adb connnect <device-ip>:5555
adb devices -l # check device is appeared
```

---

#### Windows + WSL2 Ubuntu (Virtual Device)

**On Windows Host** (Setup Android device)

1. Run Virtual Device from Android Studio
2. Run the Windows Terminal as Admin
3. Enter the following commands:

```shell
adb devices # check device is appeared
adb kill-server
adb tcpip 5555
```

**On WSL2 Ubuntu** 4. Connect to your device

```shell
adb connnect <device-ip>:5555
adb devices -l # check device is appeared
```

On Host (allow app to connect to packaged bundle after build)

---

### First time

---

Make sure the rust targets for the platform you will work on (android/iOS) have been correctly installed with `rustup show`. Then:

1. `yarn install`
1. `yarn setup_configs` - links libraries to ios testnet build configurations
1. When building on iOS: `cd ios && pod install`

If these steps fail, try looking at the [android CLI](https://github.com/Emurgo/yoroi-mobile/blob/develop/.circleci/config.yml#L68)

---

# Launching

---

1. `react-native start` - this will run RN packager, let it running (optional step)
2. `react-native run-android --variant=devDebug --appIdSuffix=staging` - for version with testnet
3. `react-native run-android --variant=mainnetDebug` - for version with mainnet

4. `react-native run-ios --scheme=emurgo-staging --configuration=Staging.Debug` - staging (testnet) configuration
5. `react-native run-ios --scheme=emurgo --configuration=Debug` - production configuration

---

# Testing

---

## Unit Testing

---

To run all unit tests:

```bash
$ yarn test
```

You can also run single test files, e.g.:

```bash
$ jest wallet.test.js
```

---

## End-to-end Testing

---

For E2E tsting we use the [detox](https://github.com/wix/Detox) framework.

### Requirements

- **iOS**: MacOS 10.13 (High Sierra) or higher, Xcode 10.1 or higher.
- **Android**: Tested on Android Studio 3.5.1. Simulator: Android >= 9, API >= 28 (but prior versions may work too).

### Setup (applies to iOS only)

You only need to follow the instructions listed in the Step 1 of Detox's official [docs](https://github.com/wix/Detox/blob/master/docs/Introduction.GettingStarted.md#step-1-install-dependencies):

```bash
$ brew tap wix/brew
$ brew install applesimutils
$ npm install -g detox-cli
```

### Building and Running

Important: You need to build the app not only the first time you run the tests but also anytime you modify the code.

```bash
$ yarn e2e:build-android # for ios just replace "android" by "ios"
$ yarn e2e:test-android
```

This will build and test a _release_ version of the app.

---

# Debugging

---

Read through [this page](https://facebook.github.io/react-native/docs/debugging) to understand debugging for React-Native

#### React-Native Debugger

This will allow you to put breakpoints and everything else you would ever need.

1. Download & run https://github.com/jhen0409/react-native-debugger/releases
1. While app is running, open debug menu
1. Select `Debug JS remotely`

---

# Releasing

---

1. Follow [Signed Android APK](https://facebook.github.io/react-native/docs/signed-apk-android) to generate and setup signing certificate for Android
   (required only before first release).
2. `cd android`
3. `./gradlew assembleMainRelease`

_Important_: You may run into `Could not follow symbolic link third-party/glog-0.3.5/test-driver` error
if you try to build Android release on Mac. This is caused by incorrect linking in react-native/npm.
To fix the issue, locate path where `automake` is installed (default `/usr/local/share`) and re-link
file by running command:

`ln -sf /usr/local/share/automake-<version>/test-driver <path_to_repo>/third-party/glog-0.3.5/test-driver`

---

# Troubleshooting

---

## Checking that Rust is well setup (iOS & Android)

After following the instructions for iOS and Android -- it is not required to install both, `rustup show` should return something like this:

```
rustup show
Default host: x86_64-apple-darwin
rustup home:  /Users/nijaar/.rustup

installed toolchains
--------------------

stable-x86_64-apple-darwin
1.41.0-x86_64-apple-darwin (default)

installed targets for active toolchain
--------------------------------------

aarch64-apple-ios
aarch64-linux-android
armv7-apple-ios
armv7-linux-androideabi
armv7s-apple-ios
i386-apple-ios
i686-linux-android
x86_64-apple-darwin
x86_64-apple-ios
x86_64-linux-android

active toolchain
----------------

1.41.0-x86_64-apple-darwin (default)
rustc 1.41.0 (5e1a79984 2020-01-27)
```

---

# Code style

---

## Imports

---

The imports should be in this order:

1. import of external libraries
2. import of our custom code
3. import of component styles
4. import of types

Example:

```js
// @flow

// external libraries
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'

// our code
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'

// styles
import styles from './TxDetails.style'

// types
import type {TransactionType} from '../../types/HistoryTransaction'
```

---

## Styles

---

- If you use component in multiple screens, it should be in `UiKit` folder with other UI components and imported from it.
- Each component file has own file with styles.
- Don't import multiple style files into one component.
- Keep the style's structure flat.
- If there is same component in `UiKit` as in `react-native`, use the one from `UiKit`.

```js
// src/components/UiKit/index.js
// Example of export for a default component that can be imported from UI.
export {default as Button} from './Button'
```

```js
import {Text, Button, Input} from '../UiKit'

// ...
```

### Variables

```js
import {colors} from './config'

// Wrong
// The background color can change, gray is constant name for specific color.
background: colors.GRAY
// ...

// Good
// Changing the background color doesn't require to change the name.
// We want to change values, not labels most of time.
background: colors.background
// ...
```
