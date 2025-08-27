import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {useIntl} from 'react-intl'
import {View} from 'react-native'

import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'

import {pinLength} from '../../common/constants'
import {useAuth} from '../../context/AuthProvider'
import {PinInput, PinInputRef} from '../shared/PinInput/PinInput'

export const LoginWithPinScreen = () => {
  const strings = useStrings()
  const intl = useIntl()
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const {loginWithPin} = useAuth()

  const handlePinSubmit = (pin: string) => {
    const isValid = loginWithPin(pin)
    if (!isValid) {
      showErrorDialog(errorMessages.incorrectPin, intl)
      pinInputRef.current?.clear()
    }
  }

  return (
    <View style={[a.flex_1]}>
      <PinInput
        ref={pinInputRef}
        pinMaxLength={pinLength}
        title={strings.auth.titleLoginWithPin}
        onDone={handlePinSubmit}
      />
    </View>
  )
}
