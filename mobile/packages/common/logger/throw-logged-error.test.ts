import {App} from '@yoroi/types'

import {throwLoggedError} from './throw-logged-error'

describe('throwLoggedError', () => {
  let mockLogger: App.Logger.Manager

  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
    } as unknown as App.Logger.Manager
  })

  it('should log and throw an Error instance', () => {
    const error = new Error('Test error')
    const throwError = throwLoggedError(mockLogger)

    expect(() => throwError(error)).toThrow(error)
    expect(mockLogger.error).toHaveBeenCalledWith(error)
  })

  it('should log and throw a string as an Error instance', () => {
    const errorMessage = 'Test error message'
    const throwError = throwLoggedError(mockLogger)

    expect(() => throwError(errorMessage)).toThrow(new Error(errorMessage))
    expect(mockLogger.error).toHaveBeenCalledWith(new Error(errorMessage))
  })
})
