import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {Button, StyleSheet, View} from 'react-native'

import {useModal} from '../../../../../../components'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../../WalletManager/Context/SelectedWalletContext'
import {useStrings} from '../../../../common/strings'
import {WarnPriceImpact} from './WarnPriceImpact'

storiesOf('Swap Warn Price Impact', module)
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
                strings.warning,
                <WarnPriceImpact
                  onContinue={() => {
                    closeModal()
                    action('onContinue')
                  }}
                  priceImpactRisk="high"
                />,
              )
        }}
      />
    )
  })
