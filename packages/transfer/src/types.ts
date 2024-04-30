import {Portfolio} from '@yoroi/types'

export type TransferAllocatedByOtherTargets = Map<
  number,
  Map<
    Portfolio.Token.Id,
    {
      allocated: bigint
    }
  >
>
