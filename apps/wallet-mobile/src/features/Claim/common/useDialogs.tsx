import * as React from 'react'

import {useStrings} from './useStrings'

export const useDialogs = () => {
  const strings = useStrings()

  return React.useRef({
    errorInvalidRequest: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorInvalidRequest,
    },
    errorNotFound: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorNotFound,
    },
    errorAlreadyClaimed: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorAlreadyClaimed,
    },
    errorExpired: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorExpired,
    },
    errorTooEarly: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorTooEarly,
    },
    errorRateLimited: {
      title: strings.apiErrorTitle,
      message: strings.apiErrorRateLimited,
    },

    accepted: {
      title: strings.acceptedTitle,
      message: strings.acceptedMesage,
    },
    processing: {
      title: strings.processingTitle,
      message: strings.processingMessage,
    },
    done: {
      title: strings.doneTitle,
      message: strings.doneMessage,
    },
  } as const).current
}
