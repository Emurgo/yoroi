import {createUnknownTokenInfo} from '@yoroi/portfolio'
import {useSwap} from '@yoroi/swap'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'

import {usePortfolioBalances} from '../../../../../Portfolio/common/hooks/usePortfolioBalances'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'

export const EditBuyAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const {wallet} = useSelectedWallet()
  const {orderData} = useSwap()
  const {
    buyQuantity: {isTouched: isBuyTouched, displayValue: buyDisplayValue, error: buyError},
    onChangeBuyQuantity,
    buyInputRef,
  } = useSwapForm()

  const quantity =
    usePortfolioBalances({wallet}).records.get(orderData.amounts.buy?.info.id ?? 'unknown.')?.quantity ?? 0n
  const amount: Portfolio.Token.Amount = {
    quantity,
    info: orderData.amounts.buy?.info ?? createUnknownTokenInfo({id: 'unknown.', name: ''}),
  }

  return (
    <AmountCard
      label={strings.swapTo}
      onChange={onChangeBuyQuantity}
      value={buyDisplayValue}
      amount={amount}
      wallet={wallet}
      navigateTo={navigate.selectBuyToken}
      touched={isBuyTouched}
      inputRef={buyInputRef}
      error={buyError}
      testId="swap:buy-edit"
    />
  )
}
