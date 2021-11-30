import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import CheckNanoXScreen from '../../legacy/components/WalletInit/ConnectNanoX/CheckNanoXScreen'
import ConnectNanoXScreen from '../../legacy/components/WalletInit/ConnectNanoX/ConnectNanoXScreen'
import SaveNanoXScreen from '../../legacy/components/WalletInit/ConnectNanoX/SaveNanoXScreen'
import MnemonicCheckScreen from '../../legacy/components/WalletInit/CreateWallet/MnemonicCheckScreen'
import SaveReadOnlyWalletScreen from '../../legacy/components/WalletInit/RestoreWallet/SaveReadOnlyWalletScreen'
import VerifyRestoredWallet from '../../legacy/components/WalletInit/RestoreWallet/VerifyRestoredWallet'
import WalletCredentialsScreen from '../../legacy/components/WalletInit/RestoreWallet/WalletCredentialsScreen'
import {isJormungandr} from '../../legacy/config/networks'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
  jormunNavigationOptions,
} from '../../legacy/navigationOptions'
import {WALLET_INIT_ROUTES} from '../../legacy/RoutesList'
import {CreateWalletScreen} from './CreateWalletScreen'
import {MnemonicShowScreen} from './MnemonicShowScreen'
import {ImportReadOnlyWalletScreen} from './RestoreWallet/ImportReadOnlyWalletScreen'
import {RestoreWalletScreen} from './RestoreWallet/RestoreWalletScreen'
import {WalletFreshInitScreen} from './WalletFreshInitScreen'
import {WalletInitScreen} from './WalletInitScreen'

/* eslint-disable @typescript-eslint/no-explicit-any */
const Stack = createStackNavigator<{
  'choose-create-restore': any
  'initial-choose-create-restore': any
  'create-wallet-form': any
  'restore-wallet-form': any
  'import-read-only': any
  'save-read-only': any
  'check-nano-x': any
  'connect-nano-x': any
  'save-nano-x': any
  'mnemoinc-show': any
  'mnemonic-check': any
  'wallet-account-checksum': any
  'wallet-credentials': any
}>()
/* eslint-enable @typescript-eslint/no-explicit-any */

export const WalletInitNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      initialRouteName={WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH}
      screenOptions={({route}) => {
        // note: jormun is currently not supported. If you want to add this
        // jormun style, make sure to pass the networkId as a route param
        const extraOptions = isJormungandr(route.params?.networkId) ? jormunNavigationOptions : {}

        return {
          cardStyle: {backgroundColor: 'transparent'},
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
          ...extraOptions,
        }
      }}
    >
      <Stack.Screen
        name={WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH}
        component={WalletFreshInitScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH}
        component={WalletInitScreen}
        options={{title: strings.addWalletTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.CREATE_WALLET}
        component={CreateWalletScreen}
        options={{title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.RESTORE_WALLET}
        component={RestoreWalletScreen}
        options={{title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.IMPORT_READ_ONLY_WALLET}
        component={ImportReadOnlyWalletScreen}
        options={{
          title: strings.importReadOnlyTitle,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.SAVE_READ_ONLY_WALLET}
        component={SaveReadOnlyWalletScreen}
        options={{title: strings.saveReadOnlyWalletTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.CHECK_NANO_X}
        component={CheckNanoXScreen}
        options={{title: strings.checkNanoXTitle}}
      />

      <Stack.Screen //
        name={WALLET_INIT_ROUTES.CONNECT_NANO_X}
        options={{title: strings.connectNanoXTitle}}
      >
        {(props) => <ConnectNanoXScreen {...props} defaultDevices={null} />}
      </Stack.Screen>

      <Stack.Screen
        name={WALLET_INIT_ROUTES.SAVE_NANO_X}
        component={SaveNanoXScreen}
        options={{
          title: strings.saveNanoXTitle,
        }}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.MNEMONIC_SHOW}
        component={MnemonicShowScreen}
        options={{title: strings.mnemonicShowTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.MNEMONIC_CHECK}
        component={MnemonicCheckScreen}
        options={{title: strings.mnemonicCheckTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET}
        component={VerifyRestoredWallet}
        options={{title: strings.verifyRestoredWalletTitle}}
      />

      <Stack.Screen
        name={WALLET_INIT_ROUTES.WALLET_CREDENTIALS}
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
