import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React, {useEffect} from 'react'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Logger} from '../../../../../yoroi-wallets/logging'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {SwapCard} from '../../../SwapCard/SwapCard'

// Everytime swapTo input value is changing - need to call getSellAmountByChangingReceive helper function and recalculate the sell amount basend on the new buy input
// getSellAmountByChangingReceive is taking the buy balance and the pool

// For the values below not sure of some values from where to take them

// provider:
// | 'minswap'
// | 'sundaeswap'
// | 'wingriders'
// | 'muesliswap_v1'
// | 'muesliswap_v2'
// | 'muesliswap_v3'
// fee: BalanceAmount
// tokenA: BalanceAmount
// tokenB: BalanceAmount
// price: number // float, current price in tokenA / tokenB according to the pool, NOT SUITABLE for price calculations, just for display purposes, i.e. 0.9097362621640215.
// batcherFee: BalanceAmount
// deposit: BalanceAmount // amount of deposit / minUTxO required by protocol, returned to user, in lovelace.
// // utxo: string // txhash#txindex of latest transaction involving this pool.
// poolId: string // identifier of the pool across platforms.
// lastUpdate: string // latest update of this pool in UTC, i.e. 2023-05-23 06:13:26.
// lpToken: BalanceAmount

export const AddTokenToSellInput = () => {
  const navigate = useNavigateTo()
  const wallet = useSelectedWallet()
  const {createOrder, toAmountChanged} = useSwap()

  const tokenInfo = useTokenInfo({wallet, tokenId: createOrder?.amounts?.buy?.tokenId ?? 'noTokenSelected'})
  const strings = useStrings()

  useEffect(() => {
    toAmountChanged({tokenId: 'noTokenSelected', quantity: createOrder?.amounts?.buy?.quantity ?? '0'})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [quantity, setQuantity] = React.useState<Balance.Quantity>('0')
  const [inputValue, setInputValue] = React.useState<string>()

  const canSpend = Number(quantity) > 0 && Number(quantity) < Number(createOrder?.amounts?.buy?.quantity)

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
      label={strings.swapTo}
      onChange={onChangeQuantity}
      value={inputValue}
      amount={{tokenId: createOrder?.amounts?.buy?.tokenId, quantity: createOrder?.amounts?.buy?.quantity}}
      wallet={wallet}
      hasError={Number(quantity) > 0 ? !canSpend : false}
      navigateTo={navigate.selectedSwapToTokens}
    />
  )
}
