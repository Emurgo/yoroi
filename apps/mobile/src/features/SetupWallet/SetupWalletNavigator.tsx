import {createStackNavigator} from '@react-navigation/stack'
// import {useTheme} from '@yoroi/theme'
import * as React from 'react'

/* import {
  defaultStackNavigationOptions,
  WalletInitRoutes,
} from '~/kernel/navigation' */
// import {NetworkTag} from '../Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {PreparingWalletScreen} from './common/PreparingWalletScreen/PreparingWalletScreen'
import {ImportReadOnlyWalletScreen} from './legacy/ImportReadOnlyWallet/ImportReadOnlyWalletScreen'
import {SaveReadOnlyWalletScreen} from './legacy/SaveReadOnlyWallet/SaveReadOnlyWalletScreen'
import {ChooseMnemonicTypeScreen} from './useCases/ChooseMnemonicType/ChooseMnemonicTypeScreen'
import {ChooseSetupTypeScreen} from './useCases/ChooseSetupType/ChooseSetupTypeScreen'
import {AboutRecoveryPhraseScreen} from './useCases/CreateWallet/AboutRecoveryPhraseScreen'
import {RecoveryPhraseScreen} from './useCases/CreateWallet/RecoveryPhraseScreen'
import {VerifyRecoveryPhraseScreen} from './useCases/CreateWallet/VerifyRecoveryPhraseScreen'
import {WalletDetailsScreen} from './useCases/CreateWallet/WalletDetailsScreen'
// import {ConnectNanoXScreen} from './useCases/RestoreHwWallet/ConnectNanoXScreen'
import {useStrings} from '~/kernel/i18n/useStrings'
import {RestoreWalletDetailsScreen} from './useCases/RestoreWallet/RestoreWalletDetailsScreen'
import {RestoreWalletScreen} from './useCases/RestoreWallet/RestoreWalletScreen'

const Stack = createStackNavigator<any /* WalletInitRoutes */>()
export const SetupWalletNavigator = () => {
  const strings = useStrings()
  // const {atoms: ta, palette: p} = useTheme()

  /* const navigationOptions = React.useMemo(
    () => defaultStackNavigationOptions(ta, p),
    [ta, p],
  )
 */
  return (
    <Stack.Navigator
      screenOptions={
        {
          // ...navigationOptions,
          // headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
        }
      }
    >
      <Stack.Screen
        name="setup-wallet-choose-setup-type-init"
        component={ChooseSetupTypeScreen}
        options={{
          title: strings.setupWallet.navigator.addNewWalletTitle,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="setup-wallet-choose-setup-type"
        component={ChooseSetupTypeScreen}
        options={{title: strings.setupWallet.navigator.addNewWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-choose-mnemonic-type"
        component={ChooseMnemonicTypeScreen}
        options={{title: strings.setupWallet.navigator.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-details-form"
        component={WalletDetailsScreen}
        options={{
          /* ...navigationOptions,  */ title:
            strings.setupWallet.navigator.createWalletTitle,
        }}
      />

      <Stack.Screen
        name="setup-wallet-restore-form"
        component={RestoreWalletScreen}
        options={{title: strings.setupWallet.navigator.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-restore-details"
        component={RestoreWalletDetailsScreen}
        options={{title: strings.setupWallet.navigator.restoreWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-import-read-only"
        component={ImportReadOnlyWalletScreen}
        options={{
          title: strings.setupWallet.navigator.importReadOnlyTitle,
          headerTransparent: true,
        }}
      />

      <Stack.Screen
        name="setup-wallet-save-read-only"
        component={SaveReadOnlyWalletScreen}
        options={{title: strings.setupWallet.navigator.saveReadOnlyWalletTitle}}
      />
      {/*
      <Stack.Screen //
        name="setup-wallet-check-nano-x"
        component={CheckNanoXScreen}
        options={{title: strings.checkNanoXTitle}}
      /> */}

      {/* <Stack.Screen //
        name="setup-wallet-connect-nano-x"
        options={{title: strings.connectNanoXTitle}}
        component={ConnectNanoXScreenWrapper}
      /> */}

      {/* <Stack.Screen
        name="setup-wallet-save-nano-x"
        component={SaveNanoXScreen}
        options={{
          title: strings.saveNanoXTitle,
        }}
      /> */}

      <Stack.Screen //
        name="setup-wallet-about-recovery-phase"
        component={AboutRecoveryPhraseScreen}
        options={{title: strings.setupWallet.navigator.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-recovery-phrase-mnemonic"
        component={RecoveryPhraseScreen}
        options={{title: strings.setupWallet.navigator.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-verify-recovery-phrase-mnemonic"
        component={VerifyRecoveryPhraseScreen}
        options={{title: strings.setupWallet.navigator.createWalletTitle}}
      />

      <Stack.Screen
        name="setup-wallet-preparing-wallet"
        component={PreparingWalletScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

/* const ConnectNanoXScreenWrapper = () => <ConnectNanoXScreen /> */
