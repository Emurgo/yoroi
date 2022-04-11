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

```shell
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
- Install dependencies:
  </br>`yarn install`

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

- Install additional tools:

```shell
sudo apt-get update
sudo apt-get install build-essential git curl wget unzip socat -y
```

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

```shell
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

- [Install nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Install Java 8:

```shell
sudo apt-get install openjdk-8-jdk
```

- If you have other java version switch to the 8 version by running the command:

```shell
sudo update-alternatives --config java
```

- Install Python 2:

```shell
sudo apt-get install python
```

- Install the Android SDK:

```shell
wget https://dl.google.com/android/repository/commandlinetools-linux-6200805_latest.zip
cd ~
mkdir -p Android/Sdk
unzip commandlinetools-linux-6200805_latest.zip -d Android/Sdk
```

- Add the next lines to your `.bashrc`

```shell
export ANDROID_HOME=$HOME/Android/Sdk
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH"
# Make sure emulator path comes before tools. Had trouble on Ubuntu with emulator from /tools being loaded instead of the one from /emulator
# Further lines are only necessary if you use Windows + WSL2 Ubuntu
export WSL_HOST_IP="$(tail -1 /etc/resolv.conf | cut -d' ' -f2)"
export ADB_SERVER_SOCKET=tcp:$WSL_HOST_IP:5037
```

- Update the Android SDK:

```shell
sdkmanager --sdk_root=${ANDROID_HOME} "tools"
sdkmanager --update
sdkmanager --list
sdkmanager "build-tools;28.0.3" "platform-tools" "platforms;android-28" "tools"
sdkmanager --licenses
```

- Install the Android NDK:

```shell
sdkmanager --install "ndk;20.0.5594570"
```

- Install the Gradle:

```shell
sudo apt install gradle -y
```

- Clone the project

```shell
cd ~ && mkdir Emurgo && cd Emurgo
git clone https://github.com/Emurgo/yoroi-mobile.git
cd yoroi-mobile
```

- Run the `nvm use` command
- Install `yarn`:

```shell
npm install -g yarn
```

- Check that Yarn is installed:

```shell
yarn --version
```

- Install dependencies:

```shell
yarn install
```

---

#### Windows preparation

- Install Android studio
- In the Android Studio install Android SDK Build-Tools, NDK, CMake, Android emulator, Android SDK Platform tools
- Add the following lines to the system PATH:

```shell
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk"
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk\emulator"
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk\platform-tools"
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk\tools"
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk\tools\bin"
setx /m PATH "C:\Users\<YOUR_USER>\AppData\Local\Android\Sdk\tools\lib\x86_64\swt.jar"
```

- Install Java 8
- Add the variable `JAVA_HOME` to your system variables:
  </br>`setx /m JAVA_HOME "C:\Program Files\Java\jre1.8.0_311\bin"`
- Prepare Windows Firewall:

```text
Add a Windows Firewall Rule (gotten from [here](https://github.com/Emurgo/react-native-haskell-shelley/issues/12#issuecomment-741967533))

Open Windows Defender Firewall and go to Advanced Settings.
Right click on "Inbound Rules" and click "New Rule"
Select "Port" then Specific TCP port "5037", then "Allow the connection"
Check Domain, Private, and Public as needed for your Internet connection (I only added Domain and Private)
Name the rule whatever suits you
After the firewall entry is added, right click on it and go to Properties
Go to Scope -> Remote IP Addresses -> Add "172.16.0.0/12" (this is the WSL VM subnet)
```

---

#### Connecting a device, Windows + WSL2 Ubuntu (Physical or virtual device)

This requires a physical Android phone & USB cable, the Android Studio should be installed on Windows

**On Windows**

1. Connect a device to your Windows PC OR run a device emulator, the developer option on the Android phone should be ON, debugging via USB is also ON
2. Run this commands in the PowerShell Admin Terminal (or you can create a PS script and run it as an Admin):

```shell
iex "netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=127.0.0.1" | out-null;
$WSL_CLIENT = bash.exe -c "ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'";
$WSL_CLIENT -match '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}';
$WSL_CLIENT = $matches[0];
iex "netsh interface portproxy add v4tov4 listenport=8081 listenaddress=127.0.0.1 connectport=8081 connectaddress=$WSL_CLIENT"
```

3. Kill the adb server (just in case)

```shell
adb kill-server
```

4. Start the adb server

```shell
adb -a -P 5037 nodaemon server
```

If you want to use an emulator</br>
Run another Terminal as Admin</br>
Create an image ([how to do it from command line](https://developer.android.com/studio/command-line/avdmanager)) </br>
Run an emulator

```shell
emulator -avd <image_name>
```

**On WSL2 Ubuntu**

5. Run WSL Terminal
6. Execute the command

```shell
socat -d -d TCP-LISTEN:5037,reuseaddr,fork TCP:$(cat /etc/resolv.conf | tail -n1 | cut -d " " -f 2):5037
```

7. Run another WSL Terminal

```shell
yarn start
```

---

### First time

Make sure the rust targets for the platform you will work on (android/iOS) have been correctly installed with `rustup show`. Then:

1. `yarn setup_configs` - links libraries to ios testnet build configurations
1. When building on iOS: `cd ios && pod install`

If these steps fail, try looking at the [android CLI](https://github.com/Emurgo/yoroi-mobile/blob/develop/.circleci/config.yml#L68)

---

# Launching

1. `react-native start` - this will run RN packager, let it running (optional step)
2. `react-native run-android --variant=devDebug --appIdSuffix=staging` - it will build a debug package with the testnet version and install it on the connected device
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

For E2E testing we use the [detox](https://github.com/wix/Detox) framework.

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

## Binaryen submodule problems

If you have been facing the problem

```bash
failed to fetch submodule `binaryen` from git@github.com:WebAssembly/binaryen.git
```

These steps should help you.

1. It is necessary to create a ssh-key and to add it to your GitHub account. [The GitHub instruction how to do that](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) </br>
2. Add the generated ssh-key to your ssh-agent

```bash
eval `ssh-agent -s`
ssh-add ~/.ssh/<your_private_key>
```

### If the error still persists.

Add the `github.com` to your `~/.ssh/known_hosts`

1. Get the `github.com` ip-address

```bash
ping github.com -c 1
```

2. Get the github.com public ssh keys by GitHub ip-address

```bash
ssh-keyscan <github.com ip-address>
```

The output will be something like that

```bash
140.82.121.3 ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
140.82.121.3 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=
140.82.121.3 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

3. Copy one of output strings and place it into your `~/.ssh/known_hosts`.
   - If the setting `HashKnownHosts` is `yes` (Debian and Ubuntu it is `yes` by default) it is necessary to re-hash your `known-hosts` file.
     - To check the state of the setting, check the file `/etc/ssh/ssh_config` (Ubuntu)
     - Re-hashing the `known_hosts` file
   ```bash
   ssh-keygen -Hf ~/.ssh/known_hosts
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
// external libraries
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'

// our code
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'

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
