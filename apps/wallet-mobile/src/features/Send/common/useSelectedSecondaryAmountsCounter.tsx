import {useTransfer} from '@yoroi/transfer'
import {Balance} from '@yoroi/types'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {Amounts} from '../../../yoroi-wallets/utils'

export const useSelectedSecondaryAmountsCounter = (wallet: YoroiWallet) => {
  const {targets} = useTransfer()
  const isSecondaryAmount = isSecondaryAmountFilter(wallet)

  return targets.reduce((acc, target) => {
    return Amounts.toArray(target.entry.amounts).filter(isSecondaryAmount).length + acc
  }, 0)
}

const isSecondaryAmountFilter =
  (wallet: YoroiWallet) =>
  ({tokenId}: Balance.Amount) =>
    tokenId !== wallet.primaryTokenInfo.id
