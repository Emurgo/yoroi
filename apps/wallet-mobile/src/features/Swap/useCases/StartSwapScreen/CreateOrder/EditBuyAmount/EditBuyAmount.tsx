import {getSellAmountByChangingReceive, useSwap} from '@yoroi/swap'
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

export const EditBuyAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()

  const {createOrder, buyAmountChanged, sellAmountChanged} = useSwap()
  const {isBuyTouched} = useSwapTouched()
  const {tokenId, quantity} = createOrder.amounts.buy
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.denominated(quantity, tokenInfo.decimals ?? 0))

  const recalculateSellValue = (buyQuantity) => {
    const {sell} = getSellAmountByChangingReceive(createOrder?.selectedPool, {
      quantity: buyQuantity,
      tokenId: tokenId,
    })
    sellAmountChanged({
      quantity: sell?.quantity,
      tokenId: createOrder.amounts.sell.tokenId,
    })
  }

  const onChangeQuantity = (text: string) => {
    try {
      const [formatted, quantity] = Quantities.formatFromText(text, decimals ?? 0, numberLocale)
      setInputValue(formatted)
      buyAmountChanged({tokenId, quantity})
      recalculateSellValue(quantity)
    } catch (error) {
      Logger.error('SwapAmountScreen::onChangeQuantity', error)
    }
  }

  return (
    <AmountCard
      label={strings.swapTo}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      navigateTo={navigate.selectBuyToken}
      touched={isBuyTouched}
    />
  )
}
