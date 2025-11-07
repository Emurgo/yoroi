import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'

import {createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'

import {AuthSetting} from '~/features/Auth/common/types'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {InitiatePinScreen} from '~/features/Auth/ui/screens/InitiatePinScreen'
import {LoginWithHostScreen} from '~/features/Auth/ui/screens/LoginWithHostScreen'
import {LoginWithPinScreen} from '~/features/Auth/ui/screens/LoginWithPinScreen'
import {DevMenu} from '~/features/DevMenu/DevMenu'
import {AgreementChangedNavigator} from '~/features/Initialization/ui/navigation/AgreementChangedNavigator'
import {InitializationNavigator} from '~/features/Initialization/ui/navigation/InitializationNavigator'
import {
  ChooseBiometricLoginScreen,
  useShowBiometricsScreen,
} from '~/features/Initialization/ui/screens/ChooseBiometricLoginScreen'
import {
  DarkThemeAnnouncementScreen,
  useShowDarkThemeAnnouncementScreen,
} from '~/features/Initialization/ui/screens/DarkThemeAnnouncementScreen'
import {LegalAgreement} from '~/features/Legal/common/types'
import {useLegalAgreement} from '~/features/Legal/hooks/useLegalAgreement'
import {useDeepLinkWatcher} from '~/features/Links/hooks/useDeepLinkWatcher'
import {useLinksRequestAction} from '~/features/Links/hooks/useLinksRequestAction'
import {useInitNotifications} from '~/features/Notifications/common/hooks'
import {NotificationUIHandler} from '~/features/Notifications/useCases/NotificationUIHandler'
import {NotificationsDevScreen} from '~/features/Notifications/useCases/NotificationsDevScreen'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {useHasWallets} from '~/features/WalletManager/hooks/useHasWallets'

import {agreementDate} from '../constants'
import {features} from '../features'
import {useStrings} from '../i18n/useStrings'
import {WalletNavigator} from './WalletNavigator'
import {defaultStackNavigationOptions} from './common/helpers'
import {FirstAction} from './types'

const Stack = createStackNavigator()

export const AppNavigator = () => {
  const {isAuthDev, isLoggedOut, isLoggedIn} = useAuth()
  const {palette: p} = useTheme()
  const firstAction = useFirstAction()
  const afterLoginAction = useAfterLoginAction()
  const strings = useStrings()

  // Enable deep link watching
  useDeepLinkWatcher()

  // Enable deep link action handling with modal support (only when logged in)
  useLinksRequestAction()

  const screenOptions = React.useMemo(
    () => ({...defaultStackNavigationOptions(p), headerShown: false}),
    [p],
  )

  // Enable notifications inside navigation context
  useInitNotifications({
    localEnabled: true,
    pushEnabled: features.pushNotifications,
  })

  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        {/* Not Authenticated */}
        {isLoggedOut && (
          <Stack.Group>
            {firstAction === 'first-run' && (
              <Stack.Screen
                name="first-run"
                getComponent={() => InitializationNavigator}
              />
            )}

            {firstAction === 'show-agreement-changed-notice' && (
              <Stack.Screen
                name="agreement-changed-notice"
                getComponent={() => AgreementChangedNavigator}
              />
            )}

            {firstAction === 'auth-with-pin' && (
              <Stack.Screen
                name="custom-pin-auth"
                getComponent={() => LoginWithPinScreen}
              />
            )}

            {firstAction === 'auth-with-os' && (
              <Stack.Screen
                name="bio-auth-initial"
                getComponent={() => LoginWithHostScreen}
                options={{headerShown: false}}
              />
            )}

            {firstAction === 'request-new-pin' && (
              <Stack.Screen //
                name="enable-login-with-pin"
                component={InitiatePinScreen}
                options={{title: strings.auth.pinInputTitle}}
              />
            )}
          </Stack.Group>
        )}

        {/* Authenticated */}
        {isLoggedIn && (
          <Stack.Group>
            {afterLoginAction === 'choose-biometric-login' && (
              <Stack.Screen //
                name="choose-biometric-login"
                options={{headerShown: false}}
                getComponent={() => ChooseBiometricLoginScreen}
              />
            )}

            {afterLoginAction === 'dark-theme-announcement' && (
              <>
                <Stack.Screen //
                  name="dark-theme-announcement"
                  options={{headerShown: false}}
                  getComponent={() => DarkThemeAnnouncementScreen}
                />

                <Stack.Screen //
                  name="setup-wallet"
                  options={{headerShown: false}}
                  getComponent={() => SetupWalletNavigator}
                />
              </>
            )}

            {afterLoginAction === 'setup-wallet' && (
              <Stack.Screen //
                name="setup-wallet"
                options={{headerShown: false}}
                getComponent={() => SetupWalletNavigator}
              />
            )}

            {afterLoginAction === 'manage-wallets' && (
              <Stack.Screen
                name="manage-wallets"
                getComponent={() => WalletNavigator}
              />
            )}
          </Stack.Group>
        )}

        {/* Development */}
        {isAuthDev && (
          <Stack.Group>
            <Stack.Screen
              name="developer"
              options={{
                headerShown: true,
                title: 'Developer Menu',
              }}
              getComponent={() => DevMenu}
            />

            <Stack.Screen
              name="notifications"
              getComponent={() => NotificationsDevScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>

      <NotificationUIHandler />
    </>
  )
}

const getFirstAction = (
  isEnrolled: boolean,
  authSetting: AuthSetting | undefined,
  legalAgreement: LegalAgreement | undefined | null,
): FirstAction => {
  const hasAccepted =
    legalAgreement?.latestAcceptedAgreementsDate === agreementDate

  if (isString(authSetting) && !hasAccepted)
    return 'show-agreement-changed-notice'

  if (authSetting === 'pin') return 'auth-with-pin'
  if (authSetting === 'os' && isEnrolled) return 'auth-with-os'
  if (authSetting === 'os' && !isEnrolled) return 'request-new-pin'

  return 'first-run' // setup not completed
}

const useFirstAction = () => {
  const {authSetting, isEnrolled} = useAuth()
  const {legalAgreement} = useLegalAgreement()

  return React.useMemo(
    () => getFirstAction(isEnrolled, authSetting, legalAgreement),
    [authSetting, isEnrolled, legalAgreement],
  )
}

type AfterLoginAction =
  | 'choose-biometric-login'
  | 'dark-theme-announcement'
  | 'setup-wallet'
  | 'manage-wallets'
const getAfterLoginAction = (
  shouldAskToUseAuthWithOs: boolean,
  showDarkThemeAnnouncement: boolean,
  hasWallets: boolean,
): AfterLoginAction => {
  if (!hasWallets && shouldAskToUseAuthWithOs) return 'choose-biometric-login'
  if (!hasWallets && showDarkThemeAnnouncement && !shouldAskToUseAuthWithOs)
    return 'dark-theme-announcement'
  if (!hasWallets && !shouldAskToUseAuthWithOs && !showDarkThemeAnnouncement)
    return 'setup-wallet'

  return 'manage-wallets'
}
const useAfterLoginAction = () => {
  const hasWallets = useHasWallets()
  const {showBiometricsScreen} = useShowBiometricsScreen()
  const {showDarkThemeAnnouncement} = useShowDarkThemeAnnouncementScreen()
  const {canAuthWithHost, authSetting} = useAuth()

  return React.useMemo(() => {
    const shouldAskToUseAuthWithOs =
      (showBiometricsScreen && canAuthWithHost && authSetting !== 'os') ?? false
    return getAfterLoginAction(
      shouldAskToUseAuthWithOs,
      showDarkThemeAnnouncement ?? false,
      hasWallets,
    )
  }, [
    authSetting,
    hasWallets,
    canAuthWithHost,
    showBiometricsScreen,
    showDarkThemeAnnouncement,
  ])
}
