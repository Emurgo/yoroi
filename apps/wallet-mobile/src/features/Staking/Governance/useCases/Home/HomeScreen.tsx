import {View, Text, StyleSheet} from 'react-native'
import React from 'react'
import {Action, LearnMoreLink, useStrings} from '../../common'
import {Spacer} from '../../../../../components'

export const HomeScreen = () => {
  return <NeverParticipatedInGovernanceVariant />
}

const NeverParticipatedInGovernanceVariant = () => {
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <View style={styles.introduction}>
        <Text>{strings.reviewActions}</Text>
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
  introduction: {},
  actions: {
    flex: 1,
    gap: 16,
  },
})
