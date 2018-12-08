// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import {Button} from '../UiKit'
import FingerprintScreenBase from '../Common/FingerprintScreenBase'
import {setSystemAuth, showErrorDialog} from '../../actions'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {canFingerprintEncryptionBeEnabled} from '../../helpers/deviceSettings'

import styles from './styles/BiometricsLinkScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.BiometricsLinkScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  linkBiometricsSignIn: () => mixed,
  cancelLinking: () => mixed,
}

const BiometricsLinkScreen = ({
  translations,
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
        containerStyle={styles.link}
      />,
    ]}
  />
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
    }),
    {setSystemAuth},
  ),
  withHandlers({
    linkBiometricsSignIn: ({navigation, setSystemAuth}) => async () => {
      if (await canFingerprintEncryptionBeEnabled()) {
        setSystemAuth(true)
          .then(() => navigation.navigate(SETTINGS_ROUTES.MAIN))
          .catch(() =>
            showErrorDialog((dialogs) => dialogs.disableEasyConfirmationFirst),
          )
      } else {
        showErrorDialog((dialogs) => dialogs.enableFingerprintsFirst)
      }
    },
    cancelLinking: ({navigation}) => () =>
      navigation.navigate(SETTINGS_ROUTES.MAIN),
  }),
)(BiometricsLinkScreen)
