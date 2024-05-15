import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../WalletManager/context/SelectedWalletContext'
import {ShowSubmittedTxScreen} from './ShowSubmittedTxScreen'

storiesOf('Submitted Tx Screen', module)
  .addDecorator((getStory) => (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <View style={{...StyleSheet.absoluteFillObject}}>{getStory()}</View>
      </SwapProvider>
    </SelectedWalletProvider>
  ))
  .add('initial', () => {
    return <ShowSubmittedTxScreen />
  })
