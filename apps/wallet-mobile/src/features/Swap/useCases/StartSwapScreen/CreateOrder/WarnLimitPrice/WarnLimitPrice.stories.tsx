import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

import {useModal} from '../../../../../../components'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {mocks} from '../../../../common/mocks'
import {useStrings} from '../../../../common/strings'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {WarnLimitPrice} from './WarnLimitPrice'

storiesOf('Swap Warn Limit Price', module).add('Initial', () => <Initial />)

const Initial = () => {
  const {openModal, content, closeModal} = useModal()
  const strings = useStrings()
  const {orderData} = mocks.confirmTx
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <View style={{...StyleSheet.absoluteFillObject}}>
            <Button
              title="Open Modal"
              onPress={() => {
                content !== undefined
                  ? closeModal()
                  : openModal(
                      strings.limitPriceWarningTitle,
                      <SelectedWalletProvider wallet={walletMocks.wallet}>
                        <WarnLimitPrice
                          orderData={orderData}
                          onConfirm={() => {
                            closeModal()
                            action('onConfirm')
                          }}
                        />
                      </SelectedWalletProvider>,
                    )
              }}
            />
          </View>
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
