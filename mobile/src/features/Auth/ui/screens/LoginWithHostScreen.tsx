import {time} from '@yoroi/common'
import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {PendingActionBanner} from '~/features/Links/components/PendingActionBanner'
import {useAppState} from '~/hooks/useAppState'
import {usePromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {useAuth} from '../../context/AuthProvider'
import {Logo} from '../shared/illustrations/Logo'

export const LoginWithHostScreen = () => {
  const strings = useStrings()
  const {loginWithHost} = useAuth()
  const {resolve, isPending} = usePromise(loginWithHost)

  React.useEffect(() => {
    resolve()
  }, [resolve])

  useAppState({
    on: 'active',
    execute: () => {
      if (!isPending) {
        const timer = setTimeout(() => {
          resolve()
          clearTimeout(timer)
        }, time.seconds(0.1))
      }
    },
  })

  const handleOnPress = () => {
    resolve()
  }

  return (
    <SafeArea style={[a.justify_between]}>
      <PendingActionBanner />
      <Center>
        <Logo />
      </Center>

      <SafeArea.Footer>
        <Button
          title={strings.auth.authorize}
          disabled={isPending}
          onPress={handleOnPress}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

const Center = ({children}: React.PropsWithChildren) => {
  return (
    <View style={[a.flex_1, a.justify_center, a.align_center]}>{children}</View>
  )
}
