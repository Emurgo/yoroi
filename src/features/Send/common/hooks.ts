import {useSelectedWallet} from '../../../SelectedWallet'
import {useBalance, useLockedAmount} from '../../../yoroi-wallets/hooks'
import {TokenId, YoroiTarget} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'
import {useSend} from './SendContext'

export const useTokenQuantities = (tokenId: TokenId) => {
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useSend()
  const initialQuantity = targets[selectedTargetIndex].entry.amounts[tokenId] ?? Quantities.zero()

  const balance = useBalance({wallet, tokenId})
  const used = getTotalUsedByOtherTargets({targets, selectedTokenId: tokenId, selectedTargetIndex})
  const available = Quantities.diff(balance, used)

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = useLockedAmount({wallet})
  const locked = isPrimary ? primaryLocked : Quantities.zero()

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
  const isNotTheSelectedTarget = (_, index) => index !== selectedTargetIndex
  return targets.filter(isNotTheSelectedTarget).reduce((acc, target) => {
    const quantity = target.entry.amounts[selectedTokenId] ?? Quantities.zero()
    return Quantities.sum([acc, quantity])
  }, Quantities.zero())
}
