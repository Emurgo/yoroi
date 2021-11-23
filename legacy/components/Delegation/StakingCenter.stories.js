// @flow

import {storiesOf} from '@storybook/react-native'
import React from 'react'

// $FlowExpectedError
import {SelectedWalletProvider} from '../../../src/SelectedWallet'
import StakingCenter from './StakingCenter'

const wallet = {
  networkId: 1,
  walletImplementationId: 'haskell-shelley',
}

storiesOf('StakingCenter', module).add('with 100 ADA to delegate', ({route, navigation}) => {
  route.params = {
    poolList: ['af22f95915a19cd57adb14c558dcc4a175f60c6193dc23b8bd2d8beb'],
  }

  return (
    <SelectedWalletProvider wallet={wallet}>
      <StakingCenter navigation={navigation} route={route} />
    </SelectedWalletProvider>
  )
})
