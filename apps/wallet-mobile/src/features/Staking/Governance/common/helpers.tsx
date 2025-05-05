import {useAsyncStorage} from '@yoroi/common'
import {
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'
import * as React from 'react'
import {UseQueryOptions} from 'react-query'

import {InfoBanner} from '../../../../components/InfoBanner/InfoBanner'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useStakingKey, useWalletEvent} from '../../../../yoroi-wallets/hooks'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {CardanoMobile} from '../../../../yoroi-wallets/wallets'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {GovernanceVote} from '../types'
import {useNavigateTo} from './navigation'
import {useStrings} from './strings'

export const useIsParticipatingInGovernance = () => {
  const status = useGovernanceStatus({suspense: true, useErrorBoundary: false, retry: false})
  return status !== null
}

export const useGovernanceStatus = (options: UseQueryOptions<StakingKeyState, Error> = {}) => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus, refetch} = useStakingKeyState(stakingKeyHash, options)

  useWalletEvent(wallet, 'utxos', refetch)

  return React.useMemo(() => {
    return stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
  }, [stakingStatus])
}

export const mapStakingKeyStateToGovernanceAction = (state: StakingKeyState): GovernanceVote | null => {
  if (!state.drepDelegation) return null
  const vote = state.drepDelegation
  return vote.action === 'abstain'
    ? {kind: 'abstain'}
    : vote.action === 'no-confidence'
    ? {kind: 'no-confidence'}
    : {kind: 'delegate', hash: vote.hash, type: vote.type}
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
  const strings = useStrings()

  const handleDelegateAction = ({
    hash,
    unsignedTx,
    type,
    CIP105 = false,
  }: {
    hash: string
    type: 'key' | 'script'
    unsignedTx: YoroiUnsignedTx
    CIP105: boolean
  }) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (args) => {
        if (args?.signedTx?.signedTx?.id == null) throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({kind: 'delegate-to-drep', hash, type, txID: args.signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      ...(CIP105
        ? {operationsNotice: <InfoBanner content={strings.delegateVotingToDRepDeprecatedFormatNotice} />}
        : {}),
    })
  }

  const handleAbstainAction = ({unsignedTx}: {unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (args) => {
        if (args?.signedTx?.signedTx?.id == null) throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({kind: 'vote', vote: 'abstain', txID: args?.signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  const handleNoConfidenceAction = ({unsignedTx}: {unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (args) => {
        if (args?.signedTx?.signedTx?.id == null) throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({kind: 'vote', vote: 'no-confidence', txID: args?.signedTx.signedTx.id})
        navigateTo.submittedTx()
      },
      onError: navigateTo.failedTx,
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  return {handleDelegateAction, handleAbstainAction, handleNoConfidenceAction} as const
}
