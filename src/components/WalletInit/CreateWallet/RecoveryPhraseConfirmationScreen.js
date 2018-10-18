// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import {Text} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/RecoveryPhraseConfirmationScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const getTrans = (state: State) => state.trans.recoveryPhraseConfirmationScreen

type Props = {
  navigateToConfirmDialog: () => mixed,
  trans: SubTranslation<typeof getTrans>,
  navigation: NavigationScreenProp<NavigationState>,
}

const RecoveryPhraseConfirmationScreen = ({navigateToConfirmDialog, trans, navigation}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <Text>{trans.title}</Text>
      <Text>{trans.instructions}</Text>
      <Text>{trans.inputLabel}</Text>
      <Text>{navigation.getParam('mnemonic')}</Text>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={() => {
          /* Dispatch reset action here*/
        }}
        style={styles.button}
      >
        <Text>{trans.clearButton}</Text>
      </TouchableHighlight>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToConfirmDialog}
        style={styles.button}
      >
        <Text>{trans.confirmButton}</Text>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToConfirmDialog: ({navigation}) =>
      () => navigation.navigate(
        WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG, {
          mnemonic: navigation.getParam('mnemonic'),
          password: navigation.getParam('password'),
        }
      ),
  })
)(RecoveryPhraseConfirmationScreen)
