import {useSwap} from '@yoroi/swap'
import * as React from 'react'

import {useBalance} from '../../../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const EditSellAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {orderData} = useSwap()
  const {
    sellQuantity: {isTouched: isSellTouched, displayValue: sellDisplayValue, error},
    onChangeSellQuantity,
    sellInputRef,
  } = useSwapForm()
  const {tokenId} = orderData.amounts.sell
  const balance = useBalance({wallet, tokenId})

  return (
    <AmountCard
      label={strings.swapFrom}
      onChange={onChangeSellQuantity}
      value={sellDisplayValue}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      navigateTo={navigate.selectSellToken}
      touched={isSellTouched}
      inputRef={sellInputRef}
      error={error}
      testId="swap:sell-edit"
    />
  )
}
