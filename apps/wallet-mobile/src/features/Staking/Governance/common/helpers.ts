import {isNonNullable} from '@yoroi/common'
import {parseActionFromMetadata} from '@yoroi/staking'

import {TransactionInfo} from '../../../../yoroi-wallets/types'

export const getVotingActionsFromTxInfos = (txInfos: Record<string, TransactionInfo>) => {
  return Object.values(txInfos)
    .map((i) => parseActionFromMetadata(i.metadata))
    .filter(isNonNullable)
}
