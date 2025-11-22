import {App} from '@yoroi/types'

import {getLogger, noOpLogger, setLogger} from './logger'

describe('logger', () => {
  beforeEach(() => {
    // Reset logger to noOpLogger before each test
    setLogger(noOpLogger)
  })

  describe('noOpLogger', () => {
    it('should have all required methods', () => {
      expect(noOpLogger.debug).toBeDefined()
      expect(noOpLogger.log).toBeDefined()
      expect(noOpLogger.info).toBeDefined()
      expect(noOpLogger.warn).toBeDefined()
      expect(noOpLogger.error).toBeDefined()
      expect(noOpLogger.addTransport).toBeDefined()
      expect(noOpLogger.disable).toBeDefined()
      expect(noOpLogger.enable).toBeDefined()
    })

    it('should not throw when methods are called', () => {
      expect(() => {
        noOpLogger.debug('test')
        noOpLogger.log('test')
        noOpLogger.info('test')
        noOpLogger.warn('test')
        noOpLogger.error(new Error('test'))
        const removeTransport = noOpLogger.addTransport(
          {} as App.Logger.Transporter,
        )
        expect(typeof removeTransport).toBe('function')
        removeTransport()
        noOpLogger.disable()
        noOpLogger.enable()
      }).not.toThrow()
    })
  })

  describe('setLogger and getLogger', () => {
    it('should set and get logger', () => {
      const mockLogger: App.Logger.Manager = {
        ...noOpLogger,
        debug: jest.fn(),
      }

      setLogger(mockLogger)
      const retrieved = getLogger()

      expect(retrieved).toBe(mockLogger)
      expect(retrieved.debug).toBe(mockLogger.debug)
    })
  })
})
