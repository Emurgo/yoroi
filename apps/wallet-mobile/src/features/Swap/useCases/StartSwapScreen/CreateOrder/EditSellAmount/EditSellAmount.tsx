import {useSwap} from '@yoroi/swap'
import * as React from 'react'
import {TextInput} from 'react-native'

import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useBalance} from '../../../../../../yoroi-wallets/hooks'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

type Props = {
  value: string
  onChange: (text: string) => void
  inputRef: React.RefObject<TextInput>
  error?: string
}

export const EditSellAmount = ({value, onChange, inputRef, error = ''}: Props) => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()

  const {orderData} = useSwap()
  const {isSellTouched} = useSwapTouched()

  const {tokenId} = orderData.amounts.sell
  const balance = useBalance({wallet, tokenId})

  return (
    <AmountCard
      label={strings.swapFrom}
      onChange={onChange}
      value={value}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      navigateTo={navigate.selectSellToken}
      touched={isSellTouched}
      inputRef={inputRef}
      error={error}
      // inputEditable={orderData.selectedPoolCalculation?.pool !== undefined}
    />
  )
}
