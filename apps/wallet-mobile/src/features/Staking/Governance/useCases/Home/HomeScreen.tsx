import {isNonNullable, isString} from '@yoroi/common'
import {
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useVotingCertificate,
} from '@yoroi/staking'
import React, {ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer, useModal} from '../../../../../components'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {Action, LearnMoreLink, useNavigateTo, useStrings} from '../../common'
import {useLatestConfirmedGovernanceAction} from '../../common/helpers'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal'

export const HomeScreen = () => {
  const wallet = useSelectedWallet()
  const txInfos = useTransactionInfos(wallet)

  const lastVotingAction = useLatestConfirmedGovernanceAction(wallet)

  const {data: lastSubmittedTx} = useLatestGovernanceAction()

  const isTxPending =
    isString(lastSubmittedTx?.txID) && !Object.values(txInfos).some((tx) => tx.id === lastSubmittedTx?.txID)

  if (isTxPending && isNonNullable(lastSubmittedTx)) {
    if (lastSubmittedTx.kind === 'delegate-to-drep') {
      const action: GovernanceVote = {kind: 'delegate', drepID: lastSubmittedTx.drepID}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'abstain') {
      const action: GovernanceVote = {kind: 'abstain'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }

    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'no-confidence') {
      const action: GovernanceVote = {kind: 'no-confidence'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
  }

  if (isNonNullable(lastVotingAction)) {
    return <ParticipatingInGovernanceVariant action={lastVotingAction} isTxPending={isTxPending} />
  }
  return <NeverParticipatedInGovernanceVariant />
}

const ParticipatingInGovernanceVariant = ({action, isTxPending}: {action: GovernanceVote; isTxPending: boolean}) => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  const actionTitles = {
    abstain: strings.actionAbstainTitle,
    delegate: strings.actionDelegateToADRepTitle,
    'no-confidence': strings.actionNoConfidenceTitle,
  }
  const selectedActionTitle = actionTitles[action.kind]

  const formattingOptions = {
    b: (text: ReactNode) => <Text style={[styles.description, styles.bold]}>{text}</Text>,
    textComponent: (text: ReactNode) => <Text style={styles.description}>{text}</Text>,
  }

  const introduction = isTxPending
    ? strings.actionYouHaveSelectedTxPending(selectedActionTitle, formattingOptions)
    : strings.actionYouHaveSelected(selectedActionTitle, formattingOptions)

  const navigateToChangeVote = () => {
    navigateTo.changeVote()
  }

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{introduction}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        {action.kind === 'delegate' && (
          <Action
            title={strings.delegatingToADRep}
            description={strings.actionDelegateToADRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <Text style={styles.drepInfoTitle}>{strings.drepKey}</Text>

            <Text style={styles.drepInfoDescription}>{action.drepID}</Text>
          </Action>
        )}

        {action.kind === 'abstain' && (
          <Action
            title={strings.abstaining}
            description={strings.actionAbstainDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}

        {action.kind === 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}
      </View>

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

const NeverParticipatedInGovernanceVariant = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const wallet = useSelectedWallet()
  const {manager} = useGovernance()
  const {openModal} = useModal()

  const {createCertificate: createDelegationCertificate} = useDelegationCertificate({
    useErrorBoundary: true,
  })

  const {createCertificate: createVotingCertificate} = useVotingCertificate({
    useErrorBoundary: true,
  })

  const openDRepIdModal = (onSubmit: (drepId: string) => void) => {
    openModal(
      strings.drepID,
      <GovernanceProvider manager={manager}>
        <EnterDrepIdModal onSubmit={onSubmit} />
      </GovernanceProvider>,
      360,
    )
  }

  const handleDelegate = () => {
    openDRepIdModal(async (drepID) => {
      const stakingKey = await wallet.getStakingKey()
      createDelegationCertificate(
        {drepID, stakingKey},
        {
          onSuccess: async (certificate) => {
            const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
            navigateTo.confirmTx({unsignedTx, vote: {kind: 'delegate', drepID}})
          },
        },
      )
    })
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    createVotingCertificate(
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
    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await wallet.createUnsignedGovernanceTx(certificate)
          navigateTo.confirmTx({unsignedTx, vote: {kind: 'no-confidence'}})
        },
      },
    )
  }

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{strings.reviewActions}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        <Action
          title={strings.actionDelegateToADRepTitle}
          description={strings.actionDelegateToADRepDescription}
          onPress={handleDelegate}
        />

        <Action
          title={strings.actionAbstainTitle}
          description={strings.actionAbstainDescription}
          onPress={handleAbstain}
        />

        <Action
          title={strings.actionNoConfidenceTitle}
          description={strings.actionNoConfidenceDescription}
          onPress={handleNoConfidence}
        />
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
  bold: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  actions: {
    flex: 1,
    gap: 16,
  },
  drepInfoTitle: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
  drepInfoDescription: {
    fontFamily: 'Rubik-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7384',
  },
})
