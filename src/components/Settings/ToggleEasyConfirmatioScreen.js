// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers, withStateHandlers} from 'recompose'
import {View, ScrollView} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import walletManager from '../../crypto/walletManager'
import {Text, Button, ValidatedTextInput, StatusBar} from '../UiKit'
import {setEasyConfirmation, showErrorDialog} from '../../actions'
import {easyConfirmationSelector} from '../../selectors'
import {WrongPassword} from '../../crypto/errors'

import styles from './styles/ToggleEasyConfirmationScreen.style'
import {errorMessages} from '../../i18n/global-messages'

const messages = defineMessages({
  enableHeading: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableHeading',
    defaultMessage:
      '!!!This option will allow you to send transactions ' +
      'from your wallet just by confirming with fingerprint or ' +
      'face recognition with standard system fallback option. ' +
      'This makes your wallet less secure. This is a compromise ' +
      'between UX and security!',
    description: 'some desc',
  },
  enableWarning: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableWarning',
    defaultMessage:
      'Please remember your master password, as you may need it ' +
      'in case your biometrics data are removed from the device.',
    description: 'some desc',
  },
  enableMasterPassword: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableMasterPassword',
    defaultMessage: 'Master password',
    description: 'some desc',
  },
  enableButton: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableButton',
    defaultMessage: 'Enable',
    description: 'some desc',
  },
  disableHeading: {
    id: 'components.settings.toggleeasyconfirmationscreen.disableHeading',
    defaultMessage: 'By disabling this option you will be able to spend your assets only with your master password.',
  },
  disableButton: {
    id: 'components.settings.toggleeasyconfirmationscreen.disableButton',
    defaultMessage: 'Disable',
  },
})

const enableEasyConfirmation =
  ({navigation, masterPassword, setEasyConfirmation, intl}) =>
  async () => {
    try {
      await walletManager.enableEasyConfirmation(masterPassword, intl)
      setEasyConfirmation(true)

      navigation.goBack()
    } catch (error) {
      if (error instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        throw error
      }
    }
  }

const disableEasyConfirmation =
  ({navigation}) =>
  async () => {
    await walletManager.disableEasyConfirmation()
    setEasyConfirmation(false)
    navigation.goBack()
  }

const ToggleEasyConfirmationScreen = (
  {
    intl,
    isEasyConfirmationEnabled,
    enableEasyConfirmation,
    disableEasyConfirmation,
    clearPassword,
    setMasterPassword,
    masterPassword,
    navigation,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => {
  React.useEffect(
    () => {
      const unsubscribe = navigation.addListener('blur', () => {
        clearPassword()
      })
      return unsubscribe
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  )

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

      {!isEasyConfirmationEnabled ? (
        <ScrollView keyboardDismissMode="on-drag">
          <Text style={styles.heading}>{intl.formatMessage(messages.enableHeading)}</Text>
          <Text style={styles.warning}>{intl.formatMessage(messages.enableWarning)}</Text>

          <ValidatedTextInput
            secureTextEntry
            label={intl.formatMessage(messages.enableMasterPassword)}
            onChangeText={setMasterPassword}
            value={masterPassword}
          />
        </ScrollView>
      ) : (
        <View style={[styles.main, styles.mainCentered]}>
          <Text style={styles.heading}>{intl.formatMessage(messages.disableHeading)}</Text>
        </View>
      )}

      <Button
        title={
          isEasyConfirmationEnabled
            ? intl.formatMessage(messages.disableButton)
            : intl.formatMessage(messages.enableButton)
        }
        onPress={isEasyConfirmationEnabled ? disableEasyConfirmation : enableEasyConfirmation}
        disabled={!masterPassword && !isEasyConfirmationEnabled}
      />
    </View>
  )
}

export default injectIntl(
  compose(
    connect(
      (state) => ({
        isEasyConfirmationEnabled: easyConfirmationSelector(state),
      }),
      {setEasyConfirmation},
    ),
    withStateHandlers(
      {masterPassword: ''},
      {
        setMasterPassword: () => (masterPassword) => ({masterPassword}),
        clearPassword: () => () => ({masterPassword: ''}),
      },
    ),
    withHandlers({
      enableEasyConfirmation,
      disableEasyConfirmation,
    }),
  )(ToggleEasyConfirmationScreen),
)
