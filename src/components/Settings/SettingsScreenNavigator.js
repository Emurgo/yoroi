// @flow

import React from 'react'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {createStackNavigator} from '@react-navigation/stack'

import HeaderBackButton from '../UiKit/HeaderBackButton'

import WalletSettingsScreen from './WalletSettingsScreen'
import ApplicationSettingsScreen from './ApplicationSettingsScreen'
import ChangeWalletName from './ChangeWalletName'
import SupportScreen from './SupportScreen'
import LanguagePickerScreen from './ChangeLanguageScreen'
import BiometricsLinkScreen from './BiometricsLinkScreen'
import ToggleEasyConfirmatioScreen from './ToggleEasyConfirmatioScreen'
import TermsOfServiceScreen from './TermsOfServiceScreen'
import RemoveWalletScreen from './RemoveWalletScreen'
import ChangePasswordScreen from './ChangePasswordScreen'
import ChangeCustomPinScreen from './ChangeCustomPinScreen'
import CustomPinScreen from '../FirstRun/CustomPinScreen'
import BiometricAuthScreen from '../Send/BiometricAuthScreen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from '../../navigationOptions'

import {COLORS} from '../../styles/config'

const Tab = createMaterialTopTabNavigator()
// TODO
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Wallet" component={WalletSettingsScreen} />
    <Tab.Screen name="Application" component={ApplicationSettingsScreen} />
  </Tab.Navigator>
)

const Stack = createStackNavigator()
const SettingsScreenNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={SETTINGS_ROUTES.MAIN} component={TabNavigator} />
    <Stack.Screen name={SETTINGS_ROUTES.CHANGE_WALLET_NAME} component={ChangeWalletName} />
    <Stack.Screen name={SETTINGS_ROUTES.TERMS_OF_USE} component={TermsOfServiceScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.SUPPORT} component={SupportScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.FINGERPRINT_LINK} component={BiometricsLinkScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.REMOVE_WALLET} component={RemoveWalletScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.CHANGE_LANGUAGE} component={LanguagePickerScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.EASY_COMFIRMATION} component={ToggleEasyConfirmatioScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN} component={ChangeCustomPinScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.BIO_AUTHENTICATE} component={BiometricAuthScreen} />
    <Stack.Screen name={SETTINGS_ROUTES.SETUP_CUSTOM_PIN} component={CustomPinScreen} />
  </Stack.Navigator>
)


// const _SettingsScreenNavigator = createStackNavigator(
//   {
//     [SETTINGS_ROUTES.MAIN]: createMaterialTopTabNavigator(
//       {
//         Wallet: {
//           screen: WalletSettingsScreen,
//           navigationOptions: ({navigation}) => ({
//             title: navigation.getParam('walletTabTitle'),
//           }),
//         },
//         Application: {
//           screen: ApplicationSettingsScreen,
//           navigationOptions: ({navigation}) => ({
//             title: navigation.getParam('applicationTabTitle'),
//           }),
//         },
//       },
//       {
//         tabBarOptions: {
//           upperCaseLabel: false,
//           style: {
//             backgroundColor: COLORS.BACKGROUND_BLUE,
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           tabStyle: {
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           indicatorStyle: {
//             backgroundColor: '#fff',
//             height: 2,
//           },
//         },
//       },
//     ),
//     [SETTINGS_ROUTES.CHANGE_WALLET_NAME]: ChangeWalletName,
//     [SETTINGS_ROUTES.TERMS_OF_USE]: TermsOfServiceScreen,
//     [SETTINGS_ROUTES.SUPPORT]: SupportScreen,
//     [SETTINGS_ROUTES.FINGERPRINT_LINK]: {
//       screen: BiometricsLinkScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     [SETTINGS_ROUTES.REMOVE_WALLET]: RemoveWalletScreen,
//     [SETTINGS_ROUTES.CHANGE_LANGUAGE]: {
//       screen: LanguagePickerScreen,
//       navigationOptions: {
//         header: null,
//       },
//     },
//     [SETTINGS_ROUTES.EASY_COMFIRMATION]: ToggleEasyConfirmatioScreen,
//     [SETTINGS_ROUTES.CHANGE_PASSWORD]: ChangePasswordScreen,
//     [SETTINGS_ROUTES.CHANGE_CUSTOM_PIN]: {
//       screen: ChangeCustomPinScreen,
//       navigationOptions: ({navigationOptions}) => ({
//         headerStyle: {
//           ...navigationOptions.headerStyle,
//           elevation: 0, // turn off header shadows on Android
//         },
//       }),
//     },
//     [SETTINGS_ROUTES.BIO_AUTHENTICATE]: {
//       screen: BiometricAuthScreen,
//       navigationOptions: {header: null},
//     },
//     [SETTINGS_ROUTES.SETUP_CUSTOM_PIN]: CustomPinScreen,
//   },
//   {
//     initialRouteName: SETTINGS_ROUTES.MAIN,
//     navigationOptions: ({navigation}) => ({
//       title:
//         navigation.state.routes &&
//         navigation.state.routes[navigation.state.index].params
//           ? navigation.state.routes[navigation.state.index].params.title
//           : navigation.getParam('title'),
//       // Nested stack navigators have problems with back button
//       // https://github.com/react-navigation/react-navigation/issues/115
//       headerLeft: (
//         <HeaderBackButton shouldPopOutOfLastNavigator navigation={navigation} />
//       ),
//       ...defaultNavigationOptions,
//     }),
//     ...defaultStackNavigatorOptions,
//   },
// )

export default SettingsScreenNavigator
