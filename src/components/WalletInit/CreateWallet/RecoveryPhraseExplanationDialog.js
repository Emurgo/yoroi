// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import {Text} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/RecoveryPhraseExplanationDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.recoveryPhraseDialog

type Props = {
  navigateToRecoveryPhrase: () => mixed,
  trans: SubTranslation<typeof getTrans>,
}

const RecoveryPhraseExplanationDialog = ({navigateToRecoveryPhrase, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <Text>{trans.title}</Text>
      <Text>{trans.paragraph1}</Text>
      <Text>{trans.paragraph2}</Text>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhrase}
        style={styles.button}
      >
        <Text>{trans.nextButton}</Text>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToRecoveryPhrase:
      ({navigation}) => (event) => navigation.replace(
        WALLET_INIT_ROUTES.RECOVERY_PHRASE,
        {password: navigation.getParam('password')}
      ),
  })
)(RecoveryPhraseExplanationDialog)
