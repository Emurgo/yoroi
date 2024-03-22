import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {AboutRecoveryPhraseScreen} from '../features/AddWallet/useCases/CreateWallet/AboutRecoveryPhraseScreen'
import {RecoveryPhraseScreen} from '../features/AddWallet/useCases/CreateWallet/RecoveryPhraseScreen'
import {VerifyRecoveryPhraseScreen} from '../features/AddWallet/useCases/CreateWallet/VerifyRecoveryPhraseScreen'
import {WalletDetailsScreen} from '../features/AddWallet/useCases/CreateWallet/WalletDetailsScreen'
import {RestoreWalletDetailsScreen} from '../features/AddWallet/useCases/RestoreWallet/RestoreWalletDetailsScreen'
import {RestoreWalletScreen} from '../features/AddWallet/useCases/RestoreWallet/RestoreWalletScreen'
import {WalletInitScreen} from '../features/AddWallet/useCases/WalletInitScreen'
import {defaultStackNavigationOptions, DEPRECATED_defaultStackNavigationOptions, WalletInitRoutes} from '../navigation'
import {CheckNanoXScreen} from './CheckNanoX'
import {ConnectNanoXScreen} from './ConnectNanoX/ConnectNanoXScreen'
import {ImportReadOnlyWalletScreen} from './ImportReadOnlyWallet'
import {SaveNanoXScreen} from './SaveNanoX/SaveNanoXScreen'
import {SaveReadOnlyWalletScreen} from './SaveReadOnlyWallet'
import {VerifyRestoredWalletScreen} from './VerifyRestoredWallet'
import {WalletCredentialsScreen} from './WalletCredentials'
import {WalletFreshInitScreen} from './WalletFreshInit'

const Stack = createStackNavigator<WalletInitRoutes>()
export const WalletInitNavigator = () => {
  const strings = useStrings()
  const {theme} = useTheme()

  return (
    <Stack.Navigator
      initialRouteName="initial-choose-create-restore"
      screenOptions={{
        cardStyle: {backgroundColor: 'transparent'},
        ...defaultStackNavigationOptions(theme),
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
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
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.addWalletTitle}}
      />

      <Stack.Screen
        name="wallet-details-form"
        component={WalletDetailsScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.createWalletTitle}}
      />

      <Stack.Screen
        name="restore-wallet-form"
        component={RestoreWalletScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.restoreWalletTitle}}
      />

      <Stack.Screen
        name="restore-wallet-details"
        component={RestoreWalletDetailsScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.restoreWalletTitle}}
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

      <Stack.Screen //
        name="check-nano-x"
        component={CheckNanoXScreen}
        options={{title: strings.checkNanoXTitle}}
      />

      <Stack.Screen //
        name="connect-nano-x"
        options={{title: strings.connectNanoXTitle}}
        component={ConnectNanoXScreenWrapper}
      />

      <Stack.Screen
        name="save-nano-x"
        component={SaveNanoXScreen}
        options={{
          title: strings.saveNanoXTitle,
        }}
      />

      <Stack.Screen //
        name="about-recovery-phase"
        component={AboutRecoveryPhraseScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.mnemonicShowTitle}}
      />

      <Stack.Screen
        name="recovery-phrase-mnemonic"
        component={RecoveryPhraseScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.mnemonicShowTitle}}
      />

      <Stack.Screen
        name="verify-recovery-phrase-mnemonic"
        component={VerifyRecoveryPhraseScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.mnemonicCheckTitle}}
      />

      <Stack.Screen
        name="wallet-restore-wallet-checksum"
        component={VerifyRestoredWalletScreen}
        options={{...DEPRECATED_defaultStackNavigationOptions, title: strings.verifyRestoredWalletTitle}}
      />

      <Stack.Screen
        name="wallet-credentials"
        component={WalletCredentialsScreen}
        options={{title: strings.walletCredentialsTitle}}
      />
    </Stack.Navigator>
  )
}

const ConnectNanoXScreenWrapper = () => <ConnectNanoXScreen />

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
