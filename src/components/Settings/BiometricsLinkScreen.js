// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Button} from '../UiKit'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {setSystemAuth, showErrorDialog} from '../../actions'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import {errorMessages} from '../../i18n/global-messages'

import styles from './styles/BiometricsLinkScreen.style'

const messages = defineMessages({
  enableFingerprintsMessage: {
    id: 'components.settings.biometricslinkscreen.enableFingerprintsMessage',
    defaultMessage: 'Enable use of fingerprints in device settings first!',
  },
  notNowButton: {
    id: 'components.settings.biometricslinkscreen.notNowButton',
    defaultMessage: '!!!Not now',
  },
  linkButton: {
    id: 'components.settings.biometricslinkscreen.linkButton',
    defaultMessage: '!!!Link',
    description: 'some desc',
  },
  heading: {
    id: 'components.settings.biometricslinkscreen.heading',
    defaultMessage: '!!!Use your fingerprint',
    description: 'some desc',
  },
  subHeading1: {
    id: 'components.settings.biometricslinkscreen.subHeading1',
    defaultMessage: '!!!for faster, easier access',
    description: 'some desc',
  },
  subHeading2: {
    id: 'components.settings.biometricslinkscreen.subHeading2',
    defaultMessage: '!!!to your Yoroi wallet',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  linkBiometricsSignIn: () => mixed,
  cancelLinking: () => mixed,
}

const BiometricsLinkScreen = ({
  intl,
  linkBiometricsSignIn,
  cancelLinking,
}: Props) => (
  <FingerprintScreenBase
    headings={[intl.formatMessage(messages.heading)]}
    subHeadings={[
      intl.formatMessage(messages.subHeading1),
      intl.formatMessage(messages.subHeading2),
    ]}
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

export default injectIntl(
  compose(
    connect(
      (state) => ({}),
      {setSystemAuth},
    ),
    withHandlers({
      linkBiometricsSignIn: ({navigation, setSystemAuth, intl}) => async () => {
        if (await canBiometricEncryptionBeEnabled()) {
          setSystemAuth(true)
            .then(() => navigation.navigate(SETTINGS_ROUTES.MAIN))
            .catch(() =>
              showErrorDialog(errorMessages.disableEasyConfirmationFirst, intl),
            )
        } else {
          showErrorDialog(errorMessages.enableFingerprintsFirst, intl)
        }
      },
      cancelLinking: ({navigation}) => () =>
        navigation.navigate(SETTINGS_ROUTES.MAIN),
    }),
  )(BiometricsLinkScreen),
)
