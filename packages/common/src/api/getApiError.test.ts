import {getApiError} from './getApiError'
import {Api} from '@yoroi/types'

describe('getApiError', () => {
  it('should throw NetworkError for -1 status', () => {
    expect(() => {
      const error = getApiError({
        status: -1,
        message: 'Network error',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Network)
  })

  it('should throw InvalidStateError for -2 status', () => {
    expect(() => {
      const error = getApiError({
        status: -2,
        message: 'Invalid state',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.InvalidState)
  })

  it('should throw BadRequestError for 400 status', () => {
    expect(() => {
      const error = getApiError({
        status: 400,
        message: 'Bad request',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.BadRequest)
  })

  it('should throw UnauthorizedError for 401 status', () => {
    expect(() => {
      const error = getApiError({
        status: 401,
        message: 'Unauthorized',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Unauthorized)
  })

  it('should throw ForbiddenError for 403 status', () => {
    expect(() => {
      const error = getApiError({
        status: 403,
        message: 'Forbidden',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Forbidden)
  })

  it('should throw NotFoundError for 404 status', () => {
    expect(() => {
      const error = getApiError({
        status: 404,
        message: 'Not found',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.NotFound)
  })

  it('should throw ConflictError for 409 status', () => {
    expect(() => {
      const error = getApiError({
        status: 409,
        message: 'Conflict',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Conflict)
  })

  it('should throw GoneError for 410 status', () => {
    expect(() => {
      const error = getApiError({
        status: 410,
        message: 'Gone',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Gone)
  })

  it('should throw TooEarlyError for 425 status', () => {
    expect(() => {
      const error = getApiError({
        status: 425,
        message: 'Too early',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.TooEarly)
  })

  it('should throw TooManyRequestsError for 429 status', () => {
    expect(() => {
      const error = getApiError({
        status: 429,
        message: 'Too many requests',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.TooManyRequests)
  })

  it('should throw ServerSideError for 500 status', () => {
    expect(() => {
      const error = getApiError({
        status: 500,
        message: 'Server error',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.ServerSide)
  })

  it('should throw ServerSideError for other 5xx status codes', () => {
    expect(() => {
      const error = getApiError({
        status: 503,
        message: 'Service unavailable',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.ServerSide)
    expect(() => {
      const error = getApiError({
        status: 504,
        message: 'Gateway timeout',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.ServerSide)
  })

  it('should throw UnknownError for unhandled status codes', () => {
    expect(() => {
      const error = getApiError({
        status: 999,
        message: 'Unknown error',
        responseData: null,
      })
      throw error
    }).toThrow(Api.Errors.Unknown)
  })
})
