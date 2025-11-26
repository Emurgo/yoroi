import {ApiError, invalid} from './errors'

describe('errors', () => {
  describe('invalid', () => {
    it('should throw error with message', () => {
      expect(() => invalid('Test error')).toThrow('Test error')
    })
  })

  describe('ApiError', () => {
    it('should be instance of Error', () => {
      const error = new ApiError('Test')
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test')
    })

    it('should be throwable', () => {
      expect(() => {
        throw new ApiError('Test')
      }).toThrow('Test')
    })
  })
})
