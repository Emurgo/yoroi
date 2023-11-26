import React, {useMemo} from 'react'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {Action, getVotingActionsFromTxInfos, LearnMoreLink, useNavigateTo, useStrings} from '../../common'
import {StyleSheet, Text, View} from 'react-native'
import {Spacer} from '../../../../../components'

export const ChangeVoteScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const txInfos = useTransactionInfos(wallet)
  const votingActions = useMemo(() => getVotingActionsFromTxInfos(txInfos), [txInfos])
  const lastVotingAction = votingActions.length > 0 ? votingActions[votingActions.length - 1] : null

  if (!lastVotingAction) throw new Error('User has never voted')
  const handleDelegate = () => {
    // TODO: Create a tx
    navigateTo.confirmTx()
  }

  const handleChangeDelegation = () => {
    // TODO: Create a tx
    navigateTo.confirmTx()
  }

  const handleAbstain = () => {
    // TODO: Create a tx
    navigateTo.confirmTx()
  }

  const handleNoConfidence = () => {
    // TODO: Create a tx
    navigateTo.confirmTx()
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
