import {Api} from '@yoroi/types'

export const getApiError = (error: Api.ResponseError) => {
  if (error.status >= 500 && error.status < 600) {
    return new Api.Errors.ServerSide(error.message)
  }

  switch (error.status) {
    case -1:
      return new Api.Errors.Network(error.message)
    case -2:
      return new Api.Errors.InvalidState(error.message)
    case -3:
      return new Api.Errors.ResponseMalformed(error.message)
    case 400:
      return new Api.Errors.BadRequest(error.message)
    case 401:
      return new Api.Errors.Unauthorized(error.message)
    case 403:
      return new Api.Errors.Forbidden(error.message)
    case 404:
      return new Api.Errors.NotFound(error.message)
    case 409:
      return new Api.Errors.Conflict(error.message)
    case 410:
      return new Api.Errors.Gone(error.message)
    case 425:
      return new Api.Errors.TooEarly(error.message)
    case 429:
      return new Api.Errors.TooManyRequests(error.message)
    default:
      return new Api.Errors.Unknown(error.message)
  }
}
