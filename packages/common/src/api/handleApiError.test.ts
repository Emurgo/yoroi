import {handleApiError} from './handleApiError'
import {Api} from '@yoroi/types'

describe('handleApiError', () => {
  it('should throw NetworkError for -1 status', () => {
    expect(() =>
      handleApiError({status: -1, message: 'Network error'}),
    ).toThrow(Api.Errors.Network)
  })

  it('should throw InvalidStateError for -2 status', () => {
    expect(() =>
      handleApiError({status: -2, message: 'Invalid state'}),
    ).toThrow(Api.Errors.InvalidState)
  })

  it('should throw BadRequestError for 400 status', () => {
    expect(() => handleApiError({status: 400, message: 'Bad request'})).toThrow(
      Api.Errors.BadRequest,
    )
  })

  it('should throw UnauthorizedError for 401 status', () => {
    expect(() =>
      handleApiError({status: 401, message: 'Unauthorized'}),
    ).toThrow(Api.Errors.Unauthorized)
  })

  it('should throw ForbiddenError for 403 status', () => {
    expect(() => handleApiError({status: 403, message: 'Forbidden'})).toThrow(
      Api.Errors.Forbidden,
    )
  })

  it('should throw NotFoundError for 404 status', () => {
    expect(() => handleApiError({status: 404, message: 'Not found'})).toThrow(
      Api.Errors.NotFound,
    )
  })

  it('should throw ConflictError for 409 status', () => {
    expect(() => handleApiError({status: 409, message: 'Conflict'})).toThrow(
      Api.Errors.Conflict,
    )
  })

  it('should throw GoneError for 410 status', () => {
    expect(() => handleApiError({status: 410, message: 'Gone'})).toThrow(
      Api.Errors.Gone,
    )
  })

  it('should throw TooEarlyError for 425 status', () => {
    expect(() => handleApiError({status: 425, message: 'Too early'})).toThrow(
      Api.Errors.TooEarly,
    )
  })

  it('should throw TooManyRequestsError for 429 status', () => {
    expect(() =>
      handleApiError({status: 429, message: 'Too many requests'}),
    ).toThrow(Api.Errors.TooManyRequests)
  })

  it('should throw ServerSideError for 500 status', () => {
    expect(() =>
      handleApiError({status: 500, message: 'Server error'}),
    ).toThrow(Api.Errors.ServerSide)
  })

  it('should throw ServerSideError for other 5xx status codes', () => {
    expect(() =>
      handleApiError({status: 503, message: 'Service unavailable'}),
    ).toThrow(Api.Errors.ServerSide)
    expect(() =>
      handleApiError({status: 504, message: 'Gateway timeout'}),
    ).toThrow(Api.Errors.ServerSide)
  })

  it('should throw UnknownError for unhandled status codes', () => {
    expect(() =>
      handleApiError({status: 999, message: 'Unknown error'}),
    ).toThrow(Api.Errors.Unknown)
  })
})
