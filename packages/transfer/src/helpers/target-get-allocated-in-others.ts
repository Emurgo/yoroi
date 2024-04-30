import {Portfolio, Transfer} from '@yoroi/types'
import {freeze} from 'immer'

import {TransferUsedByOtherTargets} from '../types'
import {targetGetTokenTotalUsedByOthers} from './target-get-token-allocated-to-others'

export function targetGetUsedByOtherTargets({
  targets,
}: {
  targets: Readonly<Transfer.Targets>
}) {
  const usedByOtherTargets: TransferUsedByOtherTargets = new Map()

  targets.forEach((target, targetIndex) => {
    Object.keys(target.entry.amounts).forEach((untypedTokenId) => {
      const tokenId = untypedTokenId as Portfolio.Token.Id
      const allocated = targetGetTokenTotalUsedByOthers({
        targets,
        targetIndex,
        tokenId,
      })
      const currentTarget = usedByOtherTargets.get(targetIndex) ?? new Map()

      currentTarget.set(tokenId, {
        allocated,
      })
    })
  })

  return freeze(usedByOtherTargets, true)
}
