// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../WalletInitNavigator'

import styles from './RecoveryPhraseDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTrans = (state: State) => state.trans.recoveryPhraseDialog

type Props = {
  navigateToRecoveryPhrase: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const RecoveryPhraseDialog = ({navigateToRecoveryPhrase, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <CustomText>{trans.title}</CustomText>
      <CustomText>{trans.paragraph1}</CustomText>
      <CustomText>{trans.paragraph2}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToRecoveryPhrase}
        style={styles.button}
      >
        <CustomText>{trans.nextButton}</CustomText>
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
      ({navigation}) => (event) => navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE),
  })
)(RecoveryPhraseDialog)
