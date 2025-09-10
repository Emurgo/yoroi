import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'

export const useDialogs = () => {
  const strings = useStrings()

  return React.useRef({
    errorInvalidRequest: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorInvalidRequest,
    },
    errorNotFound: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorNotFound,
    },
    errorAlreadyClaimed: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorAlreadyClaimed,
    },
    errorExpired: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorExpired,
    },
    errorTooEarly: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorTooEarly,
    },
    errorRateLimited: {
      title: strings.claim.apiErrorTitle,
      message: strings.claim.apiErrorRateLimited,
    },

    accepted: {
      title: strings.claim.acceptedTitle,
      message: strings.claim.acceptedMessage,
    },
    processing: {
      title: strings.claim.processingTitle,
      message: strings.claim.processingMessage,
    },
    done: {
      title: strings.claim.doneTitle,
      message: strings.claim.doneMessage,
    },
  } as const).current
}
