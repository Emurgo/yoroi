# Downloading

| Android                                                                                                                                                          | iOS                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://pbs.twimg.com/profile_images/1164525925242986497/N5_DCXYQ_400x400.jpg" width="48">](https://play.google.com/store/apps/details?id=com.emurgo) | [<img src="https://pbs.twimg.com/profile_images/1283958620359516160/p7zz5dxZ_400x400.jpg" width="48">](https://apps.apple.com/us/app/emurgos-yoroi-cardano-wallet/id1447326389) |

Looking for the Yoroi Extension? See [here](https://github.com/Emurgo/yoroi-frontend)

# Description

There is description how to build the mobile application from the code of the repo.

Here you can find instruction how build the application on MacOS. The instruction how to build android version of the app will be presented later.

## MacOS

The instruction is made for the macOS Ventura 13.3.1

To build the application on MacOS it is necessary to make some preparation.

### Preparation

- First of all it is necessary to install [`brew`](https://brew.sh/). It will help a lot further.
- Install Xcode
- Install the stable version of Xcode command line tools through the web site or run the command `xcode-select --install`
- Install `nvm` to that run the command `brew install nvm`. The node version `v16.8.0` is reqired.
- Select the node version `v16.19.0` -> `nvm use v16.19.0`
- Install `yarn` globally. To do that run the command `npm install -g yarn`
- Install `rust` if it is necessary. To install rust run the command `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Set the specific version of `rust`. Run the command `rustup default nightly-2023-02-09`
- Install additional libraries for `rust`. Run the command `rustup target add aarch64-apple-darwin aarch64-apple-ios aarch64-apple-ios-sim aarch64-linux-android armv7-linux-androideabi i686-linux-android wasm32-unknown-unknown x86_64-apple-ios x86_64-linux-android`
- Install cargo lipo -> `cargo install cargo-lipo`
- Clone the project
- Go to the project folder
- Run packages installation -> `yarn install`

Common preparation is done on this step

#### iOS build preparation

To make iOS build we have been using the `asdf` tool

- Install `asdf` -> `brew install asdf`
- Check is `ruby` installed or not. It should be installed by default. But we need to install the special version of `ruby` through `asdf`
- Install the ruby plugin for `asdf` -> `asdf plugin add ruby`
- Install ruby 2.7.6 -> `asdf install ruby 2.7.6`
- Set global version of `ruby` -> `asdf global ruby 2.7.6`
- Reload the terminal session
- Check the `ruby` version -> `ruby --version`. It should be `2.7.6`
- Go to the mobile project folder `yoroi/apps/wallet-mobile`
- Run `gem install cocoapods`
- Install watchman -> `brew install watchman`
- Install pods -> `npx pod-install`

#### Android build preparation

To be continued...

### Building

Before building the app, please don't forget to insure that all preparation steps are full field.

#### iOS developer version

To build the developer's version of the app run the command `yarn start --reset-cache --verbose`

## Linux(Ubuntu)

To be continued...
