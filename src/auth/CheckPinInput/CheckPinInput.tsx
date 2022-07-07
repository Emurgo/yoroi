import React from 'react'
import {useIntl} from 'react-intl'

import {useCheckPin} from '../../hooks'
import {errorMessages} from '../../i18n/global-messages'
import {showErrorDialog} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {useStorage} from '../../Storage'
import {PinInput} from '../PinInput'

export type CheckPinStrings = {
  title: string
  subtitle: string
}

export const CheckPinInput = ({onValid, checkPinStrings}: {onValid: () => void; checkPinStrings: CheckPinStrings}) => {
  const intl = useIntl()
  const storage = useStorage()
  const {checkPin, isLoading} = useCheckPin(storage, {
    onSuccess: (isValid) => {
      if (isValid) {
        onValid()
      } else {
        showErrorDialog(errorMessages.incorrectPin, intl)
      }
    },
    onError: (error) => {
      showErrorDialog(errorMessages.generalError, intl, {message: error.message})
    },
  })

  return (
    <PinInput
      title={checkPinStrings.title}
      subtitles={[checkPinStrings.subtitle]}
      enabled={!isLoading}
      onDone={checkPin}
      pinMaxLength={CONFIG.PIN_LENGTH}
    />
  )
}
