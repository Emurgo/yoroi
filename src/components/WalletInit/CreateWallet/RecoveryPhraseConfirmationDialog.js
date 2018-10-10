// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import CustomText from '../../CustomText'
import Screen from '../../Screen'
import {ROOT_ROUTES} from '../../../RoutesList'

import styles from './styles/RecoveryPhraseConfirmationDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'


const resetNavigationAction = StackActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROOT_ROUTES.MAIN,
    }),
  ],
  key: null,
})

const getTrans = (state: State) => state.trans.recoveryPhraseConfirmationDialog

type Props = {
  navigateToWallet: () => mixed,
  trans: SubTranslation<typeof getTrans>,
};

const RecoveryPhraseConfirmationDialog = ({navigateToWallet, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <CustomText>{trans.title}</CustomText>
      <CustomText>{trans.keysStorageCheckbox}</CustomText>
      <CustomText>{trans.newDeviceRecoveryCheckbox}</CustomText>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={navigateToWallet}
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
    navigateToWallet:
      ({navigation}) => (event) => navigation.dispatch(resetNavigationAction),
  })
)(RecoveryPhraseConfirmationDialog)
