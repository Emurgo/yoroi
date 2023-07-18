import {Balance} from '@yoroi/types'
import React from 'react'

import {useTokenInfo} from '../../../../../src/yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {selectFtOrThrow} from '../../../../yoroi-wallets/cardano/utils'
import {Logger} from '../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../common/navigation'
import {useSwap, useTokenQuantities} from '../../common/SwapContext'
import {SwapCard} from '../../SwapCard/SwapCard'

export const AddTokenFromCard = () => {
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {selectedTokenFromId} = useSwap()
  const tokenInfo = useTokenInfo({wallet, tokenId: selectedTokenFromId}, {select: selectFtOrThrow})

  const {spendable} = useTokenQuantities(selectedTokenFromId)

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
      label="Swap from"
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId: selectedTokenFromId, quantity: spendable}}
      wallet={wallet}
      hasError={Number(quantity) > 0 ? !canSpend : false}
      navigateTo={navigate.selectedSwapFromTokens}
    />
  )
}
