import {Portfolio, Transfer} from '@yoroi/types'
import {freeze} from 'immer'

import {TransferAllocatedToOtherTargets} from '../types'
import {targetGetAllocatedToOthersByToken} from './target-get-allocated-to-others-by-token'

export function targetGetAllocatedToOthers({
  targets,
}: {
  targets: Readonly<Transfer.Targets>
}) {
  const usedByOtherTargets: TransferAllocatedToOtherTargets = new Map()

  targets.forEach((target, targetIndex) => {
    Object.keys(target.entry.amounts).forEach((untypedTokenId) => {
      const tokenId = untypedTokenId as Portfolio.Token.Id
      const allocated = targetGetAllocatedToOthersByToken({
        targets,
        targetIndex,
        tokenId,
      })
      const currentTarget = usedByOtherTargets.get(targetIndex) ?? new Map()

      currentTarget.set(tokenId, {
        allocated,
      })

      usedByOtherTargets.set(targetIndex, currentTarget)
    })
  })

  return freeze(usedByOtherTargets, true)
}
