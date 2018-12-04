// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from '../WalletInit/WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import styles from './styles/AppStartScreen.style'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import KeyStore from '../../crypto/KeyStore'
import {withTranslations} from '../../utils/renderUtils'
import {
  installationIdSelector,
  customPinHashSelector,
  systemAuthSupportSelector,
} from '../../selectors'
import {
  recreateAppSignInKeys,
  canFingerprintEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {showErrorDialog} from '../../actions'

import type {State} from '../../state'

const getTranslations = (state: State) => state.trans.AppStartScreen

const AppStartScreen = ({navigateLogin, translations}) => (
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
          title={translations.loginButton}
        />
      </View>
    </ScreenBackground>
  </SafeAreaView>
)

const onFail = (navigation, installationId) => async (reason) => {
  if (reason === KeyStore.REJECTIONS.INVALID_KEY) {
    const hasEnrolledFingerprints = await canFingerprintEncryptionBeEnabled()
    if (hasEnrolledFingerprints) {
      recreateAppSignInKeys(installationId)
    } else {
      await showErrorDialog((dialogs) => dialogs.biometricsIsTurnedOff)
    }
  }
  navigation.navigate(ROOT_ROUTES.LOGIN)
}

export default compose(
  connect((state) => ({
    installationId: installationIdSelector(state),
    customPinHash: customPinHashSelector(state),
    isSystemAuthEnabled: systemAuthSupportSelector(state),
  })),
  withTranslations(getTranslations),
  withHandlers({
    navigateLogin: ({
      isSystemAuthEnabled,
      customPinHash,
      navigation,
      installationId,
    }) => () => {
      if (isSystemAuthEnabled) {
        navigation.navigate(ROOT_ROUTES.BIO_AUTH, {
          keyId: installationId,
          onSuccess: () =>
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION),
          onFail: onFail(navigation, installationId),
        })
      } else {
        navigation.navigate(ROOT_ROUTES.CUSTOM_PIN_AUTH)
      }
    },
  }),
)(AppStartScreen)
