import {getSellAmountByChangingReceive, useSwap} from '@yoroi/swap'
import * as React from 'react'

import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useBalance, useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../../../yoroi-wallets/utils'
import {AmountCard} from '../../../../common/AmountCard/AmountCard'
import {useNavigateTo} from '../../../../common/navigation'
import {useStrings} from '../../../../common/strings'

export const EditBuyAmount = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()

  const {createOrder, buyAmountChanged} = useSwap()
  const {tokenId, quantity} = createOrder.amounts.buy

  const tokenInfo = useTokenInfo({wallet, tokenId})
  const {decimals} = tokenInfo
  const balance = useBalance({wallet, tokenId})

  const [inputValue, setInputValue] = React.useState<string>(Quantities.denominated(quantity, tokenInfo.decimals ?? 0))

  const {sell} = getSellAmountByChangingReceive(createOrder?.selectedPool, {
    quantity: quantity,
    tokenId: createOrder.amounts.buy.tokenId,
  })

  console.log('[getSellAmountByChangingReceive]', sell)

  // const recalculate = React.useCallback(() => {
  //   sellAmountChanged({quantity: sell.quantity, tokenId: createOrder.amounts.sell.tokenId})
  // }, [createOrder.amounts.sell.tokenId, sell.quantity, sellAmountChanged])

  React.useEffect(() => {
    setInputValue(Quantities.denominated(quantity, tokenInfo.decimals ?? 0))
    // recalculate()
  }, [quantity, tokenInfo.decimals])

  const onChangeQuantity = (text: string) => {
    try {
      setInputValue(text)

      const inputQuantity = asQuantity(text.length > 0 ? text : '0')
      const quantity = Quantities.integer(inputQuantity, decimals ?? 0)
      buyAmountChanged({tokenId, quantity})
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
    />
  )
}
