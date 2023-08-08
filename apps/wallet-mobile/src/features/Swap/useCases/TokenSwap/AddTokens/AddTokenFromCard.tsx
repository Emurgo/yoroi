import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {selectFtOrThrow} from '../../../../../yoroi-wallets/cardano/utils'
import {useBalance, useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {SwapCard} from '../../../SwapCard/SwapCard'

export const AddTokenFromCard = () => {
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {amounts} = useSwap()

  const tokenInfo = useTokenInfo({wallet, tokenId: amounts?.sell.tokenId}, {select: selectFtOrThrow})
  const strings = useStrings()

  const [quantity, setQuantity] = React.useState<Balance.Quantity>('0')
  const [inputValue, setInputValue] = React.useState<string>()
  const initialBalanceAvailable = useBalance({wallet, tokenId: tokenInfo.id})

  const canSpend = Number(quantity) > 0 && Number(quantity) < Number(initialBalanceAvailable)

  const onChangeQuantity = (text: string) => {
    try {
      const quantity = asQuantity(text.length > 0 ? text : '0')
      setInputValue(text)
      setQuantity(Quantities.integer(quantity, tokenInfo.decimals ?? 0))
    } catch (error) {
      Logger.error('SwapAmountScreen::onChangeQuantity', error)
    }
  }

  return (
    <SwapCard
      label={strings.swapFrom}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId: amounts?.sell.tokenId, quantity: initialBalanceAvailable}}
      wallet={wallet}
      hasError={Number(quantity) > 0 ? !canSpend : false}
      navigateTo={navigate.selectedSwapFromTokens}
    />
  )
}
