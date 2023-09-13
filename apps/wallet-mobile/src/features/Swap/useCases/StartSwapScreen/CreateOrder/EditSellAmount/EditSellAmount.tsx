import {getReceiveAmountbyChangingSell, useSwap} from '@yoroi/swap'
import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
import * as React from 'react'
import {TextInput} from 'react-native'

import {useLanguage} from '../../../../../../i18n'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useBalance, useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../../yoroi-wallets/logging'
import {Quantities} from '../../../../../../yoroi-wallets/utils'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {getBuyQuantityForLimitOrder} from '../../../../common/helpers'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const EditSellAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const inputRef = React.useRef<TextInput>(null)

  const {createOrder, sellAmountChanged, buyAmountChanged} = useSwap()
  const {isSellTouched} = useSwapTouched()

  const {tokenId, quantity} = createOrder.amounts.sell

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const buyTokenInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.format(quantity, tokenInfo.decimals ?? 0))

  React.useEffect(() => {
    if (isSellTouched && !inputRef?.current?.isFocused()) {
      setInputValue(Quantities.format(quantity, tokenInfo.decimals ?? 0))
    }
  }, [isSellTouched, quantity, tokenInfo.decimals])

  const hasBalance = !Quantities.isGreaterThan(quantity, balance)
  const showError = !Quantities.isZero(quantity) && !hasBalance

  const recalculateBuyValue = (sellQuantity: BalanceQuantity) => {
    if (createOrder.type === 'limit' && createOrder.limitPrice !== undefined) {
      const sellQuantityDenominated = Quantities.denominated(sellQuantity, tokenInfo.decimals ?? 0)
      buyAmountChanged({
        quantity: getBuyQuantityForLimitOrder(
          sellQuantityDenominated,
          createOrder.limitPrice,
          buyTokenInfo.decimals ?? 0,
        ),
        tokenId: createOrder.amounts.buy.tokenId,
      })
      return
    }

    const {buy} = getReceiveAmountbyChangingSell(createOrder?.selectedPool, {
      quantity: sellQuantity,
      tokenId: tokenId,
    })

    buyAmountChanged({
      quantity: buy?.quantity,
      tokenId: createOrder.amounts.buy.tokenId,
    })
  }

  React.useEffect(() => {
    setTimeout(() => recalculateBuyValue(quantity), 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenInfo?.id])

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
      inputRef={inputRef}
      inputEditable={isSellTouched}
    />
  )
}
