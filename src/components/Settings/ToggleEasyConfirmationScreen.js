// @flow

import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {View, ScrollView} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import walletManager from '../../crypto/walletManager'
import {Text, Button, TextInput, StatusBar} from '../UiKit'
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
  },
  enableWarning: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableWarning',
    defaultMessage:
      '!!!Please remember your master password, as you may need it ' +
      'in case your biometrics data are removed from the device.',
  },
  enableMasterPassword: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableMasterPassword',
    defaultMessage: '!!!Master password',
  },
  enableButton: {
    id: 'components.settings.toggleeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable',
  },
  disableHeading: {
    id: 'components.settings.toggleeasyconfirmationscreen.disableHeading',
    defaultMessage: '!!!By disabling this option you will be able to spend your assets only with your master password.',
  },
  disableButton: {
    id: 'components.settings.toggleeasyconfirmationscreen.disableButton',
    defaultMessage: '!!!Disable',
  },
})

const ToggleEasyConfirmationScreen = ({intl, navigation}: {intl: IntlShape} & Object /* TODO: type */) => {
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const dispatch = useDispatch()
  const [masterPassword, setMasterPassword] = React.useState('')
  const clearPassword = () => setMasterPassword('')
  const enableEasyConfirmation = async () => {
    try {
      await walletManager.enableEasyConfirmation(masterPassword, intl)
      dispatch(setEasyConfirmation(true))

      navigation.goBack()
    } catch (error) {
      if (error instanceof WrongPassword) {
        await showErrorDialog(errorMessages.incorrectPassword, intl)
      } else {
        throw error
      }
    }
  }

  const disableEasyConfirmation = async () => {
    await walletManager.disableEasyConfirmation()
    dispatch(setEasyConfirmation(false))
    navigation.goBack()
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearPassword()
    })
    return unsubscribe
  }, [navigation])

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      {!isEasyConfirmationEnabled ? (
        <ScrollView
          // bounces={false}
          keyboardShouldPersistTaps={'always'}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.heading}>{intl.formatMessage(messages.enableHeading)}</Text>
          <Text style={styles.warning}>{intl.formatMessage(messages.enableWarning)}</Text>

          <TextInput
            autoFocus
            enablesReturnKeyAutomatically
            returnKeyType={'done'}
            secureTextEntry
            label={intl.formatMessage(messages.enableMasterPassword)}
            onChangeText={setMasterPassword}
            value={masterPassword}
          />
        </ScrollView>
      ) : (
        <View style={[styles.disableSection]}>
          <Text style={styles.heading}>{intl.formatMessage(messages.disableHeading)}</Text>
        </View>
      )}

      <View style={styles.actions}>
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
    </View>
  )
}

export default injectIntl(ToggleEasyConfirmationScreen)
