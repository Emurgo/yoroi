import * as React from 'react'
import {useIntl} from 'react-intl'

import {usePromise} from '../../../../hooks/usePromise'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {pinLength} from '../../common/constants'
import {useAuth} from '../../common/context'
import {useStrings} from '../../hooks/useStrings'
import {PinInput, PinInputRef} from '../PinInput/PinInput'

export const CheckPinInput = ({onValid}: {onValid: () => void}) => {
  const pinInputRef = React.useRef<null | PinInputRef>(null)
  const intl = useIntl()
  const strings = useStrings()
  const {checkPin} = useAuth()
  const {resolve, isPending} = usePromise({
    promise: checkPin,
    onSuccess: () => {
      onValid()
    },
    onError: (error) => {
      showErrorDialog(errorMessages.generalError, intl, {
        message: error.message,
      })
      pinInputRef.current?.clear()
    },
  })

  return (
    <PinInput
      ref={pinInputRef}
      title={strings.titleChangePin}
      subtitles={[strings.subtitleChangePin]}
      enabled={!isPending}
      onDone={resolve}
      pinMaxLength={pinLength}
    />
  )
}
