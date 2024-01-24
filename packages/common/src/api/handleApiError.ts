import {Api} from '@yoroi/types'

export const handleApiError = (error: Api.ResponseError): never => {
  if (error.status >= 500 && error.status < 600) {
    throw new Api.Errors.ServerSide(error.message)
  }

  switch (error.status) {
    case -1:
      throw new Api.Errors.Network(error.message)
    case -2:
      throw new Api.Errors.InvalidState(error.message)
    case 400:
      throw new Api.Errors.BadRequest(error.message)
    case 401:
      throw new Api.Errors.Unauthorized(error.message)
    case 403:
      throw new Api.Errors.Forbidden(error.message)
    case 404:
      throw new Api.Errors.NotFound(error.message)
    case 409:
      throw new Api.Errors.Conflict(error.message)
    case 410:
      throw new Api.Errors.Gone(error.message)
    case 425:
      throw new Api.Errors.TooEarly(error.message)
    case 429:
      throw new Api.Errors.TooManyRequests(error.message)
    default:
      throw new Api.Errors.Unknown(error.message)
  }
}
