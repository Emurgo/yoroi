// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RestoreWalletScreen from './RestoreWalletScreen'
import {NETWORK_REGISTRY} from '../../../config/types'

storiesOf('RestoreWalletScreen', module).add('Default', ({navigation}) => {
  navigation.getParam = (param) => {
    if (param === 'networkId') return NETWORK_REGISTRY.JORMUNGANDR
    return ''
  }
  return <RestoreWalletScreen navigation={navigation} />
})
