# Development
TODO: add instructions here

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
import {View, Text} from 'react-native'

// our code
import CustomText from '../../components/CustomText'
import Screen from '../../components/Screen'
import AdaIcon from '../../assets/AdaIcon'
import {confirmationsToAssuranceLevel, printAda} from '../../helpers/utils'

// styles
import styles from './TxDetails.style'
import {COLORS} from '../../styles/config'

// types
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {TransactionType} from '../../types/HistoryTransaction'
```