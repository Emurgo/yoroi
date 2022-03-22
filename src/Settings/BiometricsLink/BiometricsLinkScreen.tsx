import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import {useDispatch} from 'react-redux'

import {setSystemAuth, showErrorDialog} from '../../../legacy/actions'
import {canBiometricEncryptionBeEnabled} from '../../../legacy/helpers/deviceSettings'
import {errorMessages} from '../../../legacy/i18n/global-messages'
import {SETTINGS_ROUTES} from '../../../legacy/RoutesList'
import {FingerprintScreenBase} from '../../BiometricAuth'
import {Button} from '../../components'

export const BiometricsLinkScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
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
      headings={[strings.heading]}
      subHeadings={[strings.subHeading1, strings.subHeading2]}
      buttons={[
        <Button
          key={'cancel'}
          outline
          title={strings.notNowButton}
          onPress={cancelLinking}
          containerStyle={styles.cancel}
        />,
        <Button key={'link'} title={strings.linkButton} onPress={linkBiometricsSignIn} containerStyle={styles.link} />,
      ]}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    heading: intl.formatMessage(messages.heading),
    subHeading1: intl.formatMessage(messages.subHeading1),
    subHeading2: intl.formatMessage(messages.subHeading2),
    notNowButton: intl.formatMessage(messages.notNowButton),
    linkButton: intl.formatMessage(messages.linkButton),
    enableFingerprintsMessage: intl.formatMessage(messages.enableFingerprintsMessage),
  }
}

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

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
    marginRight: 15,
  },
  link: {
    flex: 1,
  },
})
