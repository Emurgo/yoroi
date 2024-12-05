import {useAsyncStorage} from '@yoroi/common'
import {
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'
import * as React from 'react'

import {governaceAfterBlock} from '../../../../kernel/config'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useStakingKey} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {CardanoMobile} from '../../../../yoroi-wallets/wallets'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {useBestBlock} from '../../../WalletManager/common/hooks/useBestBlock'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {GovernanceVote} from '../types'
import {useNavigateTo} from './navigation'

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
  const bestBlock = useBestBlock({options: {suspense: true}})
  return bestBlock.height >= governaceAfterBlock[wallet.networkManager.network]
}

export const useGovernanceManagerMaker = () => {
  const {
    wallet: {
      networkManager: {network},
      id: walletId,
    },
  } = useSelectedWallet()

  const storage = useAsyncStorage()
  const governanceStorage = storage.join(`wallet/${walletId}/staking-governance/`)

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        network,
        api: governanceApiMaker({network}),
        cardano: CardanoMobile,
        storage: governanceStorage,
      }),
    [governanceStorage, network, walletId],
  )
}

export const useGovernanceActions = () => {
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {unsignedTxChanged} = useReviewTx()
  const {updateLatestGovernanceAction} = useUpdateLatestGovernanceAction(wallet.id)
  const {navigateToTxReview} = useWalletNavigation()

  const handleDelegateAction = ({drepID, unsignedTx}: {drepID: string; unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (signedTx) => {
        updateLatestGovernanceAction({kind: 'delegate-to-drep', drepID, txID: signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  const handleAbstainAction = ({unsignedTx}: {unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (signedTx) => {
        updateLatestGovernanceAction({kind: 'vote', vote: 'abstain', txID: signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  const handleNoConfidenceAction = ({unsignedTx}: {unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (signedTx) => {
        updateLatestGovernanceAction({kind: 'vote', vote: 'no-confidence', txID: signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  return {handleDelegateAction, handleAbstainAction, handleNoConfidenceAction} as const
}
