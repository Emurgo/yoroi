import * as React from 'react'

import {logger} from 'src/kernel/logger/logger'
import {showErrorDialog} from '../../../../kernel/dialogs'
import globalMessages from '../../../../kernel/i18n/global-messages'
import {pinLength} from '../../common/constants'
import {useAuth} from '../../context/AuthProvider'
import {messages, useStrings} from '../../hooks/useStrings'
import {PinInput, PinInputRef} from '../PinInput/PinInput'

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
