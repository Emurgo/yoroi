import {Portfolio, Transfer} from '@yoroi/types'

/**
 * @summary Returns the total amount of tokens used by other targets
 * @returns BigInt
 */
export function getTotalUsedByOtherTargets({
  targets,
  selectedTargetIndex,
  selectedTokenId,
}: {
  targets: Readonly<Transfer.Targets>
  selectedTargetIndex: number
  selectedTokenId: Portfolio.Token.Id
}) {
  const isNotTheSelectedTarget = (_: Transfer.Target, index: number) =>
    index !== selectedTargetIndex

  return targets
    .filter(isNotTheSelectedTarget)
    .reduce(
      (acc, target) =>
        acc + (target.entry.amounts[selectedTokenId]?.quantity ?? 0n),
      0n,
    )
}
