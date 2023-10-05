import {useSwap} from '@yoroi/swap'
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
import {useSwapTouched} from '../../../../common/SwapFormProvider'

export const EditBuyAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const inputRef = React.useRef<TextInput>(null)

  const {orderData, buyQuantityChanged} = useSwap()
  const {isBuyTouched} = useSwapTouched()
  const pool = orderData.calculatedPool?.pool
  const {tokenId, quantity} = orderData.amounts.buy
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.format(quantity, tokenInfo.decimals ?? 0))

  React.useEffect(() => {
    if (isBuyTouched && !inputRef?.current?.isFocused()) {
      setInputValue(Quantities.format(quantity, tokenInfo.decimals ?? 0))
    }
  }, [isBuyTouched, quantity, tokenInfo.decimals])

  const poolSupply = tokenId === pool?.tokenA.tokenId ? pool?.tokenA.quantity : pool?.tokenB.quantity
  const hasSupply = !Quantities.isGreaterThan(quantity, poolSupply ?? Quantities.zero)
  const showError = (!Quantities.isZero(quantity) && !hasSupply) || (isBuyTouched && pool === undefined)

  const onChangeQuantity = (text: string) => {
    try {
      const [input, quantity] = Quantities.parseFromText(text, decimals ?? 0, numberLocale)
      setInputValue(text === '' ? text : input)
      buyQuantityChanged(quantity)
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
      hasError={showError}
      navigateTo={navigate.selectBuyToken}
      touched={isBuyTouched}
      inputRef={inputRef}
      inputEditable={pool !== undefined}
    />
  )
}
