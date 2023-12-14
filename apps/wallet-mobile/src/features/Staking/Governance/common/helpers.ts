import {isNonNullable} from '@yoroi/common'
import {parseActionFromMetadata, type StakingKeyState, useStakingKeyState} from '@yoroi/staking'
import {useMemo} from 'react'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useStakingKey, useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../yoroi-wallets/types'
import {GovernanceVote} from '../types'

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
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {
    suspense: true,
    useErrorBoundary: false,
    retry: false,
  })
  return stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) !== null : false
}

export const mapStakingKeyStateToGovernanceAction = (state: StakingKeyState): GovernanceVote | null => {
  if (!state.drepDelegation) return null
  const vote = state.drepDelegation
  return vote.action === 'abstain'
    ? {kind: 'abstain'}
    : vote.action === 'no-confidence'
    ? {kind: 'no-confidence'}
    : {kind: 'delegate', drepID: vote.drepID}
}
