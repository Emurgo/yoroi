import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {useAuthOsAppKey, useAuthOsErrorDecoder, useLoadSecret, useSaveAuthMethod, useSaveSecret} from '../../auth'
import {Button} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {isEmptyString} from '../../legacy/utils'
import {OsAuthBaseScreen} from '../../OsAuth'
import {useStorage} from '../../Storage'

export const LinkAuthWithOsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()

  const storage = useStorage()
  const secretKey = useAuthOsAppKey(storage)
  if (isEmptyString(secretKey)) throw new Error('Invalid secret key')

  const [error, setError] = React.useState<string | undefined>()
  const decodeAuthOsError = useAuthOsErrorDecoder()
  const onError = (error) => {
    const errorMessage = decodeAuthOsError(error)
    if (!isEmptyString(errorMessage)) setError(errorMessage)
  }

  const {saveAuthMethod, isLoading: savingAuthMethod, reset: resetSaveAuthMethod} = useSaveAuthMethod(storage)
  const {
    loadSecret,
    isLoading: loadingSecret,
    reset: resetLoadSecret,
  } = useLoadSecret({
    retry: false,
  })
  const {saveSecret, isLoading: savingSecret} = useSaveSecret({
    onMutate: () => {
      resetLoadSecret()
      resetSaveAuthMethod()
      setError(() => undefined)
    },
  })

  const onLink = () => {
    saveSecret(
      // for the app the value doesn't matter (only auth)
      {key: secretKey, value: secretKey},
      {
        onSuccess: ({service: key}) =>
          loadSecret(
            {
              key,
              authenticationPrompt: {
                title: strings.authorize,
                cancel: strings.cancel,
              },
            },
            {
              onSuccess: () => {
                saveAuthMethod('os', {
                  onSuccess: () => navigation.goBack(),
                  onError,
                })
              },
              onError,
            },
          ),
        onError,
      },
    )
  }

  const isLoading = savingSecret || loadingSecret || savingAuthMethod

  return (
    <OsAuthBaseScreen
      headings={[strings.heading]}
      subHeadings={[strings.subHeading1, strings.subHeading2]}
      error={error}
      buttons={[
        <Button
          key="cancel"
          disabled={isLoading}
          outline
          title={strings.notNowButton}
          onPress={() => navigation.goBack()}
          containerStyle={styles.cancel}
        />,
        <Button
          disabled={isLoading}
          key="link"
          title={strings.linkButton}
          onPress={() => onLink()}
          containerStyle={styles.link}
        />,
      ]}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    authorize: intl.formatMessage(messages.authorize),
    cancel: intl.formatMessage(globalMessages.cancel),
    heading: intl.formatMessage(messages.heading),
    subHeading1: intl.formatMessage(messages.subHeading1),
    subHeading2: intl.formatMessage(messages.subHeading2),
    notNowButton: intl.formatMessage(messages.notNowButton),
    linkButton: intl.formatMessage(messages.linkButton),
  }
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize',
  },
  notNowButton: {
    id: 'components.settings.biometricslinkscreen.notNowButton',
    defaultMessage: '!!!Not now',
  },
  linkButton: {
    id: 'components.settings.biometricslinkscreen.linkButton',
    defaultMessage: '!!!Link',
  },
  heading: {
    id: 'components.settings.biometricslinkscreen.heading',
    defaultMessage: '!!!Use your fingerprint',
  },
  subHeading1: {
    id: 'components.settings.biometricslinkscreen.subHeading1',
    defaultMessage: '!!!for faster, easier access',
  },
  subHeading2: {
    id: 'components.settings.biometricslinkscreen.subHeading2',
    defaultMessage: '!!!to your Yoroi wallet',
  },
})

const styles = StyleSheet.create({
  cancel: {
    flex: 1,
    marginRight: 15,
  },
  link: {
    flex: 1,
  },
})
