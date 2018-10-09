// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../WalletInitNavigator'

import styles from './RecoveryPhraseScreen.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.recoveryPhraseScreen

type Props = {
  navigateToRecoveryPhraseConfirmation: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const CreateWalletScreen = ({navigateToRecoveryPhraseConfirmation, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <CustomText>{trans.title}</CustomText>

      <CustomText>
        YOUR MNEMONIC IS HERE
      </CustomText>

      <CustomText>{trans.mnemonicNote}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhraseConfirmation}
        style={styles.button}
      >
        <CustomText>{trans.confirmationButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    navigateToRecoveryPhraseConfirmation: ({navigation}) =>
      (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION),
  })
)(CreateWalletScreen)
