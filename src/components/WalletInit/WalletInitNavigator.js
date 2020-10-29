// @flow
import React from 'react'
import {createStackNavigator} from '@react-navigation/stack'

import WalletFreshInitScreen from './WalletFreshInitScreen'
import WalletInitScreen from './WalletInitScreen'
import CreateWalletScreen from './CreateWallet/CreateWalletScreen'
import RestoreWalletScreen from './RestoreWallet/RestoreWalletScreen'
import CheckNanoXScreen from './ConnectNanoX/CheckNanoXScreen'
import ConnectNanoXScreen from './ConnectNanoX/ConnectNanoXScreen'
import SaveNanoXScreen from './ConnectNanoX/SaveNanoXScreen'
import MnemonicShowScreen from './CreateWallet/MnemonicShowScreen'
import HeaderBackButton from '../UiKit/HeaderBackButton'
import {
  defaultNavigationOptions,
  jormunNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'
import MnemonicCheckScreen from './CreateWallet/MnemonicCheckScreen'
import VerifyRestoredWallet from './RestoreWallet/VerifyRestoredWallet'
import WalletCredentialsScreen from './RestoreWallet/WalletCredentialsScreen'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
// eslint-disable-next-line max-len
import WalletSelectionScreen from '../../components/WalletSelection/WalletSelectionScreen'
import {isJormungandr} from '../../config/networks'

// TODO: remove
const _WalletInitNavigator = // createStackNavigator(
[
  {
    [WALLET_INIT_ROUTES.WALLET_SELECTION]: {
      screen: WalletSelectionScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH]: {
      screen: WalletFreshInitScreen,
      navigationOptions: {
        header: null,
      },
    },
    [WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH]: {
      screen: WalletInitScreen,
    },
    [WALLET_INIT_ROUTES.CREATE_WALLET]: CreateWalletScreen,
    [WALLET_INIT_ROUTES.RESTORE_WALLET]: RestoreWalletScreen,
    [WALLET_INIT_ROUTES.CHECK_NANO_X]: CheckNanoXScreen,
    [WALLET_INIT_ROUTES.CONNECT_NANO_X]: ConnectNanoXScreen,
    [WALLET_INIT_ROUTES.SAVE_NANO_X]: SaveNanoXScreen,
    [WALLET_INIT_ROUTES.MNEMONIC_SHOW]: MnemonicShowScreen,
    [WALLET_INIT_ROUTES.MNEMONIC_CHECK]: MnemonicCheckScreen,
    [WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET]: VerifyRestoredWallet,
    [WALLET_INIT_ROUTES.WALLET_CREDENTIALS]: WalletCredentialsScreen,
  },
  {
    initialRouteName: WALLET_INIT_ROUTES.WALLET_SELECTION,
    navigationOptions: ({navigation}) => {
      let navigationOptions
      if (
        isJormungandr(navigation.getParam('networkId')) &&
        navigation.state.routeName !== WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH
      ) {
        navigationOptions = {
          ...defaultNavigationOptions,
          ...jormunNavigationOptions,
        }
      } else {
        navigationOptions = defaultNavigationOptions
      }
      return {
        title: navigation.getParam('title'),
        headerLeft: <HeaderBackButton navigation={navigation} />,
        ...navigationOptions,
      }
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
    ...defaultStackNavigatorOptions,
  },
]

const Stack = createStackNavigator()

// TODO: navigation options
/* <Stack.Screen name={WALLET_INIT_ROUTES.WALLET_SELECTION} component={WalletSelectionScreen} /> */
const WalletInitNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH}
    screenOptions={defaultNavigationOptions}
  >
    <Stack.Screen
      name={WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH}
      component={WalletFreshInitScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen name={WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH} component={WalletInitScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.CREATE_WALLET} component={CreateWalletScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.RESTORE_WALLET} component={RestoreWalletScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.CHECK_NANO_X} component={CheckNanoXScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.CONNECT_NANO_X} component={ConnectNanoXScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.SAVE_NANO_X} component={SaveNanoXScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.MNEMONIC_SHOW} component={MnemonicShowScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.MNEMONIC_CHECK} component={MnemonicCheckScreen} />
    <Stack.Screen name={WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET} component={VerifyRestoredWallet} />
    <Stack.Screen name={WALLET_INIT_ROUTES.WALLET_CREDENTIALS} component={WalletCredentialsScreen} />
  </Stack.Navigator>
)

export default WalletInitNavigator
