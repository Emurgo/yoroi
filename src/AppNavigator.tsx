import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {isEmpty} from 'lodash'
import React, {useEffect} from 'react'
import type {IntlShape} from 'react-intl'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, AppState} from 'react-native'
import {useQueryClient} from 'react-query'
import {useDispatch, useSelector} from 'react-redux'

import {checkBiometricStatus, showErrorDialog, signin} from '../legacy/actions'
import IndexScreen from '../legacy/components/IndexScreen'
import MaintenanceScreen from '../legacy/components/MaintenanceScreen'
import BiometricAuthScreen from '../legacy/components/Send/BiometricAuthScreen'
import KeyStore from '../legacy/crypto/KeyStore'
import env from '../legacy/env'
import {canBiometricEncryptionBeEnabled, recreateAppSignInKeys} from '../legacy/helpers/deviceSettings'
import {errorMessages} from '../legacy/i18n/global-messages'
import {
  canEnableBiometricSelector,
  installationIdSelector,
  isAppSetupCompleteSelector,
  isAuthenticatedSelector,
  isMaintenanceSelector,
  isSystemAuthEnabledSelector,
} from '../legacy/selectors'
import type {State} from '../legacy/state'
import {Boundary} from './components'
import {CustomPinScreen} from './FirstRun/CustomPinScreen'
import {FirstRunNavigator} from './FirstRun/FirstRunNavigator'
import {CustomPinLoginScreen} from './Login'
import {AppRoutes} from './navigation'
import StorybookScreen from './StorybookScreen'
import {WalletInitNavigator} from './WalletInit/WalletInitNavigator'
import {WalletNavigator} from './WalletNavigator'

const IS_STORYBOOK = env.getBoolean('IS_STORYBOOK', false)

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

const Stack = createStackNavigator<AppRoutes>()
const NavigatorSwitch = () => {
  const strings = useStrings()
  const isMaintenance = useSelector(isMaintenanceSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const isAuthenticated = useSelector(isAuthenticatedSelector)
  const hasAnyWallet = useSelector(hasAnyWalletSelector)
  const isAppSetupComplete = useSelector(isAppSetupCompleteSelector)
  const canEnableBiometrics = useSelector(canEnableBiometricSelector)
  const installationId = useSelector(installationIdSelector)
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', async () => {
      await dispatch(checkBiometricStatus())
      queryClient.invalidateQueries(['walletMetas'])
    })
    return () => appStateSubscription?.remove()
  }, [dispatch, queryClient])

  useEffect(() => {
    if (hasAnyWallet && !isAuthenticated && isSystemAuthEnabled && !canEnableBiometrics && !isMaintenance) {
      Alert.alert(strings.biometricsChangeTitle, strings.biometricsChangeMessage)
    }
  }, [hasAnyWallet, isAuthenticated, isSystemAuthEnabled, canEnableBiometrics, isMaintenance, strings])

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Initial Route */}
      <Stack.Group>
        {isMaintenance && <Stack.Screen name="maintenance" component={MaintenanceScreen} />}
        {!isAppSetupComplete && !hasAnyWallet && <Stack.Screen name="first-run" component={FirstRunNavigator} />}
      </Stack.Group>

      {/* Not Authenticated */}
      {!isAuthenticated && hasAnyWallet && (
        <Stack.Group>
          {!isSystemAuthEnabled && (
            <Stack.Screen
              name="custom-pin-auth"
              component={CustomPinLoginScreen}
              options={{title: strings.loginPinTitle}}
            />
          )}
          {isSystemAuthEnabled && canEnableBiometrics && (
            <Stack.Screen
              name="bio-auth-initial"
              component={BiometricAuthScreen}
              options={{headerShown: false}}
              initialParams={{
                keyId: installationId,
                onSuccess: () => {
                  dispatch(signin())
                },
                onFail: async (reason: string, intl: IntlShape) => {
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
            <Stack.Screen //
              name="setup-custom-pin"
              component={CustomPinScreen}
              options={{title: strings.customPinTitle}}
            />
          )}
        </Stack.Group>
      )}

      {/* Authenticated */}
      {(isAuthenticated || !hasAnyWallet) && (
        <Stack.Group>
          <Stack.Screen name="app-root" component={WalletNavigator} />
          <Stack.Screen name="new-wallet" component={WalletInitNavigator} />
          <Stack.Screen name="biometrics" component={BiometricAuthScreen} options={{headerShown: false}} />
        </Stack.Group>
      )}

      {/* Development */}
      {__DEV__ && (
        <Stack.Group>
          <Stack.Screen name="screens-index" component={IndexScreen} options={{headerShown: false}} />
          <Stack.Screen name="storybook" component={StorybookScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

const StoryBook = () => (
  <Stack.Navigator>
    <Stack.Screen name="storybook" component={StorybookScreen} />
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
