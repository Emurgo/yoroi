import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {usePromise} from '../../../hooks/usePromise'
import {pinLength} from '../common/constants'
import {useAuth} from '../common/context'
import {PinInput, PinInputRef} from '../components/PinInput/PinInput'
import {useStrings} from '../hooks/useStrings'

export const LoginWithPinScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const {loginWithPin} = useAuth()
  const {resolve, isPending} = usePromise(loginWithPin)

  return (
    <View style={[a.flex_1, ta.bg_color_max]}>
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
