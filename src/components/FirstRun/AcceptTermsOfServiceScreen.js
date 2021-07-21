// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {SafeAreaView} from 'react-native-safe-area-context'
import {withStateHandlers, withHandlers} from 'recompose'
import {ScrollView, Platform} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import TermsOfService from '../Common/TermsOfService'
import {Checkbox, Button, StatusBar, PleaseWaitModal} from '../UiKit'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import {isSystemAuthEnabledSelector} from '../../selectors'
import {acceptAndSaveTos, setSystemAuth, signin} from '../../actions'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import {CONFIG} from '../../config/config'

import styles from './styles/AcceptTermsOfServiceScreen.styles'
import globalMessages from '../../i18n/global-messages'

const messages = defineMessages({
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
  intl: IntlShape,
  acceptedTos: boolean,
  setAcceptedTos: (accepted: boolean) => any,
  handleAccepted: () => any,
  savingConsent: boolean,
}

const AcceptTermsOfServiceScreen = ({intl, acceptedTos, setAcceptedTos, handleAccepted, savingConsent}: Props) => (
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
      {acceptAndSaveTos, setSystemAuth, signin},
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
      handleAccepted:
        ({navigation, acceptAndSaveTos, setSystemAuth, setSavingConsent, signin}) =>
        async () => {
          setSavingConsent(true)
          await acceptAndSaveTos()

          const canSystemAuthBeEnabled = await canBiometricEncryptionBeEnabled()

          // temporary disable biometric auth for Android SDK >= 29
          // TODO(v-almonacid): re-enable for Android SDK >= 29 once the module
          // is updated
          const shouldNotEnableBiometricAuth =
            Platform.OS === 'android' && CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version)

          if (canSystemAuthBeEnabled && !shouldNotEnableBiometricAuth) {
            await setSystemAuth(true)
            // note(v-almonacid) here we don't setSavingConsent(false)
            // because signin() will likely unmount the component before the
            // update is dispatched
            signin()
          } else {
            setSavingConsent(false)
            navigation.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN)
          }
        },
    }),
  )(AcceptTermsOfServiceScreen),
)
