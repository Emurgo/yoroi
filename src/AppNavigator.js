// @flow

import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isEmpty} from 'lodash'
import {useIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'

import {CONFIG} from './config/config'
import {
  isMaintenanceSelector,
  isSystemAuthEnabledSelector,
  isAuthenticatedSelector,
  installationIdSelector,
  isAppSetupCompleteSelector,
} from './selectors'
import WalletNavigator from './components/WalletNavigator'
import WalletInitNavigator from './components/WalletInit/WalletInitNavigator'
import FirstRunNavigator from './components/FirstRun/FirstRunNavigator'
import IndexScreen from './components/IndexScreen'
import StorybookScreen from './components/StorybookScreen'
import MaintenanceScreen from './components/MaintenanceScreen'
import {ROOT_ROUTES} from './RoutesList'
import BiometricAuthScreen from './components/Send/BiometricAuthScreen'
import CustomPinLogin from './components/Login/CustomPinLogin'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from './navigationOptions'
import {signin, showErrorDialog} from './actions'
import {recreateAppSignInKeys, canBiometricEncryptionBeEnabled} from './helpers/deviceSettings'
import {errorMessages} from './i18n/global-messages'
import env from './env'
import KeyStore from './crypto/KeyStore'

import type {State} from './state'

const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

const hasAnyWalletSelector = (state: State): boolean => !isEmpty(state.wallets)

const messages = defineMessages({
  pinLoginTitle: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

type AppNavigatorRoutes = {
  maintenance: any,
  'screens-index': any,
  storybook: any,
  'new-wallet': any,
  'app-root': any,
  'custom-pin-auth': any,
  'bio-auth': any,
}

const Stack = createStackNavigator<any, AppNavigatorRoutes, any>()

const NavigatorSwitch = () => {
  const intl = useIntl()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const isAuthenticated = useSelector(isAuthenticatedSelector)
  const hasAnyWallet = useSelector(hasAnyWalletSelector)
  const installationId = useSelector(installationIdSelector)
  const isAppSetupComplete = useSelector(isAppSetupCompleteSelector)
  const dispatch = useDispatch()

  if (isMaintenance) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROOT_ROUTES.MAINTENANCE} component={MaintenanceScreen} />
      </Stack.Navigator>
    )
  }
  if (!isAppSetupComplete) {
    return <FirstRunNavigator />
  }
  if (CONFIG.DEBUG.START_WITH_INDEX_SCREEN) {
    return (
      <Stack.Navigator initialRouteName={ROOT_ROUTES.INIT} screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROOT_ROUTES.INDEX} component={IndexScreen} options={{headerShown: false}} />
        <Stack.Screen name={ROOT_ROUTES.STORYBOOK} component={StorybookScreen} />
        <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
        <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
      </Stack.Navigator>
    )
  }
  if (hasAnyWallet && !isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={({route}) => ({
          // $FlowFixMe mixed is incompatible with string
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          ...defaultStackNavigatorOptions,
        })}
      >
        {!isSystemAuthEnabled && (
          <Stack.Screen
            name={ROOT_ROUTES.CUSTOM_PIN_AUTH}
            component={CustomPinLogin}
            options={{title: intl.formatMessage(messages.pinLoginTitle)}}
          />
        )}
        {isSystemAuthEnabled && (
          <Stack.Screen
            name={ROOT_ROUTES.BIO_AUTH}
            component={BiometricAuthScreen}
            options={{headerShown: false}}
            initialParams={{
              keyId: installationId,
              onSuccess: () => {
                dispatch(signin())
              },
              onFail: async (reason, intl: IntlShape) => {
                if (reason === KeyStore.REJECTIONS.INVALID_KEY) {
                  if ((await canBiometricEncryptionBeEnabled()) && installationId) {
                    await recreateAppSignInKeys(installationId)
                  } else {
                    await showErrorDialog(errorMessages.biometricsIsTurnedOff, intl)
                  }
                }
              },
              addWelcomeMessage: true,
            }}
          />
        )}
      </Stack.Navigator>
    )
  }
  // note: it makes much more sense to only change the initialRouteName in the
  // following two cases, but that didn't work (probably bug in react-navigation)
  if (!hasAnyWallet) {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
        <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
      </Stack.Navigator>
    )
  }
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={ROOT_ROUTES.WALLET} component={WalletNavigator} />
      <Stack.Screen name={ROOT_ROUTES.NEW_WALLET} component={WalletInitNavigator} />
    </Stack.Navigator>
  )
}

const StoryBook = () => (
  <Stack.Navigator>
    <Stack.Screen name={ROOT_ROUTES.STORYBOOK} component={StorybookScreen} />
  </Stack.Navigator>
)

const AppNavigator = () => {
  return <NavigationContainer>{IS_STORYBOOK ? <StoryBook /> : <NavigatorSwitch />}</NavigationContainer>
}

export default AppNavigator
