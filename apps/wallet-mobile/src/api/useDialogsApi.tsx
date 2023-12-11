import * as React from 'react'

import {useStringsApiErrors} from './useStringsApiErrors'

export const useDialogsApi = () => {
  const strings = useStringsApiErrors()

  return React.useRef({
    errorBadRequest: {
      title: strings.errorTitle,
      message: strings.badRequest,
    },
    errorUnauthorized: {
      title: strings.errorTitle,
      message: strings.unauthorized,
    },
    errorForbidden: {
      title: strings.errorTitle,
      message: strings.forbidden,
    },
    errorNotFound: {
      title: strings.errorTitle,
      message: strings.notFound,
    },
    errorConflict: {
      title: strings.errorTitle,
      message: strings.conflict,
    },
    errorGone: {
      title: strings.errorTitle,
      message: strings.gone,
    },
    errorTooEarly: {
      title: strings.errorTitle,
      message: strings.tooEarly,
    },
    errorTooManyRequests: {
      title: strings.errorTitle,
      message: strings.tooManyRequests,
    },
    errorServerSide: {
      title: strings.errorTitle,
      message: strings.serverSide,
    },
    errorUnknown: {
      title: strings.errorTitle,
      message: strings.unknown,
    },
    errorNetwork: {
      title: strings.errorTitle,
      message: strings.network,
    },
    errorInvalidState: {
      title: strings.errorTitle,
      message: strings.invalidState,
    },
    errorResponseMalformed: {
      title: strings.errorTitle,
      message: strings.responseMalformed,
    },
  } as const).current
}
