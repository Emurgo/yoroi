import {useSwap} from '@yoroi/swap'
import React, {useEffect} from 'react'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useBalance, useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {AmountCard} from '../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'

type EditSellAmountProps = {
  inputValue: string
  setInputValue: (val: string) => void
}

export const EditSellAmount = ({inputValue, setInputValue}: EditSellAmountProps) => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()

  const {createOrder, sellAmountChanged} = useSwap()
  const {tokenId, quantity} = createOrder.amounts.sell

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const hasBalance = Quantities.isGreaterThan(balance, quantity)
  const showError = Number(inputValue) > 0 && !Quantities.isZero(quantity) && !hasBalance

  const onChangeQuantity = (text: string) => {
    try {
      setInputValue(text)

      const inputQuantity = asQuantity(text.length > 0 ? text : '0')
      const quantity = Quantities.integer(inputQuantity, decimals ?? 0)
      sellAmountChanged({tokenId, quantity})
    } catch (error) {
      Logger.error('SwapAmountScreen::onChangeQuantity', error)
    }
  }

  useEffect(() => {
    setInputValue('')
  }, [setInputValue, tokenId])

  return (
    <AmountCard
      label={strings.swapFrom}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId, quantity: balance}}
      wallet={wallet}
      hasError={showError}
      navigateTo={navigate.selectedSwapFromTokens}
    />
  )
}
