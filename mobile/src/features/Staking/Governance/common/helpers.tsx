import {useAsyncStorage} from '@yoroi/common'
import {
  type Logger,
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'

import * as React from 'react'

import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'
import {CardanoMobile} from '~/wallets/wallets'

import {GovernanceVote} from '../types'
import {useNavigateTo} from './navigation'

export const useGovernanceParticipation = () => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {
    data: stakingStatus,
    isLoading,
    refetch,
  } = useStakingKeyState(stakingKeyHash)

  // Refresh governance status when UTXOs change
  useWalletEvent(wallet, 'utxos', refetch)

  const isParticipating = stakingStatus?.drepDelegation != null
  return {isParticipating, isLoading} as const
}

export const useGovernanceStatus = () => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus, refetch} = useStakingKeyState(stakingKeyHash)

  useWalletEvent(wallet, 'utxos', refetch)

  return React.useMemo(() => {
    return stakingStatus
      ? mapStakingKeyStateToGovernanceAction(stakingStatus)
      : null
  }, [stakingStatus])
}

export const mapStakingKeyStateToGovernanceAction = (
  state: StakingKeyState,
): GovernanceVote | null => {
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
  const governanceStorage = storage.join(
    `wallet/${walletId}/staking-governance/`,
  )

  const loggerAdapter = React.useMemo<Logger>(
    () => ({
      error: (message: string, data?: unknown) => {
        logger.error(message, data as Record<string, unknown>)
      },
    }),
    [],
  )

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        network,
        api: governanceApiMaker({network}),
        cardano: CardanoMobile,
        storage: governanceStorage,
        logger: loggerAdapter,
      }),
    [governanceStorage, network, walletId, loggerAdapter],
  )
}

export const useGovernanceActions = () => {
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {unsignedTxChanged} = useReviewTx()
  const {updateLatestGovernanceAction} = useUpdateLatestGovernanceAction(
    wallet.id,
  )
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
        if (args?.signedTx?.signedTx?.id == null)
          throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({
          kind: 'delegate-to-drep',
          hash,
          type,
          txID: args.signedTx.signedTx.id,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      ...(CIP105
        ? {
            operationsNotice: (
              <InfoBanner
                content={
                  strings.staking.delegateVotingToDRepDeprecatedFormatNotice
                }
              />
            ),
          }
        : {}),
    })
  }

  const handleAbstainAction = ({unsignedTx}: {unsignedTx: YoroiUnsignedTx}) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (args) => {
        if (args?.signedTx?.signedTx?.id == null)
          throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({
          kind: 'vote',
          vote: 'abstain',
          txID: args?.signedTx.signedTx.id,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  const handleNoConfidenceAction = ({
    unsignedTx,
  }: {
    unsignedTx: YoroiUnsignedTx
  }) => {
    unsignedTxChanged(unsignedTx)

    navigateToTxReview({
      onSuccess: (args) => {
        if (args?.signedTx?.signedTx?.id == null)
          throw new Error('useGovernanceActions:: invalid state')
        updateLatestGovernanceAction({
          kind: 'vote',
          vote: 'no-confidence',
          txID: args?.signedTx.signedTx.id,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
    })
  }

  return {
    handleDelegateAction,
    handleAbstainAction,
    handleNoConfidenceAction,
  } as const
}
