import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Button} from '../../../components'
import globalMessages from '../../../kernel/i18n/global-messages'
import {OsAuthScreen} from '../../Auth'
import {useEnableAuthWithOs} from '../../Auth/common/hooks'

export const EnableLoginWithOsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({onSuccess: () => navigation.goBack()})

  return (
    <OsAuthScreen
      headings={[strings.heading]}
      subHeadings={[strings.subHeading1, strings.subHeading2]}
      buttons={[
        <Button
          key="cancel"
          disabled={isLoading}
          outlineShelley
          title={strings.notNowButton}
          onPress={() => navigation.goBack()}
          containerStyle={styles.cancel}
        />,
        <Button
          shelleyTheme
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
    error: intl.formatMessage(globalMessages.error),
    heading: intl.formatMessage(messages.heading),
    subHeading1: intl.formatMessage(messages.subHeading1),
    subHeading2: intl.formatMessage(messages.subHeading2),
    notNowButton: intl.formatMessage(messages.notNowButton),
    linkButton: intl.formatMessage(messages.linkButton),
  }
}

const messages = defineMessages({
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
