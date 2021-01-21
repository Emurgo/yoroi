# Download

| Android | iOS |
|---|----|
| [<img src="https://pbs.twimg.com/profile_images/1164525925242986497/N5_DCXYQ_400x400.jpg" width="48">](https://play.google.com/store/apps/details?id=com.emurgo) | [<img src="https://pbs.twimg.com/profile_images/1283958620359516160/p7zz5dxZ_400x400.jpg" width="48">](https://apps.apple.com/us/app/emurgos-yoroi-cardano-wallet/id1447326389) |

Looking for the Yoroi Extension? See [here](https://github.com/Emurgo/yoroi-frontend)

# Development

## Installation

### Both platforms

```
# install rustup
curl https://sh.rustup.rs -sSf | sh

# use 1.38.0 version
rustup toolchain install 1.38.0
rustup install 1.38.0
rustup target add wasm32-unknown-unknown --toolchain 1.38.0
```
Make sure `rustc --version` outputs `1.38.0`, which is the stable version (and not nightly).

Also, make sure your `nodeJS` verison matches `v10.14.2`. If you have `nvm` installed, you can just `nvm use`.

### ios

Install cocoapods and download ios dependencies:

```
gem install cocoapods
cd ios && pod install
```

Install rust build targets: `rustup target add aarch64-apple-ios armv7-apple-ios armv7s-apple-ios x86_64-apple-ios i386-apple-ios`

Install cargo-lipo for building: `cargo install cargo-lipo`

Setup React Native third-party libraries (Run these after `yarn install`):
```
node_modules/react-native/scripts/ios-install-third-party.sh
node_modules/react-native/third-party/glog-0.3.5/configure
```

In case of problems generating the compiled targets for iOS. You can use the precompiled targets
```
sh install_precompiled_targets.sh
```

If you get an error of the style:

`Could not list contents of '/Users/myself/yoroi-mobile/third-party/glog-0.3.5/test-driver'. Couldn't follow symbolic link.`

Command for updating link `ln -sf /usr/local/share/automake-<version>/test-driver  <path_to_repo>/third-party/glog-0.3.5/test-driver`

### android

#### Windows (Physical device)

This requires a physical Android phone & USB cable

1. Download [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
1. Expose the USB to VirtualBox [guide here](https://www.wikihow.tech/Connect-a-USB-to-Virtualbox)
    **Note**: You MUST expose USB 2.0 for Android devices. Exposing 3.0 will not work
1. If your devices still doesn't appear, follow [these steps](https://android.stackexchange.com/a/144967)
    **Note**: The format for these steps have changed over the years so be careful if you need this.

#### Windows (Virtual Device)

On Host (Setup Android device)
1. Run Virtual Device from Android Studio

On VM (Detect VirtualDevice from VirtualBox)
1. `adb tcpip 5555`
1. `adb kill-server`
1. `adb connect 10.0.2.2:5555`

On Host (allow app to connect to packaged bundle after build)
1. Open VirtualBox
1. VM Settings > Network >> Advanced > Port Forwarding
1. Enter `8081` as Host Port and Guest Port (leave everything else blank)

#### Android Setup

```
# install & setup android studio
follow https://facebook.github.io/react-native/docs/getting-started.html (tab Building Projects with Native Code)
```

1. Ask for a copy of (or create a blank version of) `android/gradle.properties.local`
1. Make sure your Anddroid build tools match the version in [android/build.gradle](android/build.gradle) (you will get an error otherwise)
1. Download the NDK from Android Studio (see [here](https://developer.android.com/studio/projects/install-ndk.md) for instructions)
1. Install Rust for Android `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`

### First time
Make sure the rust targets for the platform you will work on (android/iOS) have been correctly installed with `rustup show`. Then:

1. `yarn install`
1. `yarn setup_configs` - links libraries to ios testnet build configurations

If these steps fail, try looking at the [android CLI](https://github.com/Emurgo/yoroi-mobile/blob/develop/.circleci/config.yml#L68)

# Launching

1. `react-native start` - this will run RN packager, let it running (optional step)
2. `react-native run-android --variant=devDebug` - for version with testnet
3. `react-native run-android --variant=mainnetDebug` - for version with mainnet

4. `react-native run-ios --scheme=emurgo-staging --configuration=Staging.Debug` - staging (testnet) configuration
5. `react-native run-ios --scheme=emurgo --configuration=Debug` - production configuration

# Testing

## Unit Testing

To run all unit tests:
```bash
$ yarn test
```

You can also run single test files, e.g.:
```bash
$ jest wallet.test.js
```

## End-to-end Testing
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
This will build and test a *release* version of the app.

# Debugging

Read through [this page](https://facebook.github.io/react-native/docs/debugging) to understand debugging for React-Native

#### React-Native Debugger

This will allow you to put breakpoints and everything else you would ever need.

1. Download & run https://github.com/jhen0409/react-native-debugger/releases
1. While app is running, open debug menu
1. Select `Debug JS remotely`


# Releasing

1. Follow [Signed Android APK](https://facebook.github.io/react-native/docs/signed-apk-android) to generate and setup signing certificate for Android
   (required only before first release).
2. `cd android`
3. `./gradlew assembleMainRelease`

*Important*: You may run into `Could not follow symbolic link third-party/glog-0.3.5/test-driver` error
if you try to build Android release on Mac. This is caused by incorrect linking in react-native/npm.
To fix the issue, locate path where `automake` is installed (default `/usr/local/share`) and re-link
file by running command:

```ln -sf /usr/local/share/automake-<version>/test-driver <path_to_repo>/third-party/glog-0.3.5/test-driver```

# Code style

## Imports

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

## Styles

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
