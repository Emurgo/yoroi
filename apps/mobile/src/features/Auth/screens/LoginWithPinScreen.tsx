import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {usePromise} from '../../../hooks/usePromise'
import {logger} from '../../../kernel/logger/logger'
import {pinLength} from '../common/constants'
import {useAuth} from '../common/context'
import {PinInput, PinInputRef} from '../components/PinInput/PinInput'
import {useStrings} from '../hooks/useStrings'

export const LoginWithPinScreen = () => {
  const strings = useStrings()
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const {loginWithPin} = useAuth()
  const {resolve, isPending} = usePromise({
    promise: loginWithPin,
    shouldThrow: true,
    onSuccess: () => {
      logger.debug('loginWithPin success', {
        origin: 'LoginWithPinScreen',
        type: 'user',
      })
    },
  })

  return (
    <View style={[a.flex_1]}>
      <PinInput
        ref={pinInputRef}
        enabled={!isPending}
        pinMaxLength={pinLength}
        title={strings.titleLoginWithPin}
        onDone={(pin) => resolve(pin)}
      />
    </View>
  )
}
