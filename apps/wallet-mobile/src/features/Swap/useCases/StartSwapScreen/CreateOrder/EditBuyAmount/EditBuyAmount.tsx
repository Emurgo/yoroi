import {getSellAmountByChangingReceive, useSwap} from '@yoroi/swap'
import {getSellQuantityForLimitOrder} from '@yoroi/swap/src/helpers/order'
import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
import * as React from 'react'
import {TextInput} from 'react-native'

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
  const inputRef = React.useRef<TextInput>(null)

  const {createOrder, buyAmountChanged, sellAmountChanged} = useSwap()
  const {isBuyTouched} = useSwapTouched()
  const {tokenId, quantity} = createOrder.amounts.buy
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.format(quantity, tokenInfo.decimals ?? 0))

  React.useEffect(() => {
    if (isBuyTouched && !inputRef?.current?.isFocused()) {
      setInputValue(Quantities.format(quantity, tokenInfo.decimals ?? 0))
    }
  }, [isBuyTouched, quantity, tokenInfo.decimals])

  const recalculateSellValue = (buyQuantity: BalanceQuantity) => {
    if (createOrder.type === 'limit' && createOrder.limitPrice !== undefined) {
      const buyQuantityDenominated = Quantities.denominated(buyQuantity, tokenInfo.decimals ?? 0)
      sellAmountChanged({
        quantity: getSellQuantityForLimitOrder(
          buyQuantityDenominated,
          createOrder.limitPrice,
          sellTokenInfo.decimals ?? 0,
        ),
        tokenId: createOrder.amounts.sell.tokenId,
      })
      return
    }

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
      const [input, quantity] = Quantities.parseFromText(text, decimals ?? 0, numberLocale)
      setInputValue(input)
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
      inputRef={inputRef}
      inputEditable={isBuyTouched}
    />
  )
}
