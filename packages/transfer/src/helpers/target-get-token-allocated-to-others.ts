import {Portfolio, Transfer} from '@yoroi/types'

/**
 * @summary Returns the total amount of tokens used by other targets
 * @returns BigInt
 */
export function targetGetTokenAllocatedToOthers({
  targets,
  targetIndex,
  tokenId,
}: {
  targets: Readonly<Transfer.Targets>
  targetIndex: number
  tokenId: Portfolio.Token.Id
}) {
  const isNotTheSelectedTarget = (_: Transfer.Target, index: number) =>
    index !== targetIndex

  return targets
    .filter(isNotTheSelectedTarget)
    .reduce(
      (acc, target) => acc + (target.entry.amounts[tokenId]?.quantity ?? 0n),
      0n,
    )
}
