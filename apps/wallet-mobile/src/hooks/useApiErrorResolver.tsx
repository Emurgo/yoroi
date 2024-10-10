import {Api} from '@yoroi/types'
import * as React from 'react'
import {useIntl} from 'react-intl'

import {apiErrors} from '../kernel/i18n/global-messages'

export const useApiErrorResolver = () => {
  const strings = useApiStringsErrors()

  const dialogs = React.useRef({
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

  const resolver = React.useCallback(
    (error: unknown) => {
      if (error instanceof Api.Errors.BadRequest) return dialogs.errorBadRequest
      if (error instanceof Api.Errors.Conflict) return dialogs.errorConflict
      if (error instanceof Api.Errors.Forbidden) return dialogs.errorForbidden
      if (error instanceof Api.Errors.Gone) return dialogs.errorGone
      if (error instanceof Api.Errors.InvalidState) return dialogs.errorInvalidState
      if (error instanceof Api.Errors.Network) return dialogs.errorNetwork
      if (error instanceof Api.Errors.NotFound) return dialogs.errorNotFound
      if (error instanceof Api.Errors.ResponseMalformed) return dialogs.errorResponseMalformed
      if (error instanceof Api.Errors.ServerSide) return dialogs.errorServerSide
      if (error instanceof Api.Errors.TooEarly) return dialogs.errorTooEarly
      if (error instanceof Api.Errors.TooManyRequests) return dialogs.errorTooManyRequests
      if (error instanceof Api.Errors.Unauthorized) return dialogs.errorUnauthorized
      if (error instanceof Api.Errors.Unknown) return dialogs.errorUnknown

      return dialogs.errorUnknown
    },
    [
      dialogs.errorBadRequest,
      dialogs.errorConflict,
      dialogs.errorForbidden,
      dialogs.errorGone,
      dialogs.errorInvalidState,
      dialogs.errorNetwork,
      dialogs.errorNotFound,
      dialogs.errorResponseMalformed,
      dialogs.errorServerSide,
      dialogs.errorTooEarly,
      dialogs.errorTooManyRequests,
      dialogs.errorUnauthorized,
      dialogs.errorUnknown,
    ],
  )

  return resolver
}

const useApiStringsErrors = () => {
  const intl = useIntl()

  return React.useRef({
    errorTitle: intl.formatMessage(apiErrors.title),

    badRequest: intl.formatMessage(apiErrors.badRequest),
    conflict: intl.formatMessage(apiErrors.conflict),
    forbidden: intl.formatMessage(apiErrors.forbidden),
    gone: intl.formatMessage(apiErrors.gone),
    invalidState: intl.formatMessage(apiErrors.invalidState),
    network: intl.formatMessage(apiErrors.network),
    notFound: intl.formatMessage(apiErrors.notFound),
    responseMalformed: intl.formatMessage(apiErrors.responseMalformed),
    serverSide: intl.formatMessage(apiErrors.serverSide),
    tooEarly: intl.formatMessage(apiErrors.tooEarly),
    tooManyRequests: intl.formatMessage(apiErrors.tooManyRequests),
    unauthorized: intl.formatMessage(apiErrors.unauthorized),
    unknown: intl.formatMessage(apiErrors.unknown),
  } as const).current
}
