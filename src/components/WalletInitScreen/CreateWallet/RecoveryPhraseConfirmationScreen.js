// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {COLORS} from '../../../styles/config'
import {WALLET_INIT_ROUTES} from '../WalletInitNavigator'

import styles from './RecoveryPhraseConfirmationScreen.style'

type Props = {
  navigateToConfirmDialog: () => mixed,
  text: {
    title: string,
    instructions: string,
    inputLabel: string,
    clearButton: string,
    confirmButton: string,
  },
};

const RecoveryPhraseConfirmationScreen = ({navigateToConfirmDialog, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{text.title}</CustomText>
      <CustomText>{text.instructions}</CustomText>
      <CustomText>{text.inputLabel}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={() => {/* Dispatch reset action here*/}}
        style={styles.button}
      >
        <CustomText>{text.clearButton}</CustomText>
      </TouchableHighlight>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToConfirmDialog}
        style={styles.button}
      >
        <CustomText>{text.confirmButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.recoveryPhraseConfirmationScreen,
  })),
  withHandlers({
    navigateToConfirmDialog: ({navigation}) =>
      (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG),
  })
)(RecoveryPhraseConfirmationScreen)
