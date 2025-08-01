import {useNavigation} from '@react-navigation/native'
import React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useEnableAuthWithOs} from '~/features/Auth/hooks/useEnableAuthWithOS'
import {OsAuthScreen} from '~/features/Auth/screens/OsAuthScreen'

export const EnableLoginWithOsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()

  const {enableAuthWithOs, isLoading} = useEnableAuthWithOs({
    onSuccess: () => navigation.goBack(),
  })

  return (
    <OsAuthScreen
      headings={[strings.settings.enableLoginWithOs.heading]}
      subHeadings={[strings.settings.enableLoginWithOs.subHeading1, strings.settings.enableLoginWithOs.subHeading2]}
      buttons={[
        <Button
          key="cancel"
          disabled={isLoading}
          size="S"
          type={ButtonType.Secondary}
          title={strings.settings.enableLoginWithOs.notNowButton}
          onPress={() => navigation.goBack()}
        />,
        <Button
          size="S"
          disabled={isLoading}
          key="link"
          title={strings.settings.enableLoginWithOs.linkButton}
          onPress={() => enableAuthWithOs()}
        />,
      ]}
    />
  )
}
