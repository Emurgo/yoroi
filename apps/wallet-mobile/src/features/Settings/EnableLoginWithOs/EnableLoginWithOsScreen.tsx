import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {Button, ButtonType} from '../../../components/Button/Button'
import globalMessages from '../../../kernel/i18n/global-messages'
import {useEnableAuthWithOs} from '../../Auth/common/hooks'
import {OsAuthScreen} from '../../Auth/OsAuthScreen/OsAuthScreen'

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
          size="S"
          type={ButtonType.Secondary}
          title={strings.notNowButton}
          onPress={() => navigation.goBack()}
        />,
        <Button
          size="S"
          disabled={isLoading}
          key="link"
          title={strings.linkButton}
          onPress={() => enableAuthWithOs()}
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
