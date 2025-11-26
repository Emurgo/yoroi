import {App} from '@yoroi/types'

import {toLoggerMetadata} from './to-logger-metadata'

describe('toLoggerMetadata', () => {
  it('should convert Error instances to strings', () => {
    const metadata: App.Logger.Metadata = {
      error: new Error('Test error'),
      message: 'test',
    }

    const result = toLoggerMetadata(metadata)

    expect(result.error).toBe('Error: Test error')
    expect(result.message).toBe('test')
  })

  it('should preserve non-Error values', () => {
    const metadata: App.Logger.Metadata = {
      string: 'value',
      number: 123,
      boolean: true,
    }

    const result = toLoggerMetadata(metadata)

    expect(result.string).toBe('value')
    expect(result.number).toBe(123)
    expect(result.boolean).toBe(true)
  })

  it('should handle empty metadata', () => {
    const result = toLoggerMetadata({})
    expect(result).toEqual({})
  })
})
