import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useRevealRootKey, useSaveSecret} from '../../auth'
import {Button, StatusBar, Text, TextInput} from '../../components'
import {LoadingOverlay} from '../../components/LoadingOverlay'
import {useEnableEasyConfirmation} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {WrongPassword} from '../../legacy/errors'
import {isEmptyString} from '../../legacy/utils'
import {useSelectedWallet, useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {COLORS} from '../../theme'

export const EnableEasyConfirmationScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  const [rootPassword, setRootPassword] = React.useState('')
  const walletMeta = useSelectedWalletMeta()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const wallet = useSelectedWallet()
  const {saveSecret, isLoading: savingSecret} = useSaveSecret({
    onSuccess: () => enableEasyConfirmation(),
    onError: (error) => {
      throw error
    },
  })
  const {enableEasyConfirmation, isLoading: enablingEasyConfirmation} = useEnableEasyConfirmation({
    onSuccess: () => {
      if (!walletMeta) throw new Error('Missing walletMeta')
      setSelectedWalletMeta({
        ...walletMeta,
        isEasyConfirmationEnabled: true,
      })
      navigation.goBack()
    },
    onError: (error) => {
      throw error
    },
  })
  const {reveal, isLoading: revealing} = useRevealRootKey(
    {id: wallet.id, password: rootPassword},
    {
      onSuccess: (rootKey) =>
        saveSecret({
          key: wallet.id,
          value: rootKey,
        }),
      onError: (error) => {
        if (!(error instanceof WrongPassword)) throw error
        showErrorDialog(errorMessages.incorrectPassword, intl)
      },
    },
  )

  const isLoading = revealing || enablingEasyConfirmation || savingSecret

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <StatusBar type="dark" />

      <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={styles.contentContainer}>
        <Text style={styles.heading}>{strings.enableHeading}</Text>
        <Text style={styles.warning}>{strings.enableWarning}</Text>

        <TextInput
          autoFocus
          enablesReturnKeyAutomatically
          returnKeyType="done"
          secureTextEntry
          label={strings.enableRootPassword}
          onChangeText={setRootPassword}
          value={rootPassword}
          autoComplete={false}
        />
      </ScrollView>

      <View style={styles.actions}>
        <Button
          title={strings.enableButton}
          onPress={() => reveal()}
          disabled={isEmptyString(rootPassword) || isLoading}
        />
      </View>

      <LoadingOverlay loading={isLoading} />
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    enableHeading: intl.formatMessage(messages.enableHeading),
    enableWarning: intl.formatMessage(messages.enableWarning),
    enableRootPassword: intl.formatMessage(messages.enableRootPassword),
    enableButton: intl.formatMessage(messages.enableButton),
  }
}

const messages = defineMessages({
  enableHeading: {
    id: 'components.settings.enableeasyconfirmationscreen.enableHeading',
    defaultMessage:
      '!!!This option will allow you to send transactions ' +
      'from your wallet just by confirming with fingerprint or ' +
      'face recognition with standard system fallback option. ' +
      'This makes your wallet less secure. This is a compromise ' +
      'between UX and security!',
  },
  enableWarning: {
    id: 'components.settings.enableeasyconfirmationscreen.enableWarning',
    defaultMessage:
      '!!!Please remember your master password, as you may need it ' +
      'in case your biometrics data are removed from the device.',
  },
  enableRootPassword: {
    id: 'components.settings.enableeasyconfirmationscreen.enableMasterPassword',
    defaultMessage: '!!!Master password',
  },
  enableButton: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable',
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
    fontSize: 16,
    lineHeight: 24,
    paddingBottom: 20,
  },
  warning: {
    color: COLORS.RED,
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 20,
  },
  actions: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
})
