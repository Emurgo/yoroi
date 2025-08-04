import * as React from 'react'

import {pinLength} from '~/features/Auth/common/constants'
import {useAuth} from '~/features/Auth/context/AuthProvider'

import {PinInput, PinInputRef} from '~/features/Auth/ui/shared/PinInput/PinInput'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'

import {logger} from '~/kernel/logger/logger'

export const CheckPinInput = ({onValid}: {onValid: () => void}) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)

  const strings = useStrings()
  const {checkPin} = useAuth()

  return (
    <PinInput
      ref={pinInputRef}
      title={strings.auth.titleChangePin}
      subtitles={[strings.auth.subtitleChangePin]}
      onDone={(pin) => {
        const isValid = checkPin(pin)
        if (isValid) {
          logger.debug('valid PIN', {origin: 'CheckPinInput', type: 'user'})
          onValid()
          return
        }
        logger.info('invalid PIN', {origin: 'CheckPinInput', type: 'user'})
        showErrorDialog(errorMessages.incorrectPin)
      }}
      pinMaxLength={pinLength}
    />
  )
}
