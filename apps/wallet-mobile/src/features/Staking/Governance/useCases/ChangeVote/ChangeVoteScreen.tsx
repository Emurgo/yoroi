import {isNonNullable} from '@yoroi/common'
import {
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer, useModal} from '../../../../../components'
import {useCreateGovernanceTx, useStakingKey} from '../../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../Wallet/common/Context'
import {Action, LearnMoreLink, useNavigateTo, useStrings} from '../../common'
import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal'

export const ChangeVoteScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {suspense: true})
  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
  const {openModal} = useModal()
  const {manager} = useGovernance()
  const [pendingVote, setPendingVote] = React.useState<GovernanceVote['kind'] | null>(null)

  const {createCertificate: createDelegationCertificate, isLoading: isCreatingDelegationCertificate} =
    useDelegationCertificate({
      useErrorBoundary: true,
    })

  const {createCertificate: createVotingCertificate, isLoading: isCreatingVotingCertificate} = useVotingCertificate({
    useErrorBoundary: true,
  })

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    useErrorBoundary: true,
  })

  if (!isNonNullable(action)) throw new Error('User has never voted')

  const openDRepIdModal = (onSubmit: (drepId: string) => void) => {
    openModal(
      strings.enterDRepID,
      <GovernanceProvider manager={manager}>
        <EnterDrepIdModal onSubmit={onSubmit} />
      </GovernanceProvider>,
      360,
    )
  }

  const handleDelegate = () => {
    openDRepIdModal(async (drepID) => {
      const stakingKey = await wallet.getStakingKey()
      const vote = {kind: 'delegate', drepID} as const
      setPendingVote(vote.kind)

      createDelegationCertificate(
        {drepID, stakingKey},
        {
          onSuccess: async (certificate) => {
            const unsignedTx = await createGovernanceTxMutation.mutateAsync([certificate])
            navigateTo.confirmTx({unsignedTx, vote})
          },
        },
      )
    })
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    const vote = {kind: 'abstain'} as const
    setPendingVote(vote.kind)

    createVotingCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync([certificate])
          navigateTo.confirmTx({unsignedTx, vote})
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    const vote = {kind: 'no-confidence'} as const
    setPendingVote(vote.kind)

    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync([certificate])
          navigateTo.confirmTx({unsignedTx, vote})
        },
      },
    )
  }

  const voteKind = action.kind
  const isCreatingTx =
    createGovernanceTxMutation.isLoading || isCreatingVotingCertificate || isCreatingDelegationCertificate

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{strings.reviewActions}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        {voteKind !== 'delegate' && (
          <Action
            title={strings.actionDelegateToADRepTitle}
            description={strings.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate'}
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.changeDRep}
            description={strings.actionDelegateToADRepDescription}
            onPress={handleDelegate}
            pending={isCreatingTx && pendingVote === 'delegate'}
          />
        )}

        {voteKind !== 'abstain' && (
          <Action
            title={strings.actionAbstainTitle}
            description={strings.actionAbstainDescription}
            onPress={handleAbstain}
            pending={isCreatingTx && pendingVote === 'abstain'}
          />
        )}

        {voteKind !== 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
            onPress={handleNoConfidence}
            pending={isCreatingTx && pendingVote === 'no-confidence'}
          />
        )}
      </View>

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 18,
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
  actions: {
    flex: 1,
    gap: 16,
  },
})
