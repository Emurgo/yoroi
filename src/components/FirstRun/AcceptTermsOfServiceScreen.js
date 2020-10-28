// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SafeAreaView} from 'react-native-safe-area-context'
import {withStateHandlers, withHandlers} from 'recompose'
import {ScrollView} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'

import TermsOfService from '../Common/TermsOfService'
import {withNavigationTitle} from '../../utils/renderUtils'
import {Checkbox, Button, StatusBar, PleaseWaitModal} from '../UiKit'
import {FIRST_RUN_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {isSystemAuthEnabledSelector} from '../../selectors'
import {acceptAndSaveTos, setSystemAuth} from '../../actions'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'

import styles from './styles/AcceptTermsOfServiceScreen.styles'
import globalMessages from '../../i18n/global-messages'

const messages = defineMessages({
  title: {
    id: 'components.firstrun.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
    description: 'some desc',
  },
  aggreeClause: {
    id: 'components.firstrun.acepttermsofservicescreen.aggreeClause',
    defaultMessage: '!!!I agree with terms of service',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.firstrun.acepttermsofservicescreen.continueButton',
    defaultMessage: '!!!Accept',
    description: 'some desc',
  },
  savingConsentModalTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.savingConsentModalTitle',
    defaultMessage: '!!!Initializing',
    description: 'some desc',
  },
})

type Props = {
  intl: any,
  acceptedTos: boolean,
  setAcceptedTos: (accepted: boolean) => any,
  handleAccepted: () => any,
  savingConsent: boolean,
}

const AcceptTermsOfServiceScreen = ({
  intl,
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
      text={intl.formatMessage(messages.aggreeClause)}
      onChange={setAcceptedTos}
      testID="acceptTosCheckbox"
    />
    <Button
      onPress={handleAccepted}
      disabled={!acceptedTos}
      title={intl.formatMessage(messages.continueButton)}
      testID="acceptTosButton"
    />

    <PleaseWaitModal
      title={intl.formatMessage(messages.savingConsentModalTitle)}
      spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
      visible={savingConsent}
    />
  </SafeAreaView>
)

export default injectIntl(
  compose(
    connect(
      (state) => ({
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
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
  )(AcceptTermsOfServiceScreen),
)
