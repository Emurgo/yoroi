// @flow

import React from 'react'
import {connect} from 'react-redux'
import {Alert, View, StatusBar} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from '../WalletInit/WalletDescription'
import {Button} from '../UiKit'
import styles from './styles/AppStartScreen.style'
import {ROOT_ROUTES} from '../../RoutesList'
import {withTranslations} from '../../utils/renderUtils'
import {
  appIdSelector,
  customPinHashSelector,
  systemAuthSupportSelector,
} from '../../selectors'
import {
  recreateAppSignInKeys,
  canFingerprintEncryptionBeEnabled,
} from '../../helpers/deviceSettings'

import type {State} from '../../state'

const getTranslations = (state: State) => state.trans.AppStartScreen

const AppStartScreen = ({navigateLogin, translations}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar barStyle="light-content" backgroundColor="#254BC9" />
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
  </SafeAreaView>
)

const onFail = (navigation, appId) => (reason) => {
  if (reason === 'INVALID_KEY') {
    recreateAppSignInKeys(appId)
  }
  navigation.navigate(ROOT_ROUTES.LOGIN)
}

export default compose(
  connect((state) => ({
    appId: appIdSelector(state),
    customPinHash: customPinHashSelector(state),
    isSystemAuthEnabled: systemAuthSupportSelector(state),
  })),
  withTranslations(getTranslations),
  withHandlers({
    navigateLogin: ({
      isSystemAuthEnabled,
      customPinHash,
      navigation,
      appId,
    }) => async () => {
      const hasEnrolledFingerprints = await canFingerprintEncryptionBeEnabled()

      if (hasEnrolledFingerprints && isSystemAuthEnabled) {
        navigation.navigate(ROOT_ROUTES.BIO_AUTH, {
          encryptedDataId: appId,
          onSuccess: () => navigation.navigate(ROOT_ROUTES.WALLET_SELECTION),
          onFail: onFail(navigation, appId),
        })
      } else {
        if (customPinHash) {
          navigation.navigate(ROOT_ROUTES.CUSTOM_PIN_AUTH)
        } else {
          Alert.alert(
            'l10n Biometrics was turned off',
            'l10n It seems that you turned off biometrics, please turn it on',
            [{text: 'l10n OK'}],
          )
        }
      }
    },
  }),
)(AppStartScreen)
