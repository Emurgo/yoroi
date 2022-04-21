import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {defaultStackNavigationOptions, WalletInitRoutes} from '../navigation'
import {CheckNanoXScreen} from './CheckNanoX'
import {ConnectNanoXScreen} from './ConnectNanoX/ConnectNanoXScreen'
import {CreateWalletScreen} from './CreateWallet'
import {ImportReadOnlyWalletScreen} from './ImportReadOnlyWallet'
import {MnemonicCheckScreen} from './MnemonicCheck'
import {MnemonicShowScreen} from './MnemonicShow'
import {RestoreWalletScreen} from './RestoreWallet'
import {SaveNanoXScreen} from './SaveNanoX/SaveNanoXScreen'
import {SaveReadOnlyWalletScreen} from './SaveReadOnlyWallet'
import {VerifyRestoredWalletScreen} from './VerifyRestoredWallet'
import {WalletCredentialsScreen} from './WalletCredentials'
import {WalletFreshInitScreen} from './WalletFreshInit'
import {WalletInitScreen} from './WalletInit'

const Stack = createStackNavigator<WalletInitRoutes>()
export const WalletInitNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName="initial-choose-create-restore"
      screenOptions={{
        cardStyle: {backgroundColor: 'transparent'},
        ...defaultStackNavigationOptions,
      }}
    >
      <Stack.Screen
        name="initial-choose-create-restore"
        component={WalletFreshInitScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="choose-create-restore"
        component={WalletInitScreen}
        options={{title: strings.addWalletTitle}}
      />

      <Stack.Screen
        name="create-wallet-form"
        component={CreateWalletScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="restore-wallet-form"
        component={RestoreWalletScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="import-read-only"
        component={ImportReadOnlyWalletScreen}
        options={{
          title: strings.importReadOnlyTitle,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="save-read-only"
        component={SaveReadOnlyWalletScreen}
        options={{title: strings.saveReadOnlyWalletTitle}}
      />

      <Stack.Screen // prettier-ignore
        name="check-nano-x"
        component={CheckNanoXScreen}
        options={{title: strings.checkNanoXTitle}}
      />

      <Stack.Screen // prettier-ignore
        name="connect-nano-x"
        options={{title: strings.connectNanoXTitle}}
        component={ConnectNanoXScreen}
      />

      <Stack.Screen
        name="save-nano-x"
        component={SaveNanoXScreen}
        options={{
          title: strings.saveNanoXTitle,
        }}
      />

      <Stack.Screen // prettier-ignore
        name="mnemoinc-show"
        component={MnemonicShowScreen}
        options={{title: strings.mnemonicShowTitle}}
      />

      <Stack.Screen
        name="mnemonic-check"
        component={MnemonicCheckScreen}
        options={{title: strings.mnemonicCheckTitle}}
      />

      <Stack.Screen
        name="wallet-account-checksum"
        component={VerifyRestoredWalletScreen}
        options={{title: strings.verifyRestoredWalletTitle}}
      />

      <Stack.Screen
        name="wallet-credentials"
        component={WalletCredentialsScreen}
        options={{title: strings.walletCredentialsTitle}}
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
