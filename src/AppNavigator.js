// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'

import {CONFIG} from './config/config'
import {
  isAppInitializedSelector,
  isMaintenanceSelector,
  languageSelector,
  tosSelector,
  isSystemAuthEnabledSelector,
  isAuthenticatedSelector,
  customPinHashSelector,
} from './selectors'
import HeaderBackButton from './components/UiKit/HeaderBackButton'
import WalletNavigator from './components/WalletNavigator'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import FirstRunNavigator from './components/FirstRun/FirstRunNavigator'
import IndexScreen from './components/IndexScreen'
import StorybookScreen from './components/StorybookScreen'
import SplashScreen from './components/SplashScreen'
import MaintenanceScreen from './components/MaintenanceScreen'
import AppStartScreen from './components/Login/AppStartScreen'
import {ROOT_ROUTES} from './RoutesList'
import BiometricAuthScreen from './components/Send/BiometricAuthScreen'
import CustomPinLogin from './components/Login/CustomPinLogin'
import {
  defaultNavigationOptions,
  defaultStackNavigatorOptions,
} from './navigationOptions'

// TODO: remove
const _AppNavigator = // createSwitchNavigator(
[
  {
    [ROOT_ROUTES.SPLASH]: SplashScreen,
    [ROOT_ROUTES.INDEX]: IndexScreen,
    [ROOT_ROUTES.STORYBOOK]: StorybookScreen,
    [ROOT_ROUTES.MAINTENANCE]: MaintenanceScreen,
    [ROOT_ROUTES.FIRST_RUN]: FirstRunNavigator,
    [ROOT_ROUTES.NEW_WALLET]: WalletInitNavigator,
    [ROOT_ROUTES.BIO_AUTH]: BiometricAuthScreen,
    [ROOT_ROUTES.WALLET]: WalletNavigator,
    // [ROOT_ROUTES.LOGIN]: createStackNavigator(
    //   {
    //     [ROOT_ROUTES.LOGIN]: {
    //       screen: AppStartScreen,
    //       navigationOptions: {
    //         header: null,
    //       },
    //     },
    //     [ROOT_ROUTES.CUSTOM_PIN_AUTH]: CustomPinLogin,
    //   },
    //   {
    //     navigationOptions: ({navigation}) => ({
    //       title: navigation.getParam('title'),
    //       headerLeft: <HeaderBackButton navigation={navigation} />,
    //       ...defaultNavigationOptions,
    //     }),
    //     ...defaultStackNavigatorOptions,
    //   },
    // ),
  },
  {
    initialRouteName: ROOT_ROUTES.SPLASH,
  },
]
// )

const Stack = createStackNavigator()

const NavigatorSwitch = compose(
  connect(
    (state) => ({
      isAppInitialized: isAppInitializedSelector(state),
      isMaintenance: isMaintenanceSelector(state),
      languageCode: languageSelector(state),
      acceptedTos: tosSelector(state),
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
      isAuthenticated: isAuthenticatedSelector(state),
      customPinHash: customPinHashSelector(state),
    }),
  ),
)(({
  isAppInitialized,
  isMaintenance,
  languageCode,
  acceptedTos,
  isSystemAuthEnabled,
  isAuthenticated,
  customPinHash,
}) => {
  if (!isAppInitialized) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name={ROOT_ROUTES.SPLASH}
          component={SplashScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    )
  }
  if (isMaintenance) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROOT_ROUTES.MAINTENANCE} component={MaintenanceScreen} />
      </Stack.Navigator>
    )
  }
  if (
    !languageCode ||
    !acceptedTos ||
    (!isSystemAuthEnabled && !customPinHash)
  ) {
    return (
      <FirstRunNavigator />
    )
  }
  if (CONFIG.DEBUG.START_WITH_INDEX_SCREEN) {
    return (
      <Stack.Navigator
        initialRouteName={ROOT_ROUTES.INIT}
        screenOptions={{headerShown: false}}
      >
        <Stack.Screen
          name={ROOT_ROUTES.INDEX}
          component={IndexScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name={ROOT_ROUTES.STORYBOOK} component={StorybookScreen} />
        <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
        <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
      </Stack.Navigator>
    )
  }
  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        initialRouteName={ROOT_ROUTES.INIT}
        screenOptions={({route}) => ({
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
        })}
      >
        <Stack.Screen
          name={ROOT_ROUTES.LOGIN}
          component={AppStartScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={ROOT_ROUTES.CUSTOM_PIN_AUTH}
          component={CustomPinLogin}
        />
        <Stack.Screen
          name={ROOT_ROUTES.BIO_AUTH}
          component={BiometricAuthScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    )
  }
  return (
    <Stack.Navigator
      initialRouteName={ROOT_ROUTES.WALLET}
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
      <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
    </Stack.Navigator>
  )
})

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <NavigatorSwitch />
    </NavigationContainer>
  )
}

export default AppNavigator
