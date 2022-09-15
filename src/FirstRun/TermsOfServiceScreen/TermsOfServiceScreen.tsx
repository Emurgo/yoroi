import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {useAuthOsAppKey, useAuthOsErrorDecoder, useCanEnableAuthOs, useSaveAuthMethod, useSaveSecret} from '../../auth'
import {useAuth} from '../../auth/AuthProvider'
import {Button, Checkbox, PleaseWaitModal, Spacer, StatusBar} from '../../components'
import {useLanguage} from '../../i18n'
import globalMessages from '../../i18n/global-messages'
import {acceptAndSaveTos} from '../../legacy/actions'
import {isEmptyString} from '../../legacy/utils'
import {TermsOfService} from '../../Legal'
import {FirstRunRouteNavigation} from '../../navigation'
import {useStorage} from '../../Storage'

export const TermsOfServiceScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<FirstRunRouteNavigation>()
  const {languageCode} = useLanguage()
  const [acceptedTos, setAcceptedTos] = React.useState(false)
  const [savingConsent, setSavingConsent] = React.useState(false)

  const {login} = useAuth()
  const {canEnableOsAuth} = useCanEnableAuthOs()
  const storage = useStorage()
  const secretKey = useAuthOsAppKey(storage)
  if (isEmptyString(secretKey)) throw new Error('Invalid secret key')

  const decodeAuthOsError = useAuthOsErrorDecoder()
  const onError = (error) => {
    const errorMessage = decodeAuthOsError(error)
    if (!isEmptyString(errorMessage)) Alert.alert(strings.error, errorMessage)
  }

  const {saveAuthMethod, isLoading: savingAuthMethod, reset: resetSaveAuthMethod} = useSaveAuthMethod(storage)
  const {saveSecret, isLoading: savingSecret} = useSaveSecret({
    onMutate: () => {
      resetSaveAuthMethod()
    },
  })

  const onLinkAuthWithOs = () => {
    saveSecret(
      // for the app the value doesn't matter (only auth)
      {key: secretKey, value: secretKey},
      {
        onSuccess: () => {
          saveAuthMethod('os', {
            onSuccess: () => {
              dispatch(acceptAndSaveTos())
              login()
            },
            onError,
          })
        },
        onError,
      },
    )
  }

  const isLoading = savingSecret || savingAuthMethod || savingConsent

  const dispatch = useDispatch()
  const onAccept = async () => {
    setSavingConsent(true)

    if (canEnableOsAuth) {
      onLinkAuthWithOs()
    } else {
      await dispatch(acceptAndSaveTos())
      navigation.navigate('link-auth-with-pin')
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
          disabled={!acceptedTos || isLoading || savingConsent}
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
