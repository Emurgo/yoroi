import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar, Text} from '../../components'
import {useDisableEasyConfirmation} from '../../hooks'
import {useSelectedWallet, useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../SelectedWallet'

export const DisableEasyConfirmationScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const walletMeta = useSelectedWalletMeta()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const {disableEasyConfirmation, isLoading} = useDisableEasyConfirmation(wallet, {
    onSuccess: () => {
      if (!walletMeta) throw new Error('Missing walletMeta')
      setSelectedWalletMeta({
        ...walletMeta,
        isEasyConfirmationEnabled: false,
      })
      navigation.goBack()
    },
  })

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <StatusBar type="dark" />

      <View style={[styles.disableSection]}>
        <Text style={styles.heading}>{strings.disableHeading}</Text>
      </View>

      <View style={styles.actions}>
        <Button title={strings.disableButton} onPress={() => disableEasyConfirmation()} disabled={isLoading} />
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
  heading: {
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
