// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SafeAreaView} from 'react-navigation'
import {withStateHandlers, withHandlers} from 'recompose'
import {ScrollView} from 'react-native'

import TermsOfService from '../Common/TermsOfService'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Checkbox, Button, StatusBar, PleaseWaitModal} from '../UiKit'
import {FIRST_RUN_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {isSystemAuthEnabledSelector} from '../../selectors'
import {acceptAndSaveTos, setSystemAuth} from '../../actions'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'

import styles from './styles/AcceptTermsOfServiceScreen.styles'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.TermsOfServiceScreen

type Props = {
  translations: SubTranslation<typeof getTranslations>,
  acceptedTos: boolean,
  setAcceptedTos: (accepted: boolean) => any,
  handleAccepted: () => any,
  savingConsent: boolean,
}

const AcceptTermsOfServiceScreen = ({
  translations,
  acceptedTos,
  setAcceptedTos,
  handleAccepted,
  savingConsent,
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

    <PleaseWaitModal
      title={translations.savingConsentModalTitle}
      spinnerText={translations.pleaseWait}
      visible={savingConsent}
    />
  </SafeAreaView>
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
    }),
    {acceptAndSaveTos, setSystemAuth},
  ),
  withStateHandlers(
    {
      acceptedTos: false,
      savingConsent: false,
    },
    {
      setAcceptedTos: () => (acceptedTos) => ({acceptedTos}),
      setSavingConsent: () => (savingConsent) => ({savingConsent}),
    },
  ),
  withHandlers({
    handleAccepted: ({
      navigation,
      isSystemAuthEnabled,
      acceptAndSaveTos,
      setSystemAuth,
      setSavingConsent,
    }) => async () => {
      setSavingConsent(true)
      await acceptAndSaveTos()

      const canSystemAuthBeEnabled = await canBiometricEncryptionBeEnabled()

      const navigateToWalletCreateRestore = () =>
        navigation.navigate(WALLET_INIT_ROUTES.INITIAL_CREATE_RESTORE_SWITCH)

      if (canSystemAuthBeEnabled) {
        await setSystemAuth(true)

        setSavingConsent(false)
        navigateToWalletCreateRestore()
      } else {
        setSavingConsent(false)
        navigation.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN, {
          onSuccess: navigateToWalletCreateRestore,
        })
      }
    },
  }),
  withNavigationTitle(({translations}) => translations.title),
)(AcceptTermsOfServiceScreen)
