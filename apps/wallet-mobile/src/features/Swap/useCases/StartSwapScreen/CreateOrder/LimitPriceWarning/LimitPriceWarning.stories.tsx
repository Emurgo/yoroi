import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

import {useModal} from '../../../../../../components'
import {useStrings} from '../../../../../../features/Swap/common/strings'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {LimitPriceWarning} from './LimitPriceWarning'

storiesOf('LimitPriceWarning', module).add('Initial', () => <Initial />)

const Initial = () => {
  const {openModal, content, closeModal} = useModal()
  const strings = useStrings()
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <View style={{...StyleSheet.absoluteFillObject}}>
            <Button
              title="Open Modal"
              onPress={() => {
                content !== undefined ? closeModal() : openModal(strings.limitPriceWarningTitle, <LimitPriceWarning />)
              }}
            />
          </View>
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
