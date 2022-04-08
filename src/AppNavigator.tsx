import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isEmpty} from 'lodash'
import React, {useEffect} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {Alert} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {CONFIG} from '../legacy/config/config'
import KeyStore from '../legacy/crypto/KeyStore'
import env from '../legacy/env'
import {errorMessages} from '../legacy/i18n/global-messages'
import type {State} from '../legacy/state'
import {BiometricAuthScreen} from './BiometricAuth'
import {Boundary} from './components'
import {CustomPinScreen} from './FirstRun/CustomPinScreen'
import {FirstRunNavigator} from './FirstRun/FirstRunNavigator'
import {showErrorDialog, signin} from './legacy/actions'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from './legacy/deviceSettings'
import IndexScreen from './legacy/IndexScreen'
import {
  canEnableBiometricSelector,
  installationIdSelector,
  isAppSetupCompleteSelector,
  isAuthenticatedSelector,
  isMaintenanceSelector,
  isSystemAuthEnabledSelector,
} from './legacy/selectors'
import {CustomPinLoginScreen} from './Login'
import MaintenanceScreen from './MaintenanceScreen'
import {defaultNavigationOptions, defaultStackNavigatorOptions} from './navigationOptions'
import StorybookScreen from './StorybookScreen'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'

const IS_STORYBOOK = !env.getBoolean('IS_STORYBOOK', false)

const hasAnyWalletSelector = (state: State): boolean => !isEmpty(state.wallets)

const messages = defineMessages({
  pinLoginTitle: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
  customPinTitle: {
    id: 'components.firstrun.custompinscreen.title',
    defaultMessage: '!!!Set PIN',
  },
  biometricsChangeTitle: {
    id: 'global.actions.dialogs.walletKeysInvalidated.title',
    defaultMessage: '!!!Biometrics changes',
  },
  biometricsChangeMessage: {
    id: 'global.actions.dialogs.biometricsChange.message',
    defaultMessage: '!!!Biometrics changed detected ',
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
  'setup-custom-pin': any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const Stack = createStackNavigator<AppNavigatorRoutes>()

const NavigatorSwitch = () => {
  const strings = useStrings()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const isAuthenticated = useSelector(isAuthenticatedSelector)
  const hasAnyWallet = useSelector(hasAnyWalletSelector)
  const installationId = useSelector(installationIdSelector)
  const isAppSetupComplete = useSelector(isAppSetupCompleteSelector)
  const canEnableBiometrics = useSelector(canEnableBiometricSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    if (hasAnyWallet && !isAuthenticated && isSystemAuthEnabled && !canEnableBiometrics) {
      Alert.alert(strings.biometricsChangeTitle, strings.biometricsChangeMessage)
    }
  }, [hasAnyWallet, isAuthenticated, isSystemAuthEnabled, canEnableBiometrics, strings])

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
            component={CustomPinLoginScreen}
            options={{title: strings.loginPinTitle}}
          />
        )}
        {isSystemAuthEnabled && canEnableBiometrics && (
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
        {isSystemAuthEnabled && !canEnableBiometrics && (
          <Stack.Screen
            name={'setup-custom-pin'}
            component={CustomPinScreen}
            options={{title: strings.customPinTitle}}
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
  return (
    <NavigationContainer>
      <Boundary>{IS_STORYBOOK ? <StoryBook /> : <NavigatorSwitch />}</Boundary>
    </NavigationContainer>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    loginPinTitle: intl.formatMessage(messages.pinLoginTitle),
    biometricsChangeTitle: intl.formatMessage(messages.biometricsChangeTitle),
    biometricsChangeMessage: intl.formatMessage(messages.biometricsChangeMessage),
  }
}

export default AppNavigator
