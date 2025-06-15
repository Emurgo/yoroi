import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'

import {pinLength} from '../common/constants'
import {useAuth} from '../common/context'
import {PinInput, PinInputRef} from '../components/PinInput/PinInput'
import {useStrings} from '../hooks/useStrings'
import { pinHashStorageKeyManager } from '../../../kernel/storage/storages'
import { useAsync } from '../../../hooks/useAsync'

export const LoginWithPinScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const {loginWithPin} = useAuth()

  // const loginWithPin = useAsync({
  //   execute: async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 2000))
  //     await pinHashStorageKeyManager.read()
  //     console.log('asyncLogWithPin')
  //     return true
  //   },
  //   enabled: false,
  //   withSuspense: false,
  //   withThrow: false,
  // })

  console.log('loginWithPin', loginWithPin)

  // const {checkPin, isLoading} = useCheckPin({
  //   onSuccess: (isValid) => {
  //     if (isValid) {
  //       logger.debug(`Auth: Logged in with PIN`)
  //       login()
  //     } else {
  //       logger.error(`Auth: Incorrect PIN`)
  //       showErrorDialog(errorMessages.incorrectPin, intl)
  //       pinInputRef.current?.clear()
  //     }
  //   },
  // })

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <PinInput
        ref={pinInputRef}
        enabled={true}
        pinMaxLength={pinLength}
        title={strings.titleLoginWithPin}
        onDone={(pin) => {
          console.log('onDone', pin)
          loginWithPin(pin)
        }}
      />
    </SafeAreaView>
  )
}

