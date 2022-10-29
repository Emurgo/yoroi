import {useReduxDevToolsExtension} from '@react-navigation/devtools'
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React, {useEffect} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, AppStateStatus, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import {useQueryClient} from 'react-query'
import {useSelector} from 'react-redux'

import {PinLoginScreen, useAuthOsEnabledOnDevice, useAuthWithOs, useBackgroundTimeout} from './auth'
import {useAuth} from './auth/AuthProvider'
import {EnableLoginWithPin} from './auth/EnableLoginWithPin'
import {AuthMethodState} from './auth/types'
import {FirstRunNavigator} from './FirstRun/FirstRunNavigator'
import {AuthAction, useAuthAction, useAuthMethod} from './hooks'
import globalMessages from './i18n/global-messages'
import {DeveloperScreen} from './legacy/DeveloperScreen'
import env from './legacy/env'
import {isMaintenanceSelector, isTosAcceptedSelector} from './legacy/selectors'
import MaintenanceScreen from './MaintenanceScreen'
import {AppRoutes} from './navigation'
import {OsLoginScreen} from './OsAuth'
import {useStorage} from './Storage'
import StorybookScreen from './StorybookScreen'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'

const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

export const AppNavigator = () => {
  const strings = useStrings()
  const storage = useStorage()
  const [isReady, setIsReady] = React.useState(false)
  useHideScreenInAppSwitcher()

  const {authMethod} = useAuthMethod(storage)
  const authAction = useAuthAction(authMethod)

  useAutoLogout(authMethod)

  const {isLoggedOut, login} = useAuth()
  const {authWithOs} = useAuthWithOs(
    {
      authenticationPrompt: {
        cancel: strings.cancel,
        title: strings.authorize,
      },
      storage,
    },
    {
      onSuccess: login,
      onSettled: () =>
        RNBootSplash.hide({
          fade: true,
        }),
    },
  )

  const navRef = useNavigationContainerRef()
  useReduxDevToolsExtension(navRef)

  // when auth with OS keep splash screen on 1st attempt
  React.useEffect(() => {
    if (isReady && authAction !== 'auth-with-os') {
      RNBootSplash.hide({
        fade: true,
      })
    }
  }, [authAction, isReady])

  // try first OS auth before navigating
  React.useEffect(() => {
    if (authAction === 'auth-with-os' && isLoggedOut) authWithOs()
  }, [authAction, authWithOs, isLoggedOut, strings.authorize, strings.cancel])

  if (authAction == null) return null

  return (
    <NavigationContainer onReady={() => setIsReady(true)} ref={navRef}>
      {IS_STORYBOOK ? <StoryBook /> : <NavigatorSwitch authAction={authAction} />}
    </NavigationContainer>
  )
}

export default AppNavigator

const Stack = createStackNavigator<AppRoutes>()
const NavigatorSwitch = ({authAction}: {authAction: AuthAction}) => {
  const strings = useStrings()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const isTosAccepted = useSelector(isTosAcceptedSelector)
  const {isLoggedIn, isLoggedOut} = useAuth()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false /* used only for transition */,
        detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
      }}
    >
      {/* Initial Route */}
      <Stack.Group>
        {isMaintenance && <Stack.Screen name="maintenance" component={MaintenanceScreen} />}
        {!isTosAccepted && <Stack.Screen name="first-run" component={FirstRunNavigator} />}
      </Stack.Group>

      {/* Not Authenticated */}
      {isLoggedOut && (
        <Stack.Group>
          {authAction === 'auth-with-pin' && (
            <Stack.Screen name="custom-pin-auth" component={PinLoginScreen} options={{title: strings.loginPinTitle}} />
          )}
          {authAction === 'auth-with-os' && (
            <Stack.Screen name="bio-auth-initial" component={OsLoginScreen} options={{headerShown: false}} />
          )}
          {authAction === 'create-and-link-with-pin' && (
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
  )
}

const CreatePinScreenWrapper = () => {
  const {login} = useAuth()

  return <EnableLoginWithPin onDone={login} />
}

const StoryBook = () => (
  <Stack.Navigator
    screenOptions={{
      detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
    }}
  >
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
  biometricsChangeTitle: {
    id: 'global.actions.dialogs.walletKeysInvalidated.title',
    defaultMessage: '!!!Biometrics changes',
  },
  biometricsChangeMessage: {
    id: 'global.actions.dialogs.biometricsChange.message',
    defaultMessage: '!!!Biometrics changed detected ',
  },
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
  },
})

const useAutoLogout = (authMethod: AuthMethodState) => {
  const strings = useStrings()
  const {logout} = useAuth()
  const {authOsEnabledOnDevice, refetch} = useAuthOsEnabledOnDevice()
  const osAuthDisabled = !authOsEnabledOnDevice && authMethod.OS
  const queryClient = useQueryClient()

  useBackgroundTimeout({
    onTimeout: logout,
    duration: 120 * 1000,
  })

  React.useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', async (appState) => {
      // when using OS auth and app is active again needs to check if still enabled
      if (appState === 'active' && authMethod.OS) {
        queryClient.invalidateQueries(['useAuthAction'])
        refetch()
      }
    })
    return () => appStateSubscription?.remove()
  }, [authMethod.OS, queryClient, refetch])

  React.useEffect(() => {
    if (osAuthDisabled) {
      Alert.alert(strings.biometricsChangeTitle, strings.biometricsChangeMessage)

      logout()
    }
  }, [osAuthDisabled, strings.biometricsChangeTitle, strings.biometricsChangeMessage, logout])
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
