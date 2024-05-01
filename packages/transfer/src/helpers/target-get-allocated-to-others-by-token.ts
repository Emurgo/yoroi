import {Portfolio, Transfer} from '@yoroi/types'

/**
 * @summary Returns the total amount of tokens used by other targets
 * @returns Map<Portfolio.Token.Id, bigint>
 */
export function targetGetAllocatedToOthersByToken({
  targets,
  targetIndex,
}: {
  targets: Readonly<Transfer.Targets>
  targetIndex: number
}) {
  const isNotTheSelectedTarget = (_: Transfer.Target, index: number) =>
    index !== targetIndex

  const tokenAllocations = new Map<Portfolio.Token.Id, bigint>()

  targets.filter(isNotTheSelectedTarget).forEach((target) => {
    const amounts = target.entry.amounts

    Object.keys(amounts).forEach((untypedTokenId) => {
      const tokenId = untypedTokenId as Portfolio.Token.Id
      const quantity = amounts[tokenId]?.quantity || 0n

      const currentAllocation = tokenAllocations.get(tokenId) ?? 0n
      const newAllocation = currentAllocation + quantity

      tokenAllocations.set(tokenId, newAllocation)
    })
  })

  return tokenAllocations
}
