# Storybook docs

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

# Implementation Details

By default, stories have access to the initial state of redux's Store (ie. the global State seen by the app at start up). Also, any action that does not require a network call or an opened wallet should work by default (this means, that for instance, changing the language through the `LanguagePickerScreen` story will actually change the app's language---unless this action is mocked up (as explained below).
Other actions, like those related to delegation or sending a tx, or anything that require an active wallet, won't be available.

## Providing mock-up props to Redux's `connect()`

Stories don't have access to any Store prop that is updated from a network call; they only see the initial State. Thus, we may need to mock some props for Screens and components that need network data or any Store data that is initialized as `null`. For simple components that don't access the Store this is straightforward (we just pass the prop directly like `<Component propX={something}>`.)

For Screen/components using redux's `connect` we need to do a small refactoring and add a third argument to `connect()`, which is the [`mergeProps`](https://react-redux.js.org/api/connect#mergeprops-stateprops-dispatchprops-ownprops-object) function. It can be implemented as follows:

```
(state, dispatchProps, ownProps) => ({
  ...state,
  ...dispatchProps,
  ...ownProps,
}),
```

This way, the props passed to the component when instantiated in JSX will override those derived from the Store.

You can see an example of this approach for mocking Store data in `src/components/Delegation/DelegationSummary.stories.js` and `src/components/Delegation/DelegationSummary.js`.

Note that this changes the default behaviour of `mergeProps`, which is to return `{ ...ownProps, ...stateProps, ...dispatchProps }`.
