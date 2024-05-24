import {Api} from '@yoroi/types'

import {useApiDialogs} from './useApiDialogs'

export const useApiErrorResolver = () => {
  const dialogs = useApiDialogs()

  const resolver = (error: unknown) => {
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
  }

  return resolver
}
