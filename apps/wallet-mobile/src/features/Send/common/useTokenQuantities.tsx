import {useTransfer} from '@yoroi/transfer'
import {Transfer} from '@yoroi/types'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalance, useLockedAmount} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'

export const useTokenQuantities = (tokenId: string) => {
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useTransfer()
  const initialQuantity = Amounts.getAmount(targets[selectedTargetIndex].entry.amounts, tokenId).quantity

  const balance = useBalance({wallet, tokenId})
  const used = getTotalUsedByOtherTargets({targets, selectedTokenId: tokenId, selectedTargetIndex})
  const available = Quantities.diff(balance, used)

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = useLockedAmount({wallet})
  const locked = isPrimary ? primaryLocked : Quantities.zero

  const spendable = Quantities.diff(available, locked)

  return {
    balance,
    used,
    available,
    initialQuantity,
    locked,
    spendable,
  }
}

/**
 * @summary Returns the total amount of tokens used by other targets
 * @returns Quantity
 */
const getTotalUsedByOtherTargets = ({
  targets,
  selectedTargetIndex,
  selectedTokenId,
}: {
  targets: Transfer.Targets
  selectedTargetIndex: number
  selectedTokenId: string
}) => {
  const isNotTheSelectedTarget = (_target: Transfer.Target, index: number) => index !== selectedTargetIndex
  return targets.filter(isNotTheSelectedTarget).reduce((acc, target) => {
    const quantity = Amounts.getAmount(target.entry.amounts, selectedTokenId).quantity
    return Quantities.sum([acc, quantity])
  }, Quantities.zero)
}
