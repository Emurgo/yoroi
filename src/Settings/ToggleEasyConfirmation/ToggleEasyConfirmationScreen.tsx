import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {Button, StatusBar, Text, TextInput} from '../../components'
import {errorMessages} from '../../i18n/global-messages'
import {setEasyConfirmation, showErrorDialog} from '../../legacy/actions'
import {WrongPassword} from '../../legacy/errors'
import {easyConfirmationSelector} from '../../legacy/selectors'
import {useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {walletManager} from '../../yoroi-wallets'

export const ToggleEasyConfirmationScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const isEasyConfirmationEnabled = useSelector(easyConfirmationSelector)
  const dispatch = useDispatch()
  const [masterPassword, setMasterPassword] = React.useState('')
  const clearPassword = () => setMasterPassword('')
  const walletMeta = useSelectedWalletMeta()
  const selectedWalletMeta = useSetSelectedWalletMeta()

  const enableEasyConfirmation = async () => {
    try {
      await walletManager.enableEasyConfirmation(masterPassword, intl)
      dispatch(setEasyConfirmation(true))
      if (!walletMeta) throw new Error('Missing walletMeta')
      selectedWalletMeta({
        ...walletMeta,
        isEasyConfirmationEnabled: true,
      })
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
    if (!walletMeta) throw new Error('Missing walletMeta')
    selectedWalletMeta({
      ...walletMeta,
      isEasyConfirmationEnabled: false,
    })
    navigation.goBack()
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearPassword()
    })
    return unsubscribe
  }, [navigation])

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <StatusBar type="dark" />

      {!isEasyConfirmationEnabled ? (
        <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={styles.contentContainer}>
          <Text style={styles.heading}>{strings.enableHeading}</Text>
          <Text style={styles.warning}>{strings.enableWarning}</Text>

          <TextInput
            autoFocus
            enablesReturnKeyAutomatically
            returnKeyType="done"
            secureTextEntry
            label={strings.enableMasterPassword}
            onChangeText={setMasterPassword}
            value={masterPassword}
            autoComplete={false}
          />
        </ScrollView>
      ) : (
        <View style={[styles.disableSection]}>
          <Text style={styles.heading}>{strings.disableHeading}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title={isEasyConfirmationEnabled ? strings.disableButton : strings.enableButton}
          onPress={isEasyConfirmationEnabled ? disableEasyConfirmation : enableEasyConfirmation}
          disabled={!masterPassword && !isEasyConfirmationEnabled}
        />
      </View>
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    enableHeading: intl.formatMessage(messages.enableHeading),
    enableWarning: intl.formatMessage(messages.enableWarning),
    enableMasterPassword: intl.formatMessage(messages.enableMasterPassword),
    enableButton: intl.formatMessage(messages.enableButton),
    disableHeading: intl.formatMessage(messages.disableHeading),
    disableButton: intl.formatMessage(messages.disableButton),
  }
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 20,
  },
  warning: {
    color: COLORS.RED,
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 20,
  },
  disableSection: {
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
})
