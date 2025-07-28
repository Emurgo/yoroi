import * as React from 'react'

import {pinLength} from '~/features/Auth/common/constants'
import {useAuth} from '~/features/Auth/context/AuthProvider'
import {messages, useStrings} from '~/features/Auth/hooks/useStrings'
import {PinInput, PinInputRef} from '~/features/Auth/ui/PinInput/PinInput'
import {showErrorDialog} from '~/kernel/dialogs'
import globalMessages from '~/kernel/i18n/global-messages'
import {logger} from '~/kernel/logger/logger'

export const CheckPinInput = ({onValid}: {onValid: () => void}) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)

  const strings = useStrings()
  const {checkPin} = useAuth()

  return (
    <PinInput
      ref={pinInputRef}
      title={strings.titleChangePin}
      subtitles={[strings.subtitleChangePin]}
      onDone={(pin) => {
        const isValid = checkPin(pin)
        if (isValid) {
          logger.debug('valid PIN', {origin: 'CheckPinInput', type: 'user'})
          onValid()
          return
        }
        logger.info('invalid PIN', {origin: 'CheckPinInput', type: 'user'})
        showErrorDialog({
          title: globalMessages.error,
          message: messages.invalidPin,
        })
      }}
      pinMaxLength={pinLength}
    />
  )
}
