# Development

## Installation

### Both platforms

```
# install rustup
curl https://sh.rustup.rs -sSf | sh

# use nightly version
rustup toolchain install nightly
rustup install nightly-2018-06-05
rustup target add wasm32-unknown-unknown --toolchain nightly
```

### ios

```
node_modules/react-native/scripts/ios-install-third-party.sh
node_modules/react-native/third-party/glog-0.3.5/configure
```

### android

```
# install android
follow https://facebook.github.io/react-native/docs/getting-started.html (tab Building Projects with Native Code)
```

### First time

1. `yarn install`
2. `./build_cardano_rust.sh`

### Every time

1. `yarn haul start --platform android` - this will run RN packager, let it running
2. `react-native run-android`

- here it will be possible that app will be crashing, if that is the case, turn js debugging ON
  and also disable `Use JS Deltas` in RN dev settings on phone

3. After the step 3. is done you should see in terminal how haul is progressing (%) if it will hang
   for a while on the same percentage do `rm -r node_modules` and `yarn install` and then go to the step 1.

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
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
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
