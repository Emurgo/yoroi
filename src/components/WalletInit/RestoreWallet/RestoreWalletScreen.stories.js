// @flow
import React from 'react'

import {storiesOf} from '@storybook/react-native'

import RestoreWalletScreen from './RestoreWalletScreen'
import {NETWORK_REGISTRY} from '../../../config/types'

storiesOf('RestoreWalletScreen', module).add('Default', ({route}) => {
  route.params = {
    networkId: NETWORK_REGISTRY.JORMUNGANDR,
  }
  return <RestoreWalletScreen route={route} />
})
