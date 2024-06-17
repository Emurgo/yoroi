import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isString} from '@yoroi/common'
import {supportedPrefixes} from '@yoroi/links'
import {TransferProvider} from '@yoroi/transfer'
import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState, AppStateStatus, InteractionManager, Platform} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'

import StorybookScreen from '../.storybook'
import {ModalProvider} from './components/Modal/ModalContext'
import {ModalScreen} from './components/Modal/ModalScreen'
import {OsLoginScreen, PinLoginScreen, useBackgroundTimeout} from './features/Auth'
import {useAuth} from './features/Auth/AuthProvider'
import {supportsAndroidFingerprintOverlay} from './features/Auth/common/biometrics'
import {AuthSetting, useAuthSetting, useAuthWithOs, useIsAuthOsSupported} from './features/Auth/common/hooks'
import {EnableLoginWithPin} from './features/Auth/EnableLoginWithPin'
import {DeveloperScreen} from './features/Dev/DeveloperScreen'
import {AgreementChangedNavigator, InitializationNavigator} from './features/Initialization'
import {
  ChooseBiometricLoginScreen,
  useShowBiometricsScreen,
} from './features/Initialization/ChooseBiometricLogin/ChooseBiometricLoginScreen'
import {LegalAgreement, useLegalAgreement} from './features/Initialization/common'
import {useDeepLinkWatcher} from './features/Links/common/useDeepLinkWatcher'
import {PortfolioScreen} from './features/Portfolio/useCases/PortfolioScreen'
import {SearchProvider} from './features/Search/SearchContext'
import {SetupWalletNavigator} from './features/SetupWallet/SetupWalletNavigator'
import {useWalletManager} from './features/WalletManager/context/WalletManagerContext'
import {useStatusBar} from './hooks/useStatusBar'
import {agreementDate} from './kernel/config'
import {AppRoutes} from './kernel/navigation'
import {WalletNavigator} from './WalletNavigator'
import {useHasWallets} from './yoroi-wallets/hooks'

const Stack = createStackNavigator<AppRoutes>()
const navRef = React.createRef<NavigationContainerRef<ReactNavigation.RootParamList>>()
const prefixes = [...supportedPrefixes]

export const AppNavigator = () => {
  useDeepLinkWatcher()
  const strings = useStrings()
  const [routeName, setRouteName] = React.useState<string>()
  useStatusBar(routeName)
  const {showBiometricsScreen} = useShowBiometricsScreen()
  const isAuthOsSupported = useIsAuthOsSupported()
  const authSetting = useAuthSetting()
  const walletManager = useWalletManager()
  const {hasWallets} = useHasWallets(walletManager)
  useHideScreenInAppSwitcher()

  useAutoLogout()

  const shouldAskToUseAuthWithOs = showBiometricsScreen && isAuthOsSupported && authSetting !== 'os'

  const {isLoggedIn, isLoggedOut, login} = useAuth()
  const {authWithOs} = useAuthWithOs({
    onSuccess: login,
    onSettled: () => RNBootSplash.hide({fade: true}),
  })

  const firstAction = useFirstAction()
  const onReady = React.useCallback(() => {
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
  }, [authWithOs, firstAction, isLoggedIn])

  const handleStateChange = React.useCallback(() => {
    const currentRouteName = navRef.current?.getCurrentRoute()?.name
    setRouteName(currentRouteName)
  }, [])

  return (
    <NavigationContainer
      onStateChange={handleStateChange}
      linking={{enabled: true, prefixes}}
      onReady={onReady}
      ref={navRef}
    >
      <ModalProvider>
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
            <>
              <Stack.Group>
                {!hasWallets && shouldAskToUseAuthWithOs && (
                  <Stack.Screen //
                    name="choose-biometric-login"
                    options={{headerShown: false}}
                    component={ChooseBiometricLoginScreen}
                  />
                )}

                {!hasWallets && !shouldAskToUseAuthWithOs && (
                  <Stack.Screen //
                    name="setup-wallet"
                    options={{headerShown: false}}
                    component={SetupWalletNavigator}
                  />
                )}

                <Stack.Screen name="manage-wallets">
                  {() => (
                    <SearchProvider>
                      <TransferProvider>
                        <WalletNavigator />
                      </TransferProvider>
                    </SearchProvider>
                  )}
                </Stack.Screen>
              </Stack.Group>

              <Stack.Group screenOptions={{presentation: 'transparentModal'}}>
                <Stack.Screen name="modal" component={ModalScreen} />
              </Stack.Group>
            </>
          )}

          {/* Development */}

          {__DEV__ && (
            <Stack.Group>
              <Stack.Screen name="developer" component={DeveloperScreen} options={{headerShown: false}} />

              <Stack.Screen name="storybook" component={StorybookScreen} />

              <Stack.Screen name="portfolio-dashboard" component={PortfolioScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </ModalProvider>
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
  const isAuthOsSupported = useIsAuthOsSupported()
  const osAuthDisabled = !isAuthOsSupported && authSetting === 'os'

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
  isAuthOsSupported: boolean,
  authSetting: AuthSetting,
  legalAgreement: LegalAgreement | undefined | null,
): FirstAction => {
  const hasAccepted = legalAgreement?.latestAcceptedAgreementsDate === agreementDate

  if (isString(authSetting) && !hasAccepted) return 'show-agreement-changed-notice'

  if (authSetting === 'pin') return 'auth-with-pin'
  if (authSetting === 'os' && isAuthOsSupported) return 'auth-with-os'
  if (authSetting === 'os' && !isAuthOsSupported) return 'request-new-pin'

  return 'first-run' // setup not completed
}

const useFirstAction = () => {
  const authSetting = useAuthSetting()
  const isAuthOsSupported = useIsAuthOsSupported()
  const legalAgreement = useLegalAgreement()

  return getFirstAction(isAuthOsSupported, authSetting, legalAgreement)
}
