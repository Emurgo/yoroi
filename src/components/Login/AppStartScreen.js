// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'


import WalletDescription from '../WalletInit/WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import styles from './styles/AppStartScreen.style'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import KeyStore from '../../crypto/KeyStore'
import {
  installationIdSelector,
  customPinHashSelector,
  isSystemAuthEnabledSelector,
} from '../../selectors'
import {
  recreateAppSignInKeys,
  canBiometricEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {showErrorDialog} from '../../actions'

import type {State} from '../../state'

const messages = defineMessages({
  loginButton: {
    id: 'components.login.appstartscreen.loginButton',
    defaultMessage: '!!!Login',
    description: "some desc",
  },
})

const AppStartScreen = ({navigateLogin, intl, locale}) => {
  return (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <WalletDescription />
        </View>

        <Button
          outline
          onPress={navigateLogin}
          title={intl.formatMessage(messages.loginButton)}
        />
      </View>
    </ScreenBackground>
  </SafeAreaView>
)}

export default injectIntl(compose(
  connect((state) => ({
    installationId: installationIdSelector(state),
    customPinHash: customPinHashSelector(state),
    isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
    locale: state.appSettings.languageCode
  })),
  withHandlers({
    navigateLogin: ({
      isSystemAuthEnabled,
      customPinHash,
      navigation,
      installationId,
    }) => async () => {
      if (!isSystemAuthEnabled) {
        navigation.navigate(ROOT_ROUTES.CUSTOM_PIN_AUTH)

        return
      }

      if (await canBiometricEncryptionBeEnabled()) {
        navigation.navigate(ROOT_ROUTES.BIO_AUTH, {
          keyId: installationId,
          onSuccess: () =>
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION),
          onFail: async (reason) => {
            if (reason === KeyStore.REJECTIONS.INVALID_KEY) {
              if (await canBiometricEncryptionBeEnabled()) {
                recreateAppSignInKeys(installationId)
              } else {
                await showErrorDialog(
                  (dialogs) => dialogs.biometricsIsTurnedOff,
                )
              }
            }
            navigation.navigate(ROOT_ROUTES.LOGIN)
          },
        })
      } else {
        await showErrorDialog((dialogs) => dialogs.biometricsIsTurnedOff)
      }
    },
  }),
)(AppStartScreen))
