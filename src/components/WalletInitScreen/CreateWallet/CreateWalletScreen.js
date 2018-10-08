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

import styles from './CreateWalletScreen.style'

type Props = {
  navigateToRecoveryPhrase: () => mixed,
  text: {
    title: string,
    nameLabel: string,
    passwordLabel: string,
    passwordConfirmationLabel: string,
    passwordRequirementsNote: string,
    createButton: string,
  }
};

const CreateWalletScreen = ({navigateToRecoveryPhrase, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{text.title}</CustomText>
      <CustomText>{text.nameLabel}</CustomText>
      <CustomText>{text.passwordLabel}</CustomText>
      <CustomText>{text.passwordConfirmationLabel}</CustomText>
      <CustomText>{text.passwordRequirementsNote}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhrase}
        style={styles.button}
      >
        <CustomText>{text.createButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.createWallet,
  })),
  withHandlers({
    navigateToRecoveryPhrase:
      ({navigation}) => (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_DIALOG),
  })
)(CreateWalletScreen)
