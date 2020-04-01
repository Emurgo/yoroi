// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import WalletSelectionScreen from './WalletSelectionScreen'

storiesOf('WalletSelectionScreen', module)
  .add('Default', ({navigation}) => (
    <WalletSelectionScreen navigation={navigation} />
  ))
