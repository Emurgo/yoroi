// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withState} from 'recompose'
import {View} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import Screen from '../Screen'
import walletManager from '../../crypto/wallet'
import {Text, Button, ValidatedTextInput} from '../UiKit'
import {setEasyConfirmation, showErrorDialog} from '../../actions'
import {easyConfirmationSelector} from '../../selectors'
import {WrongPassword} from '../../crypto/errors'

import styles from './styles/ToggleEasyConfirmationScreen.style'

const getTranslations = (state) => state.trans.BiometricsLinkScreen

const enableEasyConfirmation = ({
  navigation,
  masterPassword,
  setEasyConfirmation,
}) => async () => {
  try {
    await walletManager.enableEasyConfirmation(masterPassword)
    setEasyConfirmation(true)

    navigation.goBack()
  } catch (error) {
    if (error instanceof WrongPassword) {
      await showErrorDialog((dialogs) => dialogs.incorrectPassword)
    } else {
      await showErrorDialog((dialogs) => dialogs.general)
    }
  }
}

const disableEasyConfirmation = ({navigation}) => async () => {
  try {
    await walletManager.disableEasyConfirmation()
    setEasyConfirmation(false)
    navigation.goBack()
  } catch (error) {
    await showErrorDialog((dialogs) => dialogs.general)
  }
}

const ToggleEasyConfirmationScreen = ({
  translations,
  isEasyConfirmationEnabled,
  enableEasyConfirmation,
  disableEasyConfirmation,
  cancelOperation,
  clearPassword,
  setMasterPassword,
  masterPassword,
}) => (
  <Screen scroll>
    <NavigationEvents onDidBlur={clearPassword} />
    <View style={styles.root}>
      {!isEasyConfirmationEnabled ? (
        <>
          <Text>
            l10n Enabling this option can made app less secure. This is
            compromise between UX and security!
          </Text>

          <Text>l10n Enter master password</Text>

          <ValidatedTextInput
            secureTextEntry
            onChange={setMasterPassword}
            value={masterPassword}
          />
        </>
      ) : (
        <Text>
          l10n By disabling this option you will be able to spend your ADA only
          with master password.
        </Text>
      )}

      <Button title="l10n Cancel" onPress={cancelOperation} />
      <Button
        title={`l10n ${isEasyConfirmationEnabled ? 'Disable' : 'Enable'}`}
        onPress={
          isEasyConfirmationEnabled
            ? disableEasyConfirmation
            : enableEasyConfirmation
        }
        disabled={!masterPassword && !isEasyConfirmationEnabled}
      />
    </View>
  </Screen>
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isEasyConfirmationEnabled: easyConfirmationSelector(state),
    }),
    {setEasyConfirmation},
  ),
  withState('masterPassword', 'setMasterPassword', ''),
  withHandlers({
    enableEasyConfirmation,
    disableEasyConfirmation,
    clearPassword: ({setMasterPassword}) => () => setMasterPassword(''),
    cancelOperation: ({navigation}) => () => navigation.goBack(),
  }),
)(ToggleEasyConfirmationScreen)
