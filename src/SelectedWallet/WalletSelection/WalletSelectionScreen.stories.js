import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletSelectionScreen} from './WalletSelectionScreen'

storiesOf('WalletSelectionScreen', module).add('Default', ({navigation}) => (
  <WalletSelectionScreen navigation={navigation} />
))
