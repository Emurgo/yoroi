// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {Button} from '../UiKit'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {setSystemAuth, showErrorDialog} from '../../actions'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {enrolledFingerprintsSelector} from '../../selectors'
import styles from './styles/BiometricsLinkScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.BiometricsLinkScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  hasEnrolledFingerprints: boolean,
  linkBiometricsSignIn: () => mixed,
  cancelLinking: () => mixed,
}

const BiometricsLinkScreen = ({
  translations,
  hasEnrolledFingerprints,
  linkBiometricsSignIn,
  cancelLinking,
}: Props) => (
  <FingerprintScreenBase
    headings={translations.headings}
    subHeadings={translations.subHeadings}
    buttons={[
      <Button
        key={'cancel'}
        outline
        title={translations.notNowButton}
        onPress={cancelLinking}
        containerStyle={styles.cancel}
      />,
      <Button
        key={'link'}
        title={translations.linkButton}
        onPress={linkBiometricsSignIn}
        disabled={!hasEnrolledFingerprints}
        containerStyle={styles.link}
      />,
    ]}
    error={!hasEnrolledFingerprints && translations.enableFingerprintsMessage}
  />
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      hasEnrolledFingerprints: enrolledFingerprintsSelector(state),
    }),
    {setSystemAuth},
  ),
  withHandlers({
    linkBiometricsSignIn: ({navigation, setSystemAuth}) => () => {
      setSystemAuth(true)
        .then(() => navigation.navigate(SETTINGS_ROUTES.MAIN))
        .catch(() =>
          showErrorDialog((dialogs) => dialogs.disableEasyConfirmationFirst),
        )
    },
    cancelLinking: ({navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.MAIN),
  }),
)(BiometricsLinkScreen)
