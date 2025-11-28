import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {ScanCodeScreen} from '~/features/Scan/useCases/ScanCodeScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultStackNavigationOptions} from '~/kernel/navigation/common/helpers'
import {WalletInitRoutes} from '~/kernel/navigation/types'

import {NetworkTag} from '../Settings/ui/shared/NetworkTag'
import {PreparingWalletScreen} from './common/PreparingWalletScreen/PreparingWalletScreen'
import {ChooseMnemonicTypeScreen} from './useCases/ChooseMnemonicType/ChooseMnemonicTypeScreen'
import {ChooseSetupTypeScreen} from './useCases/ChooseSetupType/ChooseSetupTypeScreen'
import {AboutRecoveryPhraseScreen} from './useCases/CreateWallet/AboutRecoveryPhraseScreen'
import {RecoveryPhraseScreen} from './useCases/CreateWallet/RecoveryPhraseScreen'
import {VerifyRecoveryPhraseScreen} from './useCases/CreateWallet/VerifyRecoveryPhraseScreen'
import {WalletDetailsScreen} from './useCases/CreateWallet/WalletDetailsScreen'
import {CheckNanoXScreen} from './useCases/RestoreHwWallet/CheckNanoXScreen'
import {ConnectNanoXScreen} from './useCases/RestoreHwWallet/ConnectNanoXScreen'
import {SaveNanoXScreen} from './useCases/RestoreHwWallet/SaveNanoXScreen'
import {RestoreReadOnlyWalletChooseTypeScreen} from './useCases/RestoreReadOnlyWallet/RestoreReadOnlyWalletChooseTypeScreen'
import {RestoreReadOnlyWalletFromAddressesScreen} from './useCases/RestoreReadOnlyWallet/RestoreReadOnlyWalletFromAddressesScreen'
import {RestoreReadOnlyWalletFromKeyScreen} from './useCases/RestoreReadOnlyWallet/RestoreReadOnlyWalletFromKeyScreen'
import {RestoreWalletDetailsScreen} from './useCases/RestoreWallet/RestoreWalletDetailsScreen'
import {RestoreWalletScreen} from './useCases/RestoreWallet/RestoreWalletScreen'
import {RestoreWalletFromLinkScreen} from './useCases/RestoreWalletFromLink/RestoreWalletFromLinkScreen'

const Stack = createStackNavigator<WalletInitRoutes>()
export const SetupWalletNavigator = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(p),
    [p],
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationOptions,
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <Stack.Screen
        name="setup-wallet-choose-setup-type-init"
        getComponent={() => ChooseSetupTypeScreen}
        options={{
          title: strings.setupWallet.addNewWalletTitle,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="setup-wallet-choose-setup-type"
        getComponent={() => ChooseSetupTypeScreen}
        options={{title: strings.setupWallet.addNewWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-choose-mnemonic-type"
        getComponent={() => ChooseMnemonicTypeScreen}
        options={{title: strings.setupWallet.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-details-form"
        getComponent={() => WalletDetailsScreen}
        options={{
          title: strings.setupWallet.createWalletTitle,
        }}
      />

      <Stack.Screen
        name="setup-wallet-restore-form"
        getComponent={() => RestoreWalletScreen}
        options={{title: strings.setupWallet.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-details"
        getComponent={() => RestoreWalletDetailsScreen}
        options={{title: strings.setupWallet.restoreWalletTitle}}
      />

      <Stack.Screen //
        name="setup-wallet-check-nano-x"
        getComponent={() => CheckNanoXScreen}
        options={{title: strings.setupWallet.checkNanoXTitle}}
      />

      <Stack.Screen //
        name="setup-wallet-connect-nano-x"
        options={{title: strings.setupWallet.connectNanoXTitle}}
        getComponent={() => ConnectNanoXScreenWrapper}
      />

      <Stack.Screen
        name="setup-wallet-save-nano-x"
        getComponent={() => SaveNanoXScreen}
        options={{
          title: strings.setupWallet.saveNanoXTitle,
        }}
      />

      <Stack.Screen //
        name="setup-wallet-about-recovery-phase"
        getComponent={() => AboutRecoveryPhraseScreen}
        options={{title: strings.setupWallet.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-recovery-phrase-mnemonic"
        getComponent={() => RecoveryPhraseScreen}
        options={{title: strings.setupWallet.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-verify-recovery-phrase-mnemonic"
        getComponent={() => VerifyRecoveryPhraseScreen}
        options={{title: strings.setupWallet.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-preparing-wallet"
        getComponent={() => PreparingWalletScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="setup-wallet-restore-from-link"
        getComponent={() => RestoreWalletFromLinkScreen}
        options={{title: strings.setupWallet.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-read-only-choose-type"
        getComponent={() => RestoreReadOnlyWalletChooseTypeScreen}
        options={{title: 'Restore Read-Only Wallet'}}
      />

      <Stack.Screen
        name="setup-wallet-restore-read-only-from-key"
        getComponent={() => RestoreReadOnlyWalletFromKeyScreen}
        options={{title: 'Restore Read-Only Wallet'}}
      />

      <Stack.Screen
        name="setup-wallet-restore-read-only-from-addresses"
        getComponent={() => RestoreReadOnlyWalletFromAddressesScreen}
        options={{title: 'Restore Read-Only Wallet'}}
      />

      <Stack.Screen
        name="setup-wallet-scan-qr-code"
        getComponent={() => ScanCodeScreen}
        options={{
          title: strings.setupWallet.scanQrCodeTitle,
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  )
}

const ConnectNanoXScreenWrapper = () => (
  <ConnectNanoXScreen defaultDevices={[]} />
)
