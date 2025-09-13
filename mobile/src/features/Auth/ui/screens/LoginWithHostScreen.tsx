import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

import {useAuth} from '../../context/AuthProvider'
import {Logo} from '../shared/illustrations/Logo'

export const LoginWithHostScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {loginWithHost} = useAuth()
  const {resolve, isPending} = usePromise(loginWithHost)

  React.useEffect(() => {
    resolve()
  }, [resolve])

  const handleOnPress = () => {
    resolve()
  }

  return (
    <SafeAreaView
      style={[
        a.flex_1,
        a.flex_col,
        a.justify_between,
        a.px_lg,
        ta.bg_color_max,
      ]}
    >
      <Space.Height.lg fill />

      <MiddleSection>
        <Logo />
      </MiddleSection>

      <BottomSection>
        <Button
          title={strings.auth.authorize}
          disabled={isPending}
          onPress={handleOnPress}
        />
      </BottomSection>
    </SafeAreaView>
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
