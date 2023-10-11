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

export const EditSellAmount = ({error}: {error: string}) => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
  const inputRef = React.useRef<TextInput>(null)

  const {orderData, sellQuantityChanged} = useSwap()
  const {isSellTouched} = useSwapTouched()

  const {tokenId, quantity} = orderData.amounts.sell

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.format(quantity, tokenInfo.decimals ?? 0))

  React.useEffect(() => {
    if (isSellTouched && !inputRef?.current?.isFocused()) {
      setInputValue(Quantities.format(quantity, tokenInfo.decimals ?? 0))
    }
  }, [isSellTouched, quantity, tokenInfo.decimals])

  const onChangeQuantity = (text: string) => {
    try {
      const [input, quantity] = Quantities.parseFromText(text, decimals ?? 0, numberLocale)
      setInputValue(text === '' ? text : input)
      sellQuantityChanged(quantity)
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
      navigateTo={navigate.selectSellToken}
      touched={isSellTouched}
      inputRef={inputRef}
      error={error}
      // inputEditable={orderData.selectedPoolCalculation?.pool !== undefined}
    />
  )
}
