import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {useAuthOsErrorDecoder, useEnableAuthWithOs} from '../../auth'
import {Button} from '../../components'
import globalMessages from '../../i18n/global-messages'
import {OsAuthBaseScreen} from '../../OsAuth'
import {useStorage} from '../../Storage'

export const EnableLoginWithOsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const storage = useStorage()

  const decodeAuthOsError = useAuthOsErrorDecoder()
  const {enableAuthWithOs, isLoading, error} = useEnableAuthWithOs(
    {
      storage,
      authenticationPrompt: {
        title: strings.authorize,
        cancel: strings.cancel,
      },
    },
    {
      onSuccess: () => navigation.goBack(),
      retry: false,
    },
  )

  return (
    <OsAuthBaseScreen
      headings={[strings.heading]}
      subHeadings={[strings.subHeading1, strings.subHeading2]}
      error={decodeAuthOsError(error)}
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
          onPress={() => enableAuthWithOs()}
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
