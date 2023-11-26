import {TransactionInfo} from '../../../../yoroi-wallets/types'
import {parseActionFromMetadata} from '@yoroi/staking'
import {isNonNullable} from '@yoroi/common'

export const getVotingActionsFromTxInfos = (txInfos: Record<string, TransactionInfo>) => {
  return Object.values(txInfos)
    .map((i) => parseActionFromMetadata(i.metadata))
    .filter(isNonNullable)
}
