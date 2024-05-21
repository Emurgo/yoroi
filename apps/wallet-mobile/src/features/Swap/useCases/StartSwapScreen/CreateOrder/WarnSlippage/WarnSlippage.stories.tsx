import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

import {useModal} from '../../../../../../components'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../../WalletManager/context/SelectedWalletContext'
import {useStrings} from '../../../../common/strings'
import {WarnSlippage} from './WarnSlippage'

storiesOf('Swap Warn Slippage', module)
  .addDecorator((getStory) => (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <View style={{...StyleSheet.absoluteFillObject}}>{getStory()}</View>
      </SwapProvider>
    </SelectedWalletProvider>
  ))
  .add('Initial', () => {
    const {openModal, content, closeModal} = useModal()
    const strings = useStrings()

    return (
      <Button
        title="Open Modal"
        onPress={() => {
          content !== undefined
            ? closeModal()
            : openModal(
                strings.slippageWarningTitle,
                <WarnSlippage slippage={10} onConfirm={closeModal} ticker="MILK" />,
              )
        }}
      />
    )
  })
