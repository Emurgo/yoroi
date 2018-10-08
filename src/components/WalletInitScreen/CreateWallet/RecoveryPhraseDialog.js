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

import styles from './RecoveryPhraseDialog.style'

type Props = {
  navigateToRecoveryPhrase: () => mixed,
  text: {
    title: string,
    paragraph1: string,
    paragraph2: string,
    nextButton: string,
  },
};

const RecoveryPhraseDialog = ({navigateToRecoveryPhrase, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <CustomText>{text.title}</CustomText>
      <CustomText>{text.paragraph1}</CustomText>
      <CustomText>{text.paragraph2}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhrase}
        style={styles.button}
      >
        <CustomText>{text.nextButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.recoveryPhraseDialog,
  })),
  withHandlers({
    navigateToRecoveryPhrase:
      ({navigation}) => (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE),
  })
)(RecoveryPhraseDialog)
