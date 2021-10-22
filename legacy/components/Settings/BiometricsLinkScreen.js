// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'

import {setSystemAuth, showErrorDialog} from '../../actions'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import {errorMessages} from '../../i18n/global-messages'
import {SETTINGS_ROUTES} from '../../RoutesList'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {Button} from '../UiKit'
import styles from './styles/BiometricsLinkScreen.style'

const messages = defineMessages({
  enableFingerprintsMessage: {
    id: 'components.settings.biometricslinkscreen.enableFingerprintsMessage',
    defaultMessage: '!!!Enable use of fingerprints in device settings first!',
  },
  notNowButton: {
    id: 'components.settings.biometricslinkscreen.notNowButton',
    defaultMessage: '!!!Not now',
  },
  linkButton: {
    id: 'components.settings.biometricslinkscreen.linkButton',
    defaultMessage: '!!!Link',
  },
  heading: {
    id: 'components.settings.biometricslinkscreen.heading',
    defaultMessage: '!!!Use your fingerprint',
  },
  subHeading1: {
    id: 'components.settings.biometricslinkscreen.subHeading1',
    defaultMessage: '!!!for faster, easier access',
  },
  subHeading2: {
    id: 'components.settings.biometricslinkscreen.subHeading2',
    defaultMessage: '!!!to your Yoroi wallet',
  },
})

const BiometricsLinkScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const linkBiometricsSignIn = async () => {
    if (await canBiometricEncryptionBeEnabled()) {
      dispatch(setSystemAuth(true))
        .then(() => navigation.navigate(SETTINGS_ROUTES.MAIN))
        .catch(() => showErrorDialog(errorMessages.disableEasyConfirmationFirst, intl))
    } else {
      await showErrorDialog(errorMessages.enableFingerprintsFirst, intl)
    }
  }
  const cancelLinking = () => navigation.navigate(SETTINGS_ROUTES.MAIN)

  return (
    <FingerprintScreenBase
      headings={[intl.formatMessage(messages.heading)]}
      subHeadings={[intl.formatMessage(messages.subHeading1), intl.formatMessage(messages.subHeading2)]}
      buttons={[
        <Button
          key={'cancel'}
          outline
          title={intl.formatMessage(messages.notNowButton)}
          onPress={cancelLinking}
          containerStyle={styles.cancel}
        />,
        <Button
          key={'link'}
          title={intl.formatMessage(messages.linkButton)}
          onPress={linkBiometricsSignIn}
          containerStyle={styles.link}
        />,
      ]}
    />
  )
}

export default BiometricsLinkScreen
