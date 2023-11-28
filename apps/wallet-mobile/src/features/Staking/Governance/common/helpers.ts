import {isNonNullable} from '@yoroi/common'
import {parseActionFromMetadata} from '@yoroi/staking'
import {useMemo} from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../yoroi-wallets/types'

export const getVotingActionsFromTxInfos = (txInfos: Record<string, TransactionInfo>) => {
  return Object.values(txInfos)
    .map((i) => parseActionFromMetadata(i.metadata))
    .filter(isNonNullable)
}

export const useLatestConfirmedGovernanceAction = (wallet: YoroiWallet) => {
  const txInfos = useTransactionInfos(wallet)
  const actions = useMemo(() => getVotingActionsFromTxInfos(txInfos), [txInfos])
  return actions.length > 0 ? actions[actions.length - 1] : null
}

export const useIsParticipatingInGovernance = (wallet: YoroiWallet) => {
  const latestAction = useLatestConfirmedGovernanceAction(wallet)
  return latestAction !== null
}
