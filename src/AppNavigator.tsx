import {useReduxDevToolsExtension} from '@react-navigation/devtools'
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React, {useEffect} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState} from 'react-native'
import {useQueryClient} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {CreatePinScreen, PinLoginScreen} from './auth'
import {useBackgroundTimeout} from './auth'
import {useAuth} from './auth/AuthProvider'
import {BiometricAuthScreen} from './BiometricAuth'
import {FirstRunNavigator} from './FirstRun/FirstRunNavigator'
import {useWalletMetas} from './hooks'
import {errorMessages} from './i18n/global-messages'
import {checkBiometricStatus, reloadAppSettings, setSystemAuth, showErrorDialog} from './legacy/actions'
import {DeveloperScreen} from './legacy/DeveloperScreen'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from './legacy/deviceSettings'
import env from './legacy/env'
import KeyStore from './legacy/KeyStore'
import {
  canEnableBiometricSelector,
  installationIdSelector,
  isAppSetupCompleteSelector,
  isMaintenanceSelector,
  isSystemAuthEnabledSelector,
} from './legacy/selectors'
import {isEmptyString} from './legacy/utils'
import MaintenanceScreen from './MaintenanceScreen'
import {AppRoutes} from './navigation'
import StorybookScreen from './StorybookScreen'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'

const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

export const AppNavigator = () => {
  useAutoLogout()

  const navRef = useNavigationContainerRef()

  useReduxDevToolsExtension(navRef)

  return <NavigationContainer ref={navRef}>{IS_STORYBOOK ? <StoryBook /> : <NavigatorSwitch />}</NavigationContainer>
}

export default AppNavigator

const Stack = createStackNavigator<AppRoutes>()
const NavigatorSwitch = () => {
  const strings = useStrings()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const walletMetas = useWalletMetas()
  const hasAnyWallet = walletMetas.length > 0
  const isAppSetupComplete = useSelector(isAppSetupCompleteSelector)
  const canEnableBiometrics = useSelector(canEnableBiometricSelector)
  const installationId = useSelector(installationIdSelector)
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const {isLoggedIn, isLoggedOut, login, logout} = useAuth()

  if (isEmptyString(installationId)) throw new Error('invalid state')

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', async () => {
      await dispatch(checkBiometricStatus(logout))
      queryClient.invalidateQueries(['walletMetas'])
    })
    return () => appStateSubscription?.remove()
  }, [dispatch, logout, queryClient])

  useEffect(() => {
    if (hasAnyWallet && isLoggedOut && isSystemAuthEnabled && !canEnableBiometrics && !isMaintenance) {
      Alert.alert(strings.biometricsChangeTitle, strings.biometricsChangeMessage)
    }
  }, [hasAnyWallet, isLoggedOut, isSystemAuthEnabled, canEnableBiometrics, isMaintenance, strings])

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Initial Route */}
      <Stack.Group>
        {isMaintenance && <Stack.Screen name="maintenance" component={MaintenanceScreen} />}
        {!isAppSetupComplete && !hasAnyWallet && <Stack.Screen name="first-run" component={FirstRunNavigator} />}
      </Stack.Group>

      {/* Not Authenticated */}
      {isLoggedOut && hasAnyWallet && (
        <Stack.Group>
          {!isSystemAuthEnabled && (
            <Stack.Screen name="custom-pin-auth" component={PinLoginScreen} options={{title: strings.loginPinTitle}} />
          )}
          {isSystemAuthEnabled && canEnableBiometrics && (
            <Stack.Screen
              name="bio-auth-initial"
              component={BiometricAuthScreen}
              options={{headerShown: false}}
              initialParams={{
                keyId: installationId,
                onSuccess: login,
                onFail: async (reason: string, intl: IntlShape) => {
                  if (reason === KeyStore.REJECTIONS.INVALID_KEY) {
                    if (await canBiometricEncryptionBeEnabled()) {
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
            <Stack.Screen //
              name="setup-custom-pin"
              component={CreatePinScreenWrapper}
              options={{title: strings.customPinTitle}}
            />
          )}
        </Stack.Group>
      )}

      {/* Authenticated */}
      {(isLoggedIn || !hasAnyWallet) && (
        <Stack.Group>
          <Stack.Screen name="app-root" component={WalletNavigator} />
          <Stack.Screen name="new-wallet" component={WalletInitNavigator} />
          <Stack.Screen name="biometrics" component={BiometricAuthScreen} options={{headerShown: false}} />
        </Stack.Group>
      )}

      {/* Development */}
      {__DEV__ && (
        <Stack.Group>
          <Stack.Screen name="developer" component={DeveloperScreen} options={{headerShown: false}} />
          <Stack.Screen name="storybook" component={StorybookScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

const CreatePinScreenWrapper = () => {
  const dispatch = useDispatch()
  const {login} = useAuth()

  return (
    <CreatePinScreen
      onDone={async () => {
        await dispatch(reloadAppSettings())
        await dispatch(setSystemAuth(false))
        login()
      }}
    />
  )
}

const StoryBook = () => (
  <Stack.Navigator>
    <Stack.Screen name="storybook" component={StorybookScreen} />
  </Stack.Navigator>
)

const useStrings = () => {
  const intl = useIntl()

  return {
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    loginPinTitle: intl.formatMessage(messages.pinLoginTitle),
    biometricsChangeTitle: intl.formatMessage(messages.biometricsChangeTitle),
    biometricsChangeMessage: intl.formatMessage(messages.biometricsChangeMessage),
  }
}

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

const useAutoLogout = () => {
  const {logout} = useAuth()
  useBackgroundTimeout({
    onTimeout: logout,
    duration: 120 * 1000,
  })
}
