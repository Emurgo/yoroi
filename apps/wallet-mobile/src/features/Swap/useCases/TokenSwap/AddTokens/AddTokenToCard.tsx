import {Balance} from '@yoroi/types'
import React, {useEffect} from 'react'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {selectFtOrThrow} from '../../../../../yoroi-wallets/cardano/utils'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {useSwap, useTokenQuantities} from '../../../common/SwapContext'
import {SwapCard} from '../../../SwapCard/SwapCard'

export const AddTokenToCard = () => {
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {selectedTokenToId, tokenToSelectedChanged} = useSwap()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenToId}, {select: selectFtOrThrow})
  const strings = useStrings()

  useEffect(() => {
    tokenToSelectedChanged('noTokenSelected')
  }, [tokenToSelectedChanged, wallet])

  const {spendable} = useTokenQuantities(selectedTokenToId)

  const [quantity, setQuantity] = React.useState<Balance.Quantity>('0')
  const [inputValue, setInputValue] = React.useState<string>()

  const canSpend = Number(quantity) > 0 && Number(quantity) < Number(spendable)

  const onChangeQuantity = (text: string) => {
    try {
      const quantity = asQuantity(text.length > 0 ? text : '0')
      setInputValue(text)
      setQuantity(Quantities.integer(quantity, tokenInfo.decimals ?? 0))
    } catch (error) {
      Logger.error('EditAmountScreen::onChangeQuantity', error)
    }
  }

  return (
    <SwapCard
      label={strings.swapTo}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId: selectedTokenToId, quantity: spendable}}
      wallet={wallet}
      hasError={Number(quantity) > 0 ? !canSpend : false}
      navigateTo={navigate.selectedSwapToTokens}
    />
  )
}
