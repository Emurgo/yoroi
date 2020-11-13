// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import SaveReadOnlyWalletScreen from './SaveReadOnlyWalletScreen'

storiesOf('SaveReadOnlyWalletScreen', module).add('Default', ({navigation}) => (
  <SaveReadOnlyWalletScreen
    navigation={navigation}
    route={{
      params: {
        publicKeyHex: '0x1',
        path: [2147485500, 2147485463, 2147483648],
      },
    }}
  />
))
