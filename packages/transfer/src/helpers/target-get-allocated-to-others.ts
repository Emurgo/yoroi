import {Transfer} from '@yoroi/types'
import {freeze} from 'immer'

import {TransferAllocatedToOtherTargets} from '../types'
import {targetGetAllocatedToOthersByToken} from './target-get-allocated-to-others-by-token'

export function targetGetAllocatedToOthers({
  targets,
}: {
  targets: Readonly<Transfer.Targets>
}) {
  const usedByOtherTargets: TransferAllocatedToOtherTargets = new Map()

  targets.forEach((_, targetIndex) => {
    usedByOtherTargets.set(
      targetIndex,
      targetGetAllocatedToOthersByToken({targets, targetIndex}),
    )
  })

  return freeze(usedByOtherTargets, true)
}
