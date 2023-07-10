# Description

The instruction is only suitable for MacOS because iOS apps can be build only on MacOS.

## Preparation

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

## Building

Before building the app, please don't forget to ensure that all preparation steps are full field.

To run the developer's debug version you need to run the command `yarn start` in one terminal and open the second terminal and run the command `yarn run:ios:dev:debug`

For other build versions please check [the package.json file](./package.json)
