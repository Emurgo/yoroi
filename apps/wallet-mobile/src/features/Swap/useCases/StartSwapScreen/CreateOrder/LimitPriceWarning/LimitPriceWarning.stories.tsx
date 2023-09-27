import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {Button, View} from 'react-native'

import {BottomSheetRef} from '../../../../../../components'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../../yoroi-wallets/mocks'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {LimitPriceWarning} from './LimitPriceWarning'

storiesOf('Swap Limit Price Warning', module).add('Initial', () => <Initial />)

const Initial = () => {
  const limitPriceWarningRef = React.useRef<null | BottomSheetRef>(null)
  const closeLimitPriceWarning = () => {
    limitPriceWarningRef.current?.closeBottomSheet()
  }
  const openLimitPriceWarning = () => {
    limitPriceWarningRef.current?.openBottomSheet()
  }

  const handleClick = () => {
    if (limitPriceWarningRef.current?.isOpen) closeLimitPriceWarning()
    else openLimitPriceWarning()
  }

  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <Button title="Click" onPress={handleClick} />

          <SwapFormProvider>
            <LimitPriceWarning
              ref={limitPriceWarningRef}
              closeLimitPriceWarning={closeLimitPriceWarning}
              onSubmit={() => action('onSubmit')}
            />
          </SwapFormProvider>
        </View>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
