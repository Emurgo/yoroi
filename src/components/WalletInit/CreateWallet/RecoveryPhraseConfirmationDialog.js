// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {NavigationActions, StackActions} from 'react-navigation'

import {Text, Button} from '../../UiKit'
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

const getTranslations = (state: State) =>
  state.trans.RecoveryPhraseConfirmationDialog

type Props = {
  confirmWalletCreation: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const RecoveryPhraseConfirmationDialog = ({
  confirmWalletCreation,
  translations,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <Text>{translations.title}</Text>
      <Text>{translations.keysStorageCheckbox}</Text>
      <Text>{translations.newDeviceRecoveryCheckbox}</Text>

      <Button
        onPress={confirmWalletCreation}
        title={translations.confirmationButton}
      />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    confirmWalletCreation: handleWalletConfirmation,
  }),
)(RecoveryPhraseConfirmationDialog)
