import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '../../auth/AuthProvider'
import {Button, Checkbox, PleaseWaitModal, Spacer, StatusBar} from '../../components'
import {useLanguage} from '../../i18n'
import globalMessages from '../../i18n/global-messages'
import {TermsOfService} from '../../Legal'
import {FirstRunRouteNavigation} from '../../navigation'
import {useAuthOsEnabled, useEnableAuthWithOs} from '../../yoroi-wallets/auth'

export const TermsOfServiceScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<FirstRunRouteNavigation>()
  const {languageCode} = useLanguage()
  const [acceptedTos, setAcceptedTos] = React.useState(false)

  // should be another step in the first run flow -> auth method
  const {login} = useAuth()
  const authOsEnabled = useAuthOsEnabled()
  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: login,
    onError: () => navigation.navigate('enable-login-with-pin'),
  })

  const onAccept = () => {
    if (authOsEnabled) {
      enableAuthWithOs()
    } else {
      navigation.navigate('enable-login-with-pin')
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TermsOfService languageCode={languageCode} />
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
          onPress={onAccept}
          disabled={!acceptedTos || isLoading}
          title={strings.continueButton}
          testID="acceptTosButton"
        />
      </Footer>

      <PleaseWaitModal title={strings.savingConsentModalTitle} spinnerText={strings.pleaseWait} visible={isLoading} />
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
    error: intl.formatMessage(globalMessages.error),
    aggreeClause: intl.formatMessage(messages.aggreeClause),
    continueButton: intl.formatMessage(messages.continueButton),
    savingConsentModalTitle: intl.formatMessage(messages.savingConsentModalTitle),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}
