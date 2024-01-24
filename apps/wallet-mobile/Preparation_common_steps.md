# Description

There is description how to prepare the project and build the mobile application from the code of the repo.

Here you can find instructions on how to build the application on MacOS. There isn't a significant difference between Ubuntu and MacOS (except that you can't build the iOS app on Ubuntu), so the instructions should be suitable for Ubuntu as well.

The instructions on how to build the Android version of the app will be presented later.

## MacOS

The instruction is made for the macOS Ventura 13.3.1

To build the application on MacOS it is necessary to make some preparation.

### Common preparation

- First of all it is necessary to install [`brew`](https://brew.sh/). It will help a lot further.
- Install Xcode
- Install the stable version of Xcode command line tools through the web site or run the command `xcode-select --install`
- Install `nvm` to that run the command `brew install nvm`. The node version `v16.19.0` is required.
- Select the node version `v16.19.0` -> `nvm use v16.19.0`
- Install `yarn` globally. To do that run the command `npm install -g yarn`
- Install `rust` if it is necessary. To install rust run the command `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Set the specific version of `rust`. Run the command `rustup default nightly-2023-02-09`
- Install additional libraries for `rust`. Run the command `rustup target add aarch64-apple-darwin aarch64-apple-ios aarch64-apple-ios-sim aarch64-linux-android armv7-linux-androideabi i686-linux-android wasm32-unknown-unknown x86_64-apple-ios x86_64-linux-android`
- Install cargo lipo -> `cargo install cargo-lipo`
- Install python version 2.7.18. I would recommend to install it from [`the official python page`](https://www.python.org/downloads/release/python-2718/). Please keep in mind that the builder will call the python 2 by the command `python`
- Install the `java 11`
- Clone the project
- Go to the project folder
- Run packages installation -> `yarn install`

Common preparation is done on this step.

### Preparing and building for special platforms

- [iOS](./Preparing_and_building_iOS.md)
- [Android](./Preparing_and_building_Android.md)
