// @flow

import React from 'react'
import {View, TouchableHighlight} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import {Text} from '../../UiKit'
import Screen from '../../Screen'
import WalletManager from '../../../crypto/wallet'
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

const handleWalletConfirmation = ({navigation}) => () => {
  const mnemonic = navigation.getParam('mnemonic')
  const password = navigation.getParam('password')

  WalletManager.restoreWallet(mnemonic, password)
  navigation.dispatch(resetNavigationAction)
}

const getTrans = (state: State) => state.trans.recoveryPhraseConfirmationDialog

type Props = {
  confirmWalletCreation: () => mixed,
  trans: SubTranslation<typeof getTrans>,
}

const RecoveryPhraseConfirmationDialog = ({confirmWalletCreation, trans}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <Text>{trans.title}</Text>
      <Text>{trans.keysStorageCheckbox}</Text>
      <Text>{trans.newDeviceRecoveryCheckbox}</Text>

      <TouchableHighlight
        activeOpacity={0.1}
        underlayColor={COLORS.WHITE}
        onPress={confirmWalletCreation}
        style={styles.button}
      >
        <Text>{trans.confirmationButton}</Text>
      </TouchableHighlight>
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    trans: getTrans(state),
  })),
  withHandlers({
    confirmWalletCreation: handleWalletConfirmation,
  })
)(RecoveryPhraseConfirmationDialog)
