import {useTransfer} from '@yoroi/transfer'
import {Portfolio, Transfer} from '@yoroi/types'
import {getTotalUsedByOtherTargets} from './get-total-used-by-other-targets'

export const useTokenQuantities = ({
  balances,
  selectedTokenId,
  primaryBreakdown,
  targets,
  selectedTargetIndex,
}: {
  targets: Readonly<Transfer.Targets>
  id: Portfolio.Token.Id
  balances: ReadonlyArray<Portfolio.Token.Amount>
  primaryBreakdown: Readonly<Portfolio.PrimaryBreakdown>
  selectedTargetIndex: number
}) => {
  const initialQuantity =
    targets[selectedTargetIndex]?.entry.amounts[selectedTokenId]?.quantity ?? 0n

  const used = getTotalUsedByOtherTargets({
    targets,
    selectedTokenId,
    selectedTargetIndex,
  })

  const balance = balances.find((amount) => amount.info.id === selectedTokenId)
  const available = Quantities.diff(balance, used)

  const isPrimary = tokenId === wallet.primaryTokenInfo.id
  const primaryLocked = asQuantity(
    wallet.primaryBreakdown.lockedAsStorageCost.toString(),
  )
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

export function getBalanceTransferBreakdown() {}
