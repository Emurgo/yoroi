import {useSelectedWallet} from '../../SelectedWallet'
import {useBalance, useLockedAmount} from '../../yoroi-wallets/hooks'
import {Quantity, TokenId} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {useSend, YoroiTarget} from './SendContext'

export const useTokenQuantities = (tokenId: TokenId) => {
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useSend()
  const initialQuantity = targets[selectedTargetIndex].entry.amounts[tokenId] ?? ('0' as Quantity)

  const balance = useBalance({wallet, tokenId})
  const used = getTotalUsedByOtherTargets({targets, selectedTokenId: tokenId, selectedTargetIndex})
  const available = Quantities.diff(balance, used)

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = useLockedAmount({wallet})
  const locked = isPrimary ? primaryLocked : ('0' as Quantity)

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
  targets: Array<YoroiTarget>
  selectedTargetIndex: number
  selectedTokenId: string
}) => {
  return targets.reduce((acc, target, index) => {
    if (index === selectedTargetIndex) return acc
    const quantity = target.entry.amounts[selectedTokenId] ?? ('0' as Quantity)
    return Quantities.sum([acc, quantity])
  }, '0' as Quantity)
}
