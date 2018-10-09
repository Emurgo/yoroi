// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../WalletInitNavigator'

import styles from './styles/RecoveryPhraseConfirmationScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.recoveryPhraseConfirmationScreen

type Props = {
  navigateToConfirmDialog: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const RecoveryPhraseConfirmationScreen = ({navigateToConfirmDialog, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{trans.title}</CustomText>
      <CustomText>{trans.instructions}</CustomText>
      <CustomText>{trans.inputLabel}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={() => {/* Dispatch reset action here*/}}
        style={styles.button}
      >
        <CustomText>{trans.clearButton}</CustomText>
      </TouchableHighlight>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToConfirmDialog}
        style={styles.button}
      >
        <CustomText>{trans.confirmButton}</CustomText>
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
      (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG),
  })
)(RecoveryPhraseConfirmationScreen)
