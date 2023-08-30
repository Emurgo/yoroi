import {getReceiveAmountbyChangingSell, useSwap} from '@yoroi/swap'
import * as React from 'react'

import {useLanguage} from '../../../../../../i18n'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useBalance, useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../../yoroi-wallets/logging'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../TouchedContext'

export const EditSellAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()

  const {createOrder, sellAmountChanged, buyAmountChanged} = useSwap()
  const {isSellTouched} = useSwapTouched()

  const {tokenId, quantity} = createOrder.amounts.sell

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.denominated(quantity, tokenInfo.decimals ?? 0))

  const hasBalance = !Quantities.isGreaterThan(quantity, balance)
  const showError = !Quantities.isZero(quantity) && !hasBalance

  const recalculateBuyValue = (sellQuantity) => {
    const {buy} = getReceiveAmountbyChangingSell(createOrder?.selectedPool, {
      quantity: sellQuantity,
      tokenId: tokenId,
    })

    buyAmountChanged({
      quantity: buy?.quantity,
      tokenId: createOrder.amounts.buy.tokenId,
    })
  }

  const onChangeQuantity = (text: string) => {
    try {
      const [input, quantity] = Quantities.parseFromText(text, decimals ?? 0, numberLocale)
      setInputValue(input)
      sellAmountChanged({tokenId, quantity})
      recalculateBuyValue(quantity)
    } catch (error) {
      Logger.error('SwapAmountScreen::onChangeQuantity', error)
    }
  }

  return (
    <AmountCard
      label={strings.swapFrom}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      hasError={showError}
      navigateTo={navigate.selectSellToken}
      touched={isSellTouched}
    />
  )
}
