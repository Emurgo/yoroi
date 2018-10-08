// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {COLORS} from '../../../styles/config'

import styles from './RecoveryPhraseConfirmationDialog.style'

const resetNavigationAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({
      // Fixme: why ROOT_ROUTES.MAIN is not working
      routeName: 'main',
    }),
  ],
  key: null,
})

type Props = {
  navigateToWallet: () => mixed,
  text: {
    title: string,
    keysStorageCheckbox: string,
    newDeviceRecoveryCheckbox: string,
    confirmationButton: string,
  },
};

const RecoveryPhraseConfirmationDialog = ({navigateToWallet, text}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <CustomText>{text.title}</CustomText>
      <CustomText>{text.keysStorageCheckbox}</CustomText>
      <CustomText>{text.newDeviceRecoveryCheckbox}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToWallet}
        style={styles.button}
      >
        <CustomText>{text.confirmationButton}</CustomText>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    text: state.l10n.recoveryPhraseConfirmationDialog,
  })),
  withHandlers({
    navigateToWallet:
      ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
  })
)(RecoveryPhraseConfirmationDialog)
