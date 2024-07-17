import {useSwap} from '@yoroi/swap'
import * as React from 'react'

import {usePortfolioBalances} from '../../../../../Portfolio/common/hooks/usePortfolioBalances'
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

  const amount = usePortfolioBalances({wallet}).records.get(orderData.amounts.sell?.info.id ?? 'unknown.')

  return (
    <AmountCard
      label={strings.swapFrom}
      onChange={onChangeSellQuantity}
      value={sellDisplayValue}
      amount={amount}
      wallet={wallet}
      navigateTo={navigate.selectSellToken}
      touched={isSellTouched}
      inputRef={sellInputRef}
      error={error}
      testId="swap:sell-edit"
    />
  )
}
