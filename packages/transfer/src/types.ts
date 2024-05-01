import {Portfolio} from '@yoroi/types'

export type TransferAllocatedToOtherTargets = Map<
  number,
  Map<
    Portfolio.Token.Id,
    {
      allocated: bigint
    }
  >
>
