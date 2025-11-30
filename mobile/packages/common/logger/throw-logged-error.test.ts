import {App} from '@yoroi/types'

import {throwLoggedError} from './throw-logged-error'

describe('throwLoggedError', () => {
  it('should log and throw Error instance', () => {
    const mockLogger: App.Logger.Manager = {
      level: App.Logger.Level.Debug,
      trail: [],
      filter: null,
      debug: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      addTransport: () => () => {},
      disable: jest.fn(),
      enable: jest.fn(),
    }

    const error = new Error('Test error')
    const throwError = throwLoggedError(mockLogger)

    expect(() => throwError(error)).toThrow('Test error')
    expect(mockLogger.error).toHaveBeenCalledWith(error)
  })

  it('should log and throw Error from string', () => {
    const mockLogger: App.Logger.Manager = {
      level: App.Logger.Level.Debug,
      trail: [],
      filter: null,
      debug: jest.fn(),
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      addTransport: () => () => {},
      disable: jest.fn(),
      enable: jest.fn(),
    }

    const throwError = throwLoggedError(mockLogger)

    expect(() => throwError('String error')).toThrow('String error')
    expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
