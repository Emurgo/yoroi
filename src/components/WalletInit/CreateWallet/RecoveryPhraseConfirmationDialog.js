// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withProps, withState} from 'recompose'

import assert from '../../../utils/assert'
import {Text, Button, Checkbox} from '../../UiKit'
import Screen from '../../Screen'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'

import styles from './styles/RecoveryPhraseConfirmationDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const handleConfirm = ({mnemonic, navigation}) => () => {
  const password = navigation.getParam('password')
  const name = navigation.getParam('name')

  assert.assert(!!mnemonic, 'handleWalletConfirmation:: mnemonic')
  assert.assert(!!password, 'handleWalletConfirmation:: password')
  assert.assert(!!name, 'handleWalletConfirmation:: name')

  navigation.navigate(WALLET_INIT_ROUTES.RECOVERY_PHRASE_CONFIRMATION, {
    mnemonic,
    password,
    name,
  })
}

const getTranslations = (state: State) =>
  state.trans.RecoveryPhraseConfirmationDialog

type Props = {
  handleConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
  acceptedKeyStorage: boolean,
  acceptedNewDeviceRecovery: boolean,
  setAcceptedKeyStorage: (accepted: boolean) => mixed,
  setAcceptedNewDeviceRecovery: (accepted: boolean) => mixed,
}

const RecoveryPhraseConfirmationDialog = ({
  handleConfirm,
  translations,
  acceptedKeyStorage,
  setAcceptedKeyStorage,
  acceptedNewDeviceRecovery,
  setAcceptedNewDeviceRecovery,
}: Props) => (
  <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
    <View style={styles.dialogBody}>
      <Text>{translations.title}</Text>

      <Checkbox
        onChange={setAcceptedKeyStorage}
        checked={acceptedKeyStorage}
        text={translations.keysStorageCheckbox}
      />

      <Checkbox
        onChange={setAcceptedNewDeviceRecovery}
        checked={acceptedNewDeviceRecovery}
        text={translations.newDeviceRecoveryCheckbox}
      />

      <Button
        disabled={!acceptedKeyStorage || !acceptedNewDeviceRecovery}
        onPress={handleConfirm}
        title={translations.confirmationButton}
      />
    </View>
  </Screen>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withProps(({navigation}) => {
    const mnemonic = navigation.getParam('mnemonic')
    return {
      mnemonic,
      words: mnemonic.split(' ').sort(),
    }
  }),
  withState('acceptedKeyStorage', 'setAcceptedKeyStorage', false),
  withState('acceptedNewDeviceRecovery', 'setAcceptedNewDeviceRecovery', false),
  withHandlers({
    handleConfirm,
  }),
)(RecoveryPhraseConfirmationDialog)
