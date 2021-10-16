// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {Platform, ScrollView, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {acceptAndSaveTos, setSystemAuth, signin} from '../../actions'
import {CONFIG} from '../../config/config'
import {canBiometricEncryptionBeEnabled} from '../../helpers/deviceSettings'
import globalMessages from '../../i18n/global-messages'
import {FIRST_RUN_ROUTES} from '../../RoutesList'
import TermsOfService from '../Common/TermsOfService'
import {Button, Checkbox, PleaseWaitModal, Spacer, StatusBar} from '../UiKit'
import styles from './styles/AcceptTermsOfServiceScreen.styles'

const messages = defineMessages({
  aggreeClause: {
    id: 'components.firstrun.acepttermsofservicescreen.aggreeClause',
    defaultMessage: '!!!I agree with terms of service',
  },
  continueButton: {
    id: 'components.firstrun.acepttermsofservicescreen.continueButton',
    defaultMessage: '!!!Accept',
  },
  savingConsentModalTitle: {
    id: 'components.firstrun.acepttermsofservicescreen.savingConsentModalTitle',
    defaultMessage: '!!!Initializing',
  },
})

type Props = {
  intl: IntlShape,
}

const AcceptTermsOfServiceScreen = ({intl}: Props) => {
  const navigation = useNavigation()
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
