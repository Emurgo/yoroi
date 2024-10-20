import {isNonNullable} from '@yoroi/common'
import {
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useModal} from '../../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {useCreateGovernanceTx, useStakingKey} from '../../../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {Action} from '../../common/Action/Action'
import {mapStakingKeyStateToGovernanceAction, useGovernanceActions} from '../../common/helpers'
import {LearnMoreLink} from '../../common/LearnMoreLink/LearnMoreLink'
import {useStrings} from '../../common/strings'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const ChangeVoteScreen = () => {
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash, {suspense: true})
  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
  const {openModal} = useModal()
  const {manager} = useGovernance()
  const [pendingVote, setPendingVote] = React.useState<GovernanceVote['kind'] | null>(null)
  const {styles} = useStyles()
  const governanceActions = useGovernanceActions()

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
            const unsignedTx = await createGovernanceTxMutation.mutateAsync({
              certificates: [certificate],
              addressMode: meta.addressMode,
            })

            governanceActions.handleDelegateAction({
              unsignedTx,
              drepID,
            })
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
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleAbstainAction({
            unsignedTx,
          })
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
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleNoConfidenceAction({
            unsignedTx,
          })
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.justify_between,
      ...atoms.px_lg,
      backgroundColor: color.bg_color_max,
    },
    description: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    actions: {
      ...atoms.flex_1,
      ...atoms.gap_lg,
    },
  })

  return {styles}
}
