import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {
  defaultStackNavigationOptions,
  DEPRECATED_defaultStackNavigationOptions,
  WalletInitRoutes,
} from '../../navigation'
import {BiometricScreen} from './useCases/BiometricScreen'
import {AboutRecoveryPhrase} from './useCases/CreateWallet/AboutRecoveryPhrase'
import {RecoveryPhrase} from './useCases/CreateWallet/RecoveryPhrase'
import {VerifyRecoveryPhrase} from './useCases/CreateWallet/VerifyRecoveryPhrase'
import {NewWalletScreenNighlty} from './useCases/NewWalletScreenNighlty'
import {WalletInitScreen} from './useCases/WalletInitScreen'

const Stack = createStackNavigator<WalletInitRoutes>()

export const WalletInitNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="biometrics-screen"
      screenOptions={{
        cardStyle: {backgroundColor: 'transparent'},
        ...defaultStackNavigationOptions,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      <Stack.Screen name="biometrics-screen" component={BiometricScreen} options={{headerShown: false}} />

      <Stack.Screen
        name="initial-choose-create-restore"
        component={WalletInitScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.addWalletTitle}}
      />

      <Stack.Screen
        name="choose-create-restore"
        component={NewWalletScreenNighlty}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.addWalletTitle}}
      />

      <Stack.Screen
        name="about-recovery-phrase"
        component={AboutRecoveryPhrase}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="save-recovery-phrase"
        component={RecoveryPhrase}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="verify-recovery-phrase"
        component={VerifyRecoveryPhrase}
        options={{title: strings.createWalletTitle}}
      />
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  addWalletTitle: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add wallet',
  },
  createWalletTitle: {
    id: 'components.walletinit.createwallet.createwalletscreen.title',
    defaultMessage: '!!!Create a new wallet',
  },
  restoreWalletTitle: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.title',
    defaultMessage: '!!!Restore wallet',
  },
  importReadOnlyTitle: {
    id: 'components.walletinit.importreadonlywalletscreen.title',
    defaultMessage: '!!!Read-only Wallet',
  },
  saveReadOnlyWalletTitle: {
    id: 'components.walletinit.savereadonlywalletscreen.title',
    defaultMessage: '!!!Verify read-only wallet',
  },
  mnemonicShowTitle: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  mnemonicCheckTitle: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.title',
    defaultMessage: '!!!Recovery phrase',
  },
  verifyRestoredWalletTitle: {
    id: 'components.walletinit.verifyrestoredwallet.title',
    defaultMessage: '!!!Verify restored wallet',
  },
  walletCredentialsTitle: {
    id: 'components.walletinit.restorewallet.walletcredentialsscreen.title',
    defaultMessage: '!!!Wallet credentials',
  },
  connectNanoXTitle: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  checkNanoXTitle: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Connect to Ledger Device',
  },
  saveNanoXTitle: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Save wallet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    addWalletTitle: intl.formatMessage(messages.addWalletTitle),
    createWalletTitle: intl.formatMessage(messages.createWalletTitle),
    restoreWalletTitle: intl.formatMessage(messages.restoreWalletTitle),
    importReadOnlyTitle: intl.formatMessage(messages.importReadOnlyTitle),
    saveReadOnlyWalletTitle: intl.formatMessage(messages.saveReadOnlyWalletTitle),
    mnemonicShowTitle: intl.formatMessage(messages.mnemonicShowTitle),
    mnemonicCheckTitle: intl.formatMessage(messages.mnemonicCheckTitle),
    verifyRestoredWalletTitle: intl.formatMessage(messages.verifyRestoredWalletTitle),
    walletCredentialsTitle: intl.formatMessage(messages.walletCredentialsTitle),
    connectNanoXTitle: intl.formatMessage(messages.connectNanoXTitle),
    checkNanoXTitle: intl.formatMessage(messages.checkNanoXTitle),
    saveNanoXTitle: intl.formatMessage(messages.saveNanoXTitle),
  }
}
