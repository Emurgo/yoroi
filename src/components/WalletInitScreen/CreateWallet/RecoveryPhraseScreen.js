// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {COLORS} from '../../../styles/config'

import styles from './RecoveryPhraseScreen.style'
import {WALLET_INIT_ROUTES} from '../WalletInitNavigator'

type Props = {
  navigateToRecoveryPhraseConfirmation: () => mixed,
  text: {
    title: string,
    mnemonicNote: string,
    confirmationButton: string,
  },
};

const CreateWalletScreen = ({navigateToRecoveryPhraseConfirmation, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{text.title}</CustomText>

      <CustomText>
        YOUR MNEMONIC IS HERE
      </CustomText>

      <CustomText>{text.mnemonicNote}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhraseConfirmation}
        style={styles.button}
      >
        <CustomText>{text.confirmationButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.recoveryPhraseScreen,
  })),
  withHandlers({
    navigateToRecoveryPhraseConfirmation: ({navigation}) =>
      (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION),
  })
)(CreateWalletScreen)
