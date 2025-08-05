import {isString} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import {TransitionPresets, createStackNavigator} from '@react-navigation/stack'
import * as React from 'react'
import {Platform} from 'react-native'



import {AuthSetting, AuthWithHostConfig} from '~/features/Auth/common/types'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useAuthSetting} from '~/features/Auth/hooks/useAuthSetting'
import {useIsAuthOsSupported} from '~/features/Auth/hooks/useIsAuthOsSupported'
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
import {NotificationsDevScreen} from '~/features/Notifications/useCases/NotificationsDevScreen'
import {SetupWalletNavigator} from '~/features/SetupWallet/SetupWalletNavigator'
import {useHasWallets} from '~/features/WalletManager/hooks/useHasWallets'
import {Modal} from '~/ui/Modal/ModalScreen'

import {WalletNavigator} from '../../WalletNavigator'
import {agreementDate, isDev} from '../constants'
import {useStrings} from '../i18n/useStrings'
import {defaultStackNavigationOptions} from './common/helpers'
import {FirstAction} from './types'

const Stack = createStackNavigator<any>()

export const AppNavigator = () => {
  // TODO: REVISIT missing deeplink watcher 
  const {palette: p} = useTheme()
  const firstAction = useFirstAction()
  const {isLoggedOut, isLoggedIn} = useAuth()
  const afterLoginAction = useAfterLoginAction()
  const strings = useStrings()

  const navOptions = React.useMemo(
    () => defaultStackNavigationOptions(a, p),
    [p],
  )

  return (
    <Stack.Navigator
      screenOptions={{
        ...navOptions,
        headerShown: false /* used only for transition */,
      }}
    >
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
            <Stack.Screen //
              name="dark-theme-announcement"
              options={{headerShown: false}}
              getComponent={() => DarkThemeAnnouncementScreen}
            />
          )}

          {afterLoginAction === 'setup-wallet' && (
            <Stack.Screen //
              name="setup-wallet"
              options={{headerShown: false}}
              component={SetupWalletNavigator}
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

      {/* Modal */}

      <Stack.Group
        screenOptions={{
          gestureEnabled: false,
          presentation: 'transparentModal',
          ...(Platform.OS === 'android' && {
            ...TransitionPresets.DefaultTransition,
          }), // overriding general navigation settings
          cardStyle: {backgroundColor: 'transparent'}, // this is needed for the modal to be transparent
        }}
      >
        <Stack.Screen
          name="modal"
          getComponent={() => Modal}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Group>

      {/* Development */}

      {isDev && (
        <Stack.Group>
          <Stack.Screen name="developer" getComponent={() => DevMenu} />

          <Stack.Screen
            name="notifications"
            getComponent={() => NotificationsDevScreen}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

const getFirstAction = (
  authWithHostConfig: AuthWithHostConfig,
  authSetting: AuthSetting | undefined,
  legalAgreement: LegalAgreement | undefined | null,
): FirstAction => {
  const hasAccepted =
    legalAgreement?.latestAcceptedAgreementsDate === agreementDate

  if (isString(authSetting) && !hasAccepted)
    return 'show-agreement-changed-notice'

  if (authSetting === 'pin') return 'auth-with-pin'
  if (authSetting === 'os' && authWithHostConfig.isEnrolled)
    return 'auth-with-os'
  if (authSetting === 'os' && !authWithHostConfig.isEnrolled)
    return 'request-new-pin'

  return 'first-run' // setup not completed
}

const useFirstAction = () => {
  const {authSetting, authWithHostConfig} = useAuth()
  const {legalAgreement} = useLegalAgreement()

  return React.useMemo(
    () => getFirstAction(authWithHostConfig, authSetting, legalAgreement),
    [authSetting, authWithHostConfig, legalAgreement],
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
  const isAuthOsSupported = useIsAuthOsSupported()
  const authSetting = useAuthSetting()

  return React.useMemo(() => {
    const shouldAskToUseAuthWithOs =
      (showBiometricsScreen && isAuthOsSupported && authSetting !== 'os') ??
      false
    return getAfterLoginAction(
      shouldAskToUseAuthWithOs,
      showDarkThemeAnnouncement ?? false,
      hasWallets,
    )
  }, [
    authSetting,
    hasWallets,
    isAuthOsSupported,
    showBiometricsScreen,
    showDarkThemeAnnouncement,
  ])
}
