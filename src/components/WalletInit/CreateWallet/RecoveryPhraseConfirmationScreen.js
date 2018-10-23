// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import {Text, Button} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'

const getTranslations = (state: State) => state.trans.recoveryPhraseConfirmationScreen

type Props = {
  navigateToConfirmDialog: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  navigation: NavigationScreenProp<NavigationState>,
}

const RecoveryPhraseConfirmationScreen = ({
  navigateToConfirmDialog,
  translations,
  navigation,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT}>
    <View>
      <Text>{translations.title}</Text>
      <Text>{translations.instructions}</Text>
      <Text>{translations.inputLabel}</Text>
      <Text>{navigation.getParam('mnemonic')}</Text>

      <Button
        onPress={() => {/* Dispatch reset action here */}}
        title={translations.clearButton}
      />

      <Button
        onPress={navigateToConfirmDialog}
        title={translations.confirmButton}
      />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateToConfirmDialog: ({navigation}) =>
      () => navigation.navigate(
        WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION_DIALOG, {
          mnemonic: navigation.getParam('mnemonic'),
          password: navigation.getParam('password'),
        }
      ),
  })
)(RecoveryPhraseConfirmationScreen)
