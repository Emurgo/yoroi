import {useReduxDevToolsExtension} from '@react-navigation/devtools'
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React, {useEffect} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, AppStateStatus, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import {useSelector} from 'react-redux'

import {PinLoginScreen, useAuthOsEnabled, useAuthOsErrorDecoder, useAuthWithOs, useBackgroundTimeout} from './auth'
import {useAuth} from './auth/AuthProvider'
import {EnableLoginWithPin} from './auth/EnableLoginWithPin'
import {FirstRunNavigator} from './FirstRun/FirstRunNavigator'
import {useAuthSetting} from './hooks'
import globalMessages from './i18n/global-messages'
import {DeveloperScreen} from './legacy/DeveloperScreen'
import {isMaintenanceSelector} from './legacy/selectors'
import {isEmptyString} from './legacy/utils'
import MaintenanceScreen from './MaintenanceScreen'
import {AppRoutes} from './navigation'
import {OsLoginScreen} from './OsAuth'
import {AuthSetting} from './Settings/types'
import {useStorage} from './Storage'
import StorybookScreen from './StorybookScreen'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'

const Stack = createStackNavigator<AppRoutes>()

export const AppNavigator = () => {
  const strings = useStrings()
  const storage = useStorage()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const decodeAuthOsError = useAuthOsErrorDecoder()
  useHideScreenInAppSwitcher()
  useAutoLogout()

  const {isLoggedIn, isLoggedOut, login} = useAuth()
  const {authWithOs} = useAuthWithOs(
    {authenticationPrompt: {cancel: strings.cancel, title: strings.authorize}, storage},
    {
      onSuccess: login,
      onError: (error) => {
        const errorMessage = decodeAuthOsError(error)
        if (!isEmptyString(errorMessage)) Alert.alert(strings.error, errorMessage)
      },
      onSettled: () => RNBootSplash.hide({fade: true}),
    },
  )

  const authAction = useAuthAction()
  const onReady = () => {
    if (isLoggedIn) return

    // try first OS auth before navigating to os login screen
    if (authAction === 'auth-with-os') {
      authWithOs()
    } else {
      RNBootSplash.hide({fade: true})
    }
  }

  return (
    <NavigationContainer onReady={onReady} ref={useDevToolsNavigation()}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false /* used only for transition */,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        {isMaintenance && <Stack.Screen name="maintenance" component={MaintenanceScreen} />}

        {/* Not Authenticated */}
        {isLoggedOut && (
          <Stack.Group>
            {authAction === 'first-run' && <Stack.Screen name="first-run" component={FirstRunNavigator} />}
            {authAction === 'auth-with-pin' && (
              <Stack.Screen
                name="custom-pin-auth"
                component={PinLoginScreen}
                options={{title: strings.loginPinTitle}}
              />
            )}
            {authAction === 'auth-with-os' && (
              <Stack.Screen name="bio-auth-initial" component={OsLoginScreen} options={{headerShown: false}} />
            )}
            {authAction === 'request-new-pin' && (
              <Stack.Screen //
                name="enable-login-with-pin"
                component={CreatePinScreenWrapper}
                options={{title: strings.customPinTitle}}
              />
            )}
          </Stack.Group>
        )}

        {/* Authenticated */}
        {isLoggedIn && (
          <Stack.Group>
            <Stack.Screen name="app-root" component={WalletNavigator} />
            <Stack.Screen name="new-wallet" component={WalletInitNavigator} />
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
    </NavigationContainer>
  )
}

export default AppNavigator

const CreatePinScreenWrapper = () => {
  const {login} = useAuth()

  return <EnableLoginWithPin onDone={login} />
}

const useStrings = () => {
  const intl = useIntl()

  return {
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    error: intl.formatMessage(globalMessages.error),
    loginPinTitle: intl.formatMessage(messages.pinLoginTitle),
    authWithOsChangeTitle: intl.formatMessage(messages.authWithOsChangeTitle),
    authWithOsChangeMessage: intl.formatMessage(messages.authWithOsChangeMessage),
    cancel: intl.formatMessage(globalMessages.cancel),
    authorize: intl.formatMessage(messages.authorize),
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
  authWithOsChangeTitle: {
    id: 'global.actions.dialogs.walletKeysInvalidated.title',
    defaultMessage: '!!!Auth with OS changes',
  },
  authWithOsChangeMessage: {
    id: 'global.actions.dialogs.biometricsChange.message',
    defaultMessage: '!!!Auth with OS changed detected ',
  },
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
  },
})

const useAutoLogout = () => {
  const storage = useStorage()
  const authSetting = useAuthSetting(storage)
  const strings = useStrings()
  const {logout} = useAuth()
  const authOsEnabled = useAuthOsEnabled()
  const osAuthDisabled = !authOsEnabled && authSetting === 'os'

  useBackgroundTimeout({
    onTimeout: logout,
    duration: 120 * 1000,
  })

  React.useEffect(() => {
    if (osAuthDisabled) {
      Alert.alert(strings.authWithOsChangeTitle, strings.authWithOsChangeMessage)

      logout()
    }
  }, [osAuthDisabled, strings.authWithOsChangeTitle, strings.authWithOsChangeMessage, logout])
}

const useHideScreenInAppSwitcher = () => {
  const appStateRef = React.useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (Platform.OS !== 'ios') return

      const isFocused = (appState: AppStateStatus) => appState === 'active'
      const isBlurred = (appState: AppStateStatus) => appState === 'inactive' || appState === 'background'

      if (isBlurred(appStateRef.current) && isFocused(nextAppState)) RNBootSplash.hide({fade: true})
      if (isFocused(appStateRef.current) && isBlurred(nextAppState)) RNBootSplash.show({fade: true})

      appStateRef.current = nextAppState
    })

    return () => subscription?.remove()
  }, [])
}

type AuthAction = 'auth-with-pin' | 'auth-with-os' | 'request-new-pin' | 'first-run'
const getAuthAction = (authOsEnabled: boolean, authSetting: AuthSetting): AuthAction => {
  if (authSetting === 'pin') return 'auth-with-pin'
  if (authSetting === 'os' && authOsEnabled) return 'auth-with-os'
  if (authSetting === 'os' && !authOsEnabled) return 'request-new-pin'
  return 'first-run' // setup not completed
}

const useAuthAction = () => {
  const storage = useStorage()
  const authSetting = useAuthSetting(storage)
  const authOsEnabled = useAuthOsEnabled()

  return getAuthAction(authOsEnabled, authSetting)
}

const useDevToolsNavigation = () => {
  const navRef = useNavigationContainerRef()
  useReduxDevToolsExtension(navRef)

  return navRef
}
