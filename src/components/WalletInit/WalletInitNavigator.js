// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import WalletFreshInitScreen from './WalletFreshInitScreen'
import WalletInitScreen from './WalletInitScreen'
import CreateWalletScreen from './CreateWallet/CreateWalletScreen'
import RestoreWalletScreen from './RestoreWallet/RestoreWalletScreen'
import ImportReadOnlyWalletScreen from './RestoreWallet/ImportReadOnlyWalletScreen'
import SaveReadOnlyWalletScreen from './RestoreWallet/SaveReadOnlyWalletScreen'
import CheckNanoXScreen from './ConnectNanoX/CheckNanoXScreen'
import ConnectNanoXScreen from './ConnectNanoX/ConnectNanoXScreen'
import SaveNanoXScreen from './ConnectNanoX/SaveNanoXScreen'
import MnemonicShowScreen from './CreateWallet/MnemonicShowScreen'
import CatalystStep1 from '../Catalyst/Step1'
import CatalystStep2 from '../Catalyst/Step2'
import CatalystStep3 from '../Catalyst/Step3'
import CatalystStep4 from '../Catalyst/Step4'

import {
  defaultNavigationOptions,
  jormunNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import MnemonicCheckScreen from './CreateWallet/MnemonicCheckScreen'
import VerifyRestoredWallet from './RestoreWallet/VerifyRestoredWallet'
import WalletCredentialsScreen from './RestoreWallet/WalletCredentialsScreen'
import {WALLET_INIT_ROUTES, CATALYST_ROUTES} from '../../RoutesList'
import {isJormungandr} from '../../config/networks'

const Stack = createStackNavigator()

const WalletInitNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH}
    screenOptions={({route}) => {
      // note: jormun is currently not supported. If you want to add this
      // jormun style, make sure to pass the networkId as a route param
      const extraOptions = isJormungandr(route.params?.networkId)
        ? jormunNavigationOptions
        : {}
      return {
        cardStyle: {
          backgroundColor: 'transparent',
        },
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
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.CREATE_WALLET}
      component={CreateWalletScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.RESTORE_WALLET}
      component={RestoreWalletScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.IMPORT_READ_ONLY_WALLET}
      component={ImportReadOnlyWalletScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.SAVE_READ_ONLY_WALLET}
      component={SaveReadOnlyWalletScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.CHECK_NANO_X}
      component={CheckNanoXScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.CONNECT_NANO_X}
      component={ConnectNanoXScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.SAVE_NANO_X}
      component={SaveNanoXScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.MNEMONIC_SHOW}
      component={MnemonicShowScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.MNEMONIC_CHECK}
      component={MnemonicCheckScreen}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET}
      component={VerifyRestoredWallet}
    />
    <Stack.Screen
      name={WALLET_INIT_ROUTES.WALLET_CREDENTIALS}
      component={WalletCredentialsScreen}
    />
    <Stack.Screen name={CATALYST_ROUTES.STEP1} component={CatalystStep1} />
    <Stack.Screen name={CATALYST_ROUTES.STEP2} component={CatalystStep2} />
    <Stack.Screen name={CATALYST_ROUTES.STEP3} component={CatalystStep3} />
    <Stack.Screen name={CATALYST_ROUTES.STEP4} component={CatalystStep4} />
  </Stack.Navigator>
)

export default WalletInitNavigator
