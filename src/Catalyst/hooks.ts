import {useEffect, useState} from 'react'

import {useBalances} from '../yoroi-wallets'
import {CATALYST, isHaskellShelley, YoroiWallet} from '../yoroi-wallets'
import {Quantity} from '../yoroi-wallets/types'
import {Amounts, Quantities} from '../yoroi-wallets/utils'

export const useCanVote = (wallet: YoroiWallet) => {
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, '')
  const sufficientFunds = Quantities.isGreaterThan(primaryAmount.quantity, CATALYST.MIN_ADA.toString() as Quantity)

  return {
    canVote: !wallet.isReadOnly && isHaskellShelley(wallet.walletImplementationId),
    sufficientFunds,
  }
}

export const useCountdown = () => {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (countdown > 0) {
      timeout = setTimeout(() => setCountdown(countdown - 1), 1000)
    }

    return () => clearTimeout(timeout)
  }, [countdown])

  return countdown
}
