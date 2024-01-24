import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar, Text} from '../../../components'
import {LoadingOverlay} from '../../../components/LoadingOverlay'
import {useSelectedWallet, useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../../SelectedWallet'
import {useDisableEasyConfirmation} from '../../../yoroi-wallets/hooks'

export const DisableEasyConfirmationScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const wallet = useSelectedWallet()
  const walletMeta = useSelectedWalletMeta()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  if (!walletMeta) throw new Error('Missing walletMeta')
  const {disableEasyConfirmation, isLoading} = useDisableEasyConfirmation(wallet, {
    onSuccess: () => {
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
        <Button
          title={strings.disableButton}
          onPress={() => disableEasyConfirmation()}
          disabled={isLoading}
          shelleyTheme
        />
      </View>

      <LoadingOverlay loading={isLoading} />
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    disableHeading: intl.formatMessage(messages.disableHeading),
    disableButton: intl.formatMessage(messages.disableButton),
  }
}

const messages = defineMessages({
  disableHeading: {
    id: 'components.settings.disableeasyconfirmationscreen.disableHeading',
    defaultMessage: '!!!By disabling this option you will be able to spend your assets only with your master password.',
  },
  disableButton: {
    id: 'components.settings.disableeasyconfirmationscreen.disableButton',
    defaultMessage: '!!!Disable',
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 16,
    lineHeight: 24,
  },
  disableSection: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  actions: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
})
