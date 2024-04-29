import {Portfolio, Transfer} from '@yoroi/types'
import {targetGetTokenTotalUsedByOthers} from './target-get-token-total-used-by-others'
import {isPrimaryToken} from '@yoroi/portfolio'

export function targetGetTokenBalanceBreakdown({
  balances,
  selectedTokenId,
  primaryBreakdown,
  targets,
  selectedTargetIndex,
}: {
  targets: Readonly<Transfer.Targets>
  balances: Portfolio.Token.Balances['records']
  primaryBreakdown: Readonly<Portfolio.PrimaryBreakdown>
  selectedTokenId: Portfolio.Token.Id
  selectedTargetIndex: number
}) {
  const target = targets[selectedTargetIndex]

  let balance = 0n
  let available = 0n
  let locked = 0n
  let spendable = 0n
  let initialQuantity = 0n
  let used = 0n

  if (target) {
    initialQuantity = target.entry.amounts[selectedTokenId]?.quantity ?? 0n

    used = targetGetTokenTotalUsedByOthers({
      targets,
      selectedTokenId,
      selectedTargetIndex,
    })

    const amount = balances.get(selectedTokenId)

    if (amount) {
      balance = amount.quantity
      available = balance - used
      locked = isPrimaryToken(amount.info)
        ? primaryBreakdown.lockedAsStorageCost
        : 0n
      spendable = available - locked
    }
  }

  return {
    balance,
    used,
    available,
    initialQuantity,
    locked,
    spendable,
  }
}
