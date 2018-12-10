// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SafeAreaView} from 'react-navigation'
import {withStateHandlers, withHandlers} from 'recompose'
import {ScrollView} from 'react-native'

import TermsOfService from '../Common/TermsOfService'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Checkbox, Button, StatusBar} from '../UiKit'
import {FIRST_RUN_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {systemAuthSupportSelector} from '../../selectors'
import {acceptAndSaveTos, setSystemAuth} from '../../actions'
import {canFingerprintEncryptionBeEnabled} from '../../helpers/deviceSettings'

import styles from './styles/AcceptTermsOfServiceScreen.styles'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  acceptedTos: boolean,
  setAcceptedTos: (accepted: boolean) => any,
  handleAccepted: () => any,
}

const AcceptTermsOfServiceScreen = ({
  translations,
  acceptedTos,
  setAcceptedTos,
  handleAccepted,
}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScrollView>
      <TermsOfService />
    </ScrollView>

    <Checkbox
      style={styles.checkbox}
      checked={acceptedTos}
      text={translations.aggreeClause}
      onChange={setAcceptedTos}
    />
    <Button
      onPress={handleAccepted}
      disabled={!acceptedTos}
      title={translations.continueButton}
    />
  </SafeAreaView>
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isSystemAuthEnabled: systemAuthSupportSelector(state),
    }),
    {acceptAndSaveTos, setSystemAuth},
  ),
  withStateHandlers(
    {
      acceptedTos: false,
    },
    {
      setAcceptedTos: (state) => (value) => ({acceptedTos: value}),
    },
  ),
  withHandlers({
    handleAccepted: ({
      navigation,
      isSystemAuthEnabled,
      acceptAndSaveTos,
      setSystemAuth,
    }) => async () => {
      await acceptAndSaveTos()

      const canSystemAuthBeEnabled = await canFingerprintEncryptionBeEnabled()
      if (canSystemAuthBeEnabled) {
        await setSystemAuth(true)

        navigation.navigate(WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH)
      } else {
        navigation.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN, {
          onSuccess: () =>
            navigation.navigate(
              WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH,
            ),
        })
      }
    },
  }),
  withNavigationTitle(({translations}) => translations.title),
)(AcceptTermsOfServiceScreen)
