import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'

import {pinLength} from '../common/constants'
import {useAuth} from '../common/context'
import {PinInput, PinInputRef} from '../components/PinInput/PinInput'
import {useStrings} from '../hooks/useStrings'

export const LoginWithPinScreen = () => {
  const strings = useStrings()
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const {loginWithPin} = useAuth()

  return (
    <View style={[a.flex_1]}>
      <PinInput
        ref={pinInputRef}
        pinMaxLength={pinLength}
        title={strings.titleLoginWithPin}
        onDone={(pin) => loginWithPin(pin)}
      />
    </View>
  )
}
