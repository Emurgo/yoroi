import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'

import {Button} from '../../../components/Button/Button'
import {useAuth} from '../common/context'
import {Logo} from '../components/Logo'
import {useAuthWithOs} from '../hooks/useAuthWithOS'

export const OsLoginScreen = () => {
  const strings = useStrings()
  const {login} = useAuth()

  const handleOnLogin = React.useCallback(() => {
    login()
  }, [login])

  const {authWithOs, isLoading} = useAuthWithOs({onSuccess: handleOnLogin})

  return (
    <View style={[a.flex_1, a.flex_col, a.justify_between, a.p_lg]}>
      <TopSection />

      <MiddleSection>
        <Logo />
      </MiddleSection>

      <BottomSection>
        <Button
          title={strings.title}
          disabled={isLoading}
          onPress={() => authWithOs()}
        />
      </BottomSection>
    </View>
  )
}

const TopSection = () => {
  return <View style={[a.flex_1]} />
}

const MiddleSection = ({children}: {children: React.ReactNode}) => {
  return (
    <View style={[a.flex_1, a.flex_col, a.justify_center, a.align_center]}>
      {children}
    </View>
  )
}

const BottomSection = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.flex_1, a.flex_col, a.justify_end]}>{children}</View>
}

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}

const messages = defineMessages({
  title: {
    id: 'components.common.osloginscreen.button.title',
    defaultMessage: '!!!Login',
  },
})
