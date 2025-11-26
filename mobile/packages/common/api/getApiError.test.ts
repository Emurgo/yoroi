import {Api} from '@yoroi/types'

import {getApiError} from './getApiError'

describe('getApiError', () => {
  it('should return ServerSide error for 5xx status', () => {
    const error: Api.ResponseError = {
      status: 500,
      message: 'Server error',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.ServerSide)
  })

  it('should return Network error for -1 status', () => {
    const error: Api.ResponseError = {
      status: -1,
      message: 'Network error',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Network)
  })

  it('should return InvalidState error for -2 status', () => {
    const error: Api.ResponseError = {
      status: -2,
      message: 'Invalid state',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.InvalidState)
  })

  it('should return ResponseMalformed error for -3 status', () => {
    const error: Api.ResponseError = {
      status: -3,
      message: 'Malformed',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.ResponseMalformed)
  })

  it('should return BadRequest error for 400 status', () => {
    const error: Api.ResponseError = {
      status: 400,
      message: 'Bad request',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.BadRequest)
  })

  it('should return Unauthorized error for 401 status', () => {
    const error: Api.ResponseError = {
      status: 401,
      message: 'Unauthorized',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Unauthorized)
  })

  it('should return Forbidden error for 403 status', () => {
    const error: Api.ResponseError = {
      status: 403,
      message: 'Forbidden',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Forbidden)
  })

  it('should return NotFound error for 404 status', () => {
    const error: Api.ResponseError = {
      status: 404,
      message: 'Not found',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.NotFound)
  })

  it('should return Conflict error for 409 status', () => {
    const error: Api.ResponseError = {
      status: 409,
      message: 'Conflict',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Conflict)
  })

  it('should return Gone error for 410 status', () => {
    const error: Api.ResponseError = {
      status: 410,
      message: 'Gone',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Gone)
  })

  it('should return TooEarly error for 425 status', () => {
    const error: Api.ResponseError = {
      status: 425,
      message: 'Too early',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.TooEarly)
  })

  it('should return TooManyRequests error for 429 status', () => {
    const error: Api.ResponseError = {
      status: 429,
      message: 'Too many requests',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.TooManyRequests)
  })

  it('should return Unknown error for unknown status', () => {
    const error: Api.ResponseError = {
      status: 999,
      message: 'Unknown',
      responseData: null,
    }
    const result = getApiError(error)
    expect(result).toBeInstanceOf(Api.Errors.Unknown)
  })
})
