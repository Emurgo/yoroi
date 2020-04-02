Storybook docs
==============

Storybook allows to easily display components and screens without having
to setup a wallet and navigate to the actual screens we want to check out.

Currently it's only supported on the device/emulator, which means that for running the stories, you still need to be able to build the whole app. Unfortunately, we can't generate a static website to display the stories at the moment; tough this may change in the future.

# Requirements

Stories are embeded in Yoroi Mobile builds, both iOS and Android, so make sure you have everthing set and that you are able to build and run the project.

# Setup and Display Stories

```sh
yarn prestorybook
```

After running this command a new file containing all the paths to the stories is generated in `storybook/storyLoader.js`.

Stories are displayed in debug mode, so you need to configure your `.env` variables accordingly (contact the devs for more details).

## Android
Run the app using the `debug` build variant, for instance:

```sh
react-native run-android --variant=mainDebug
```

## iOS
Build the `emurgo-staging` Scheme.
