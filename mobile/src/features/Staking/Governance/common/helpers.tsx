import {useAsyncStorage} from '@yoroi/common'
import {
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'
import {calculateTxId} from '@yoroi/tx'

import {Buffer} from 'buffer'
import * as React from 'react'

import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'
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
  const selectedWallet = useSelectedWallet()

  const {
    wallet: {
      networkManager: {network},
      id: walletId,
    },
  } = selectedWallet

  const storage = useAsyncStorage()
  const governanceStorage = storage.join(
    `wallet/${walletId}/staking-governance/`,
  )

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
    unsignedTx: {cbor: string}
    CIP105: boolean
  }) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Calculate txId from signedTx if available, otherwise from unsigned CBOR
        let txID: string
        if (args?.signedTx) {
          const txBytes = args.signedTx.toBytes()
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(
              csl,
              Buffer.from(txBytes).toString('hex'),
              'hex',
            )
          })
        } else {
          // Calculate from unsigned CBOR (transaction body hash is the same)
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(csl, unsignedTx.cbor, 'hex')
          })
        }
        updateLatestGovernanceAction({
          kind: 'delegate-to-drep',
          hash,
          type,
          txID,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
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

  const handleAbstainAction = ({unsignedTx}: {unsignedTx: {cbor: string}}) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Calculate txId from signedTx if available, otherwise from unsigned CBOR
        let txID: string
        if (args?.signedTx) {
          const txBytes = args.signedTx.toBytes()
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(
              csl,
              Buffer.from(txBytes).toString('hex'),
              'hex',
            )
          })
        } else {
          // Calculate from unsigned CBOR (transaction body hash is the same)
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(csl, unsignedTx.cbor, 'hex')
          })
        }
        updateLatestGovernanceAction({
          kind: 'vote',
          vote: 'abstain',
          txID,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
    })
  }

  const handleNoConfidenceAction = ({
    unsignedTx,
  }: {
    unsignedTx: {cbor: string}
  }) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Calculate txId from signedTx if available, otherwise from unsigned CBOR
        let txID: string
        if (args?.signedTx) {
          const txBytes = args.signedTx.toBytes()
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(
              csl,
              Buffer.from(txBytes).toString('hex'),
              'hex',
            )
          })
        } else {
          // Calculate from unsigned CBOR (transaction body hash is the same)
          txID = await CardanoMobileWrapped.cslScope(async (csl) => {
            return await calculateTxId(csl, unsignedTx.cbor, 'hex')
          })
        }
        updateLatestGovernanceAction({
          kind: 'vote',
          vote: 'no-confidence',
          txID,
        })
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
    })
  }

  return {
    handleDelegateAction,
    handleAbstainAction,
    handleNoConfidenceAction,
  } as const
}
