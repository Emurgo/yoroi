import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {CONFIG} from '../../../legacy/config/config'
import globalMessages from '../../../legacy/i18n/global-messages'
import {Button, Checkbox, PleaseWaitModal, Spacer, StatusBar} from '../../components'
import {acceptAndSaveTos, setSystemAuth, signin} from '../../legacy/actions'
import {canBiometricEncryptionBeEnabled} from '../../legacy/deviceSettings'
import {FIRST_RUN_ROUTES} from '../../legacy/RoutesList'
import {TermsOfService} from './TermsOfService'

export const TermsOfServiceScreen = () => {
  const strings = useStrings()
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
          text={strings.aggreeClause}
          onChange={setAcceptedTos}
          testID="acceptTosCheckbox"
        />

        <Spacer />

        <Button
          onPress={handleAccepted}
          disabled={!acceptedTos}
          title={strings.continueButton}
          testID="acceptTosButton"
        />
      </Footer>

      <PleaseWaitModal
        title={strings.savingConsentModalTitle}
        spinnerText={strings.pleaseWait}
        visible={savingConsent}
      />
    </SafeAreaView>
  )
}

const Footer = ({children}: {children: React.ReactNode}) => <View style={styles.footer}>{children}</View>

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  footer: {
    padding: 16,
  },
})

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

const useStrings = () => {
  const intl = useIntl()

  return {
    aggreeClause: intl.formatMessage(messages.aggreeClause),
    continueButton: intl.formatMessage(messages.continueButton),
    savingConsentModalTitle: intl.formatMessage(messages.savingConsentModalTitle),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}
