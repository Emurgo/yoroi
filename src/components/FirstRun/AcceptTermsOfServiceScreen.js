// @flow

import React from 'react'
import {useDispatch} from 'react-redux'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ScrollView, Platform, View} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import TermsOfService from '../Common/TermsOfService'
import {Checkbox, Button, StatusBar, PleaseWaitModal} from '../UiKit'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import {acceptAndSaveTos, setSystemAuth, signin} from '../../actions'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import {CONFIG} from '../../config/config'

import styles from './styles/AcceptTermsOfServiceScreen.styles'
import globalMessages from '../../i18n/global-messages'

import type {Navigation} from '../../types/navigation'

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
  navigation: Navigation,
}

const AcceptTermsOfServiceScreen = ({intl, navigation}: Props) => {
  const [acceptedTos, setAcceptedTos] = React.useState(false)
  const [savingConsent, setSavingConsent] = React.useState(false)

  const dispatch = useDispatch()
  const handleAccepted = async () => {
    setSavingConsent(true)
    await dispatch(acceptAndSaveTos())

    const canSystemAuthBeEnabled = await canBiometricEncryptionBeEnabled()

    // temporary disable biometric auth for Android SDK >= 29
    // TODO(v-almonacid): re-enable for Android SDK >= 29 once the module
    // is updated
    const shouldNotEnableBiometricAuth =
      Platform.OS === 'android' && CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version)

    if (canSystemAuthBeEnabled && !shouldNotEnableBiometricAuth) {
      await dispatch(setSystemAuth(true))
      // note(v-almonacid) here we don't setSavingConsent(false)
      // because signin() will likely unmount the component before the
      // update is dispatched
      dispatch(signin())
    } else {
      setSavingConsent(false)
      navigation.navigate(FIRST_RUN_ROUTES.CUSTOM_PIN)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TermsOfService />
      </ScrollView>

      <Spacer />

      <Footer>
        <Checkbox
          checked={acceptedTos}
          text={intl.formatMessage(messages.aggreeClause)}
          onChange={setAcceptedTos}
          testID="acceptTosCheckbox"
        />

        <Spacer />

        <Button
          onPress={handleAccepted}
          disabled={!acceptedTos}
          title={intl.formatMessage(messages.continueButton)}
          testID="acceptTosButton"
        />
      </Footer>

      <PleaseWaitModal
        title={intl.formatMessage(messages.savingConsentModalTitle)}
        spinnerText={intl.formatMessage(globalMessages.pleaseWait)}
        visible={savingConsent}
      />
    </SafeAreaView>
  )
}
export default injectIntl(AcceptTermsOfServiceScreen)

const Footer = ({children}: {children: React$Node}) => <View style={styles.footer}>{children}</View>
const Spacer = () => <View style={styles.spacer} />
