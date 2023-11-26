import {View, Text, StyleSheet} from 'react-native'
import React, {ReactNode} from 'react'
import {Action, LearnMoreLink, useStrings} from '../../common'
import {Spacer} from '../../../../../components'
import {UserAction} from '../../types'

export const HomeScreen = () => {
  // return <NeverParticipatedInGovernanceVariant />
  return <ParticipatingInGovernanceVariant action={{kind: 'delegate', drepID: 'drep1abc'}} isTxPending={true} />
}

const ParticipatingInGovernanceVariant = ({action, isTxPending}: {action: UserAction; isTxPending: boolean}) => {
  const strings = useStrings()

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
          />
        )}
        {action.kind === 'abstain' && (
          <Action title={strings.abstaining} description={strings.actionAbstainDescription} pending={isTxPending} />
        )}
        {action.kind === 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
            pending={isTxPending}
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

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{strings.reviewActions}</Text>
      </View>
      <Spacer height={24} />
      <View style={styles.actions}>
        <Action title={strings.actionDelegateToADRepTitle} description={strings.actionDelegateToADRepDescription} />
        <Action title={strings.actionAbstainTitle} description={strings.actionAbstainDescription} />
        <Action title={strings.actionNoConfidenceTitle} description={strings.actionNoConfidenceDescription} />
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
})
