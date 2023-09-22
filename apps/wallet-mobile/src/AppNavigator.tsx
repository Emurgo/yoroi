import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isString} from '@yoroi/common'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, AppStateStatus, InteractionManager, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import StorybookScreen from '../.storybook'
import {OsLoginScreen, PinLoginScreen, useBackgroundTimeout} from './auth'
import {useAuth} from './auth/AuthProvider'
import {supportsAndroidFingerprintOverlay} from './auth/biometrics'
import {EnableLoginWithPin} from './auth/EnableLoginWithPin'
import {AgreementChangedNavigator, InitializationNavigator} from './features/Initialization'
import {LegalAgreement, useLegalAgreement} from './features/Initialization/common'
import {CONFIG} from './legacy/config'
import {DeveloperScreen} from './legacy/DeveloperScreen'
import {AppRoutes} from './navigation'
import {SearchProvider} from './Search/SearchContext'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'
import {AuthSetting, useAuthOsEnabled, useAuthSetting, useAuthWithOs} from './yoroi-wallets/auth'

const Stack = createStackNavigator<AppRoutes>()
const navRef = React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>()

export const AppNavigator = () => {
  const strings = useStrings()

  useHideScreenInAppSwitcher()
  useAutoLogout()

  const {isLoggedIn, isLoggedOut, login} = useAuth()
  const {authWithOs} = useAuthWithOs({
    onSuccess: login,
    onSettled: () => RNBootSplash.hide({fade: true}),
  })

  const firstAction = useFirstAction()
  const onReady = () => {
    if (isLoggedIn) return

    // try first OS auth before navigating to os login screen
    if (firstAction === 'auth-with-os') {
      if (Platform.OS === 'android') {
        supportsAndroidFingerprintOverlay().then((isOverlaySupported) => {
          if (!isOverlaySupported) {
            RNBootSplash.hide({fade: true})
          }
          InteractionManager.runAfterInteractions(() => {
            authWithOs()
          })
        })
        return
      }

      authWithOs()
    } else {
      RNBootSplash.hide({fade: true})
    }
  }

  return (
    <NavigationContainer onReady={onReady} ref={navRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false /* used only for transition */,
          detachPreviousScreen: false /* https://github.com/react-navigation/react-navigation/issues/9883 */,
        }}
      >
        {/* Not Authenticated */}

        {isLoggedOut && (
          <Stack.Group>
            {firstAction === 'first-run' && (
              <Stack.Screen name="first-run">
                {() => (
                  <SearchProvider>
                    <InitializationNavigator />
                  </SearchProvider>
                )}
              </Stack.Screen>
            )}

            {firstAction === 'show-agreement-changed-notice' && (
              <Stack.Screen name="agreement-changed-notice">{() => <AgreementChangedNavigator />}</Stack.Screen>
            )}

            {firstAction === 'auth-with-pin' && (
              <Stack.Screen
                name="custom-pin-auth"
                component={PinLoginScreen}
                options={{title: strings.loginPinTitle}}
              />
            )}

            {firstAction === 'auth-with-os' && (
              <Stack.Screen name="bio-auth-initial" component={OsLoginScreen} options={{headerShown: false}} />
            )}

            {firstAction === 'request-new-pin' && (
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
            <Stack.Screen name="app-root">
              {() => (
                <SearchProvider>
                  <WalletNavigator />
                </SearchProvider>
              )}
            </Stack.Screen>

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

const CreatePinScreenWrapper = () => {
  const {login} = useAuth()

  return <EnableLoginWithPin onDone={login} />
}

const useStrings = () => {
  const intl = useIntl()

  return {
    customPinTitle: intl.formatMessage(messages.customPinTitle),
    loginPinTitle: intl.formatMessage(messages.pinLoginTitle),
    authWithOsChangeTitle: intl.formatMessage(messages.authWithOsChangeTitle),
    authWithOsChangeMessage: intl.formatMessage(messages.authWithOsChangeMessage),
  }
}

const messages = defineMessages({
  pinLoginTitle: {
    id: 'components.login.custompinlogin.title',
    defaultMessage: '!!!Enter PIN',
  },
  customPinTitle: {
    id: 'components.initialization.custompinscreen.title',
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
})

const useAutoLogout = () => {
  const authSetting = useAuthSetting()
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

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (Platform.OS !== 'ios') return

      const isFocused = (appState: AppStateStatus) => appState === 'active'
      const isBlurred = (appState: AppStateStatus) => appState === 'inactive' || appState === 'background'

      if (isBlurred(appStateRef.current) && isFocused(nextAppState)) RNBootSplash.hide({fade: true})

      appStateRef.current = nextAppState
    })

    return () => subscription?.remove()
  }, [])
}

type FirstAction = 'auth-with-pin' | 'auth-with-os' | 'request-new-pin' | 'first-run' | 'show-agreement-changed-notice'
const getFirstAction = (
  authOsEnabled: boolean,
  authSetting: AuthSetting,
  agreement: LegalAgreement | undefined,
): FirstAction => {
  const hasAccepted = agreement?.latestAcceptedAgreementsDate === CONFIG.AGREEMENT_DATE

  if (isString(authSetting) && !hasAccepted) return 'show-agreement-changed-notice'

  if (authSetting === 'pin') return 'auth-with-pin'
  if (authSetting === 'os' && authOsEnabled) return 'auth-with-os'
  if (authSetting === 'os' && !authOsEnabled) return 'request-new-pin'

  return 'first-run' // setup not completed
}

const useFirstAction = () => {
  const authSetting = useAuthSetting()
  const authOsEnabled = useAuthOsEnabled()
  const terms = useLegalAgreement()

  return getFirstAction(authOsEnabled, authSetting, terms)
}
