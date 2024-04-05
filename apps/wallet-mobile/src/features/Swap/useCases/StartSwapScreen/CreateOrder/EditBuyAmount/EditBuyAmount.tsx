import {useSwap} from '@yoroi/swap'
import * as React from 'react'

import {useBalance} from '../../../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../../Wallet/common/Context'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const EditBuyAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {orderData} = useSwap()
  const {
    buyQuantity: {isTouched: isBuyTouched, displayValue: buyDisplayValue, error: buyError},
    onChangeBuyQuantity,
    buyInputRef,
  } = useSwapForm()
  const {tokenId} = orderData.amounts.buy
  const balance = useBalance({wallet, tokenId})

  return (
    <AmountCard
      label={strings.swapTo}
      onChange={onChangeBuyQuantity}
      value={buyDisplayValue}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      navigateTo={navigate.selectBuyToken}
      touched={isBuyTouched}
      inputRef={buyInputRef}
      error={buyError}
      testId="swap:buy-edit"
    />
  )
}
