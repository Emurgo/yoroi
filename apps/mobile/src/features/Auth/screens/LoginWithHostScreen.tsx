import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {useAuth} from '../context/AuthProvider'
import {Logo} from '../ui/illustrations/Logo'

export const LoginWithHostScreen = () => {
  const strings = useStrings()
  const {loginWithHost} = useAuth()
  const {resolve, isPending} = usePromise(loginWithHost)

  return (
    <View style={[a.flex_1, a.flex_col, a.justify_between]}>
      <Space.Height.lg fill />

      <MiddleSection>
        <Logo />
      </MiddleSection>

      <BottomSection>
        <Button
          title={strings.auth.loginWithHost.title}
          disabled={isPending}
          onPress={resolve}
        />
      </BottomSection>
    </View>
  )
}

const MiddleSection = ({children}: React.PropsWithChildren) => {
  return (
    <View style={[a.flex_1, a.flex_col, a.justify_center, a.align_center]}>
      {children}
    </View>
  )
}

const BottomSection = ({children}: React.PropsWithChildren) => {
  return <View style={[a.flex_1, a.flex_col, a.justify_end]}>{children}</View>
}
