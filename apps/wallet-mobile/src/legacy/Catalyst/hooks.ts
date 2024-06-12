import {useEffect, useState} from 'react'

import {usePortfolioPrimaryBalance} from '../../features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {useSelectedWalletMeta} from '../../features/WalletManager/common/hooks/useSelectedWalletMeta'
import {time} from '../../kernel/constants'
import {catalystConfig} from '../../yoroi-wallets/cardano/constants/common'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {isShelley} from '../../yoroi-wallets/cardano/utils'

export const useCanVote = (wallet: YoroiWallet) => {
  const meta = useSelectedWalletMeta()
  const amount = usePortfolioPrimaryBalance({wallet})
  const sufficientFunds = amount.quantity >= catalystConfig.minAda

  return {
    canVote: !meta.isReadOnly && isShelley(meta.implementation),
    sufficientFunds,
  }
}

export const useCountdown = () => {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (countdown > 0) {
      timeout = setTimeout(() => setCountdown(countdown - 1), time.oneSecond)
    }

    return () => clearTimeout(timeout)
  }, [countdown])

  return countdown
}
