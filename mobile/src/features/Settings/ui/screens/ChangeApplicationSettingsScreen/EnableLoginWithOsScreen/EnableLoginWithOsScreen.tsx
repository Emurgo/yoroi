import {useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {OsAuthScreen} from '~/features/Auth/ui/screens/OsAuthScreen'
import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'

export const EnableLoginWithOsScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  const {enableLoginWithHost} = useAuth()

  const {isPending, resolve} = usePromise({
    promise: enableLoginWithHost,
    onSuccess: () => navigation.goBack(),
  })

  return (
    <OsAuthScreen
      headings={[strings.settings.enableLoginWithOs.heading]}
      subHeadings={[
        strings.settings.enableLoginWithOs.subHeading1,
        strings.settings.enableLoginWithOs.subHeading2,
      ]}
      buttons={[
        <Button
          key="cancel"
          disabled={isPending}
          size="S"
          type={ButtonType.Secondary}
          title={strings.settings.enableLoginWithOs.notNowButton}
          onPress={() => navigation.goBack()}
        />,
        <Button
          size="S"
          disabled={isPending}
          key="link"
          title={strings.settings.enableLoginWithOs.linkButton}
          onPress={() => resolve()}
        />,
      ]}
    />
  )
}
