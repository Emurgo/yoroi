// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RestoreWalletScreen from './RestoreWalletScreen'

storiesOf('RestoreWalletScreen', module).add('Default', ({navigation}) => {
  navigation.getParam = (param) => {
    if (param === 'isShelleyWallet') return true
    return ''
  }
  return <RestoreWalletScreen navigation={navigation} />
})
