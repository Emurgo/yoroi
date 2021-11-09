import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isEmpty} from 'lodash'
import React from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, signin} from '../legacy/actions'
import IndexScreen from '../legacy/components/IndexScreen'
import CustomPinLogin from '../legacy/components/Login/CustomPinLogin'
import MaintenanceScreen from '../legacy/components/MaintenanceScreen'
import BiometricAuthScreen from '../legacy/components/Send/BiometricAuthScreen'
import WalletInitNavigator from '../legacy/components/WalletInit/WalletInitNavigator'
import {CONFIG} from '../legacy/config/config'
import KeyStore from '../legacy/crypto/KeyStore'
import env from '../legacy/env'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from '../legacy/helpers/deviceSettings'
import {errorMessages} from '../legacy/i18n/global-messages'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from '../legacy/navigationOptions'
import {
  installationIdSelector,
  isAppSetupCompleteSelector,
  isAuthenticatedSelector,
  isMaintenanceSelector,
  isSystemAuthEnabledSelector,
} from '../legacy/selectors'
import type {State} from '../legacy/state'
import StorybookScreen from './components/StorybookScreen'
import WalletNavigator from './components/WalletNavigator'
import FirstRunNavigator from './FirstRun/FirstRunNavigator'

const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

const hasAnyWalletSelector = (state: State): boolean => !isEmpty(state.wallets)

const messages = defineMessages({
  pinLoginTitle: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
type AppNavigatorRoutes = {
  maintenance: any
  'screens-index': any
  storybook: any
  'new-wallet': any
  'app-root': any
  'custom-pin-auth': any
  'bio-auth': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<AppNavigatorRoutes>()

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
        <Stack.Screen name={'maintenance'} component={MaintenanceScreen} />
      </Stack.Navigator>
    )
  }
  if (!isAppSetupComplete) {
    return <FirstRunNavigator />
  }
  if (CONFIG.DEBUG.START_WITH_INDEX_SCREEN) {
    return (
      <Stack.Navigator initialRouteName={'screens-index'} screenOptions={{headerShown: false}}>
        <Stack.Screen name={'screens-index'} component={IndexScreen} options={{headerShown: false}} />
        <Stack.Screen name={'storybook'} component={StorybookScreen} />
        <Stack.Screen name={'new-wallet'} component={WalletInitNavigator} />
        <Stack.Screen name={'app-root'} component={WalletNavigator} />
      </Stack.Navigator>
    )
  }
  if (hasAnyWallet && !isAuthenticated) {
    return (
      <Stack.Navigator
        screenOptions={({route}) => ({
          title: route.params?.title ?? undefined,
          ...defaultNavigationOptions,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(defaultStackNavigatorOptions as any),
        })}
      >
        {!isSystemAuthEnabled && (
          <Stack.Screen
            name={'custom-pin-auth'}
            component={CustomPinLogin}
            options={{title: intl.formatMessage(messages.pinLoginTitle)}}
          />
        )}
        {isSystemAuthEnabled && (
          <Stack.Screen
            name={'bio-auth'}
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
        <Stack.Screen name={'new-wallet'} component={WalletInitNavigator} />
        <Stack.Screen name={'app-root'} component={WalletNavigator} />
      </Stack.Navigator>
    )
  }
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={'app-root'} component={WalletNavigator} />
      <Stack.Screen name={'new-wallet'} component={WalletInitNavigator} />
    </Stack.Navigator>
  )
}

const StoryBook = () => (
  <Stack.Navigator>
    <Stack.Screen name={'storybook'} component={StorybookScreen} />
  </Stack.Navigator>
)

const AppNavigator = () => {
  return <NavigationContainer>{IS_STORYBOOK ? <StoryBook /> : <NavigatorSwitch />}</NavigationContainer>
}

export default AppNavigator
