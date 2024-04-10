import {useAsyncStorage} from '@yoroi/common'
import {type StakingKeyState, governanceApiMaker, governanceManagerMaker, useStakingKeyState} from '@yoroi/staking'
import * as React from 'react'

import {CONFIG} from '../../../../legacy/config'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useStakingKey, useTipStatus} from '../../../../yoroi-wallets/hooks'
import {isMainnetNetworkId, isSanchoNetworkId} from '../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../yoroi-wallets/wallets'
import {useSelectedWallet} from '../../../WalletManager/Context'
import {GovernanceVote} from '../types'

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

export const useIsGovernanceFeatureEnabled = (wallet: YoroiWallet) => {
  const tipStatus = useTipStatus({wallet, options: {suspense: true}})
  const {bestBlock} = tipStatus
  const walletNetworkId = wallet.networkId
  const isSanchonet = isSanchoNetworkId(walletNetworkId)
  const isMainnet = isMainnetNetworkId(walletNetworkId)

  const enabledSince = isSanchonet
    ? CONFIG.GOVERNANCE_ENABLED_SINCE_BLOCK.SANCHONET
    : isMainnet
    ? CONFIG.GOVERNANCE_ENABLED_SINCE_BLOCK.MAINNET
    : CONFIG.GOVERNANCE_ENABLED_SINCE_BLOCK.PREPROD

  return bestBlock.height >= enabledSince
}

export const useGovernanceManagerMaker = () => {
  const {networkId, id: walletId} = useSelectedWallet()

  const storage = useAsyncStorage()
  const governanceStorage = storage.join(`wallet/${walletId}/staking-governance/`)

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        networkId,
        api: governanceApiMaker({networkId}),
        cardano: CardanoMobile,
        storage: governanceStorage,
      }),
    [governanceStorage, networkId, walletId],
  )
}
