import {isNonNullable} from '@yoroi/common'
import {useVotingCertificate} from '@yoroi/staking'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {Action, LearnMoreLink, useNavigateTo, useStrings} from '../../common'
import {useLatestConfirmedGovernanceAction} from '../../common/helpers'

export const ChangeVoteScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const lastVotingAction = useLatestConfirmedGovernanceAction(wallet)
  const {createCertificate} = useVotingCertificate({
    useErrorBoundary: true,
  })

  if (!isNonNullable(lastVotingAction)) throw new Error('User has never voted')

  // TODO: delegate / drep id flow to be confirmed
  const handleDelegate = async () => {
    const stakingKey = await wallet.getStakingKey()
    createCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
          navigateTo.confirmTx({unsignedTx, vote: {kind: 'delegate', drepID: ''}})
        },
      },
    )
  }

  // TODO: delegate / drep id flow to be confirmed
  const handleChangeDelegation = async () => {
    const stakingKey = await wallet.getStakingKey()
    createCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
          navigateTo.confirmTx({unsignedTx, vote: {kind: 'delegate', drepID: ''}})
        },
      },
    )
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    createCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
          navigateTo.confirmTx({unsignedTx, vote: {kind: 'abstain'}})
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    createCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
          navigateTo.confirmTx({unsignedTx, vote: {kind: 'no-confidence'}})
        },
      },
    )
  }

  const voteKind = lastVotingAction.kind

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
          />
        )}

        {voteKind === 'delegate' && (
          <Action
            title={strings.changeDRep}
            description={strings.actionDelegateToADRepDescription}
            onPress={handleChangeDelegation}
          />
        )}

        {voteKind !== 'abstain' && (
          <Action
            title={strings.actionAbstainTitle}
            description={strings.actionAbstainDescription}
            onPress={handleAbstain}
          />
        )}

        {voteKind !== 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
            onPress={handleNoConfidence}
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
