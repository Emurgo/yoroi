import {App} from '@yoroi/types'

import {toLoggerMetadata} from './to-logger-metadata'

describe('toLoggerMetadata', () => {
  it('should return the same metadata if no Error instances are present', () => {
    const metadata: App.Logger.Metadata = {key1: 'value1', key2: 'value2'}
    const result = toLoggerMetadata(metadata)
    expect(result).toEqual(metadata)
  })

  it('should convert Error instances to strings', () => {
    const error = new Error('Test error')
    const metadata: App.Logger.Metadata = {key1: error, key2: 'value2'}
    const result = toLoggerMetadata(metadata)
    expect(result).toEqual({key1: error.toString(), key2: 'value2'})
  })

  it('should handle empty metadata', () => {
    const metadata: App.Logger.Metadata = {}
    const result = toLoggerMetadata(metadata)
    expect(result).toEqual(metadata)
  })

  it('should handle metadata with mixed types', () => {
    const error = new Error('Test error')
    const metadata: App.Logger.Metadata = {
      key1: error,
      key2: 'value2',
      key3: 123,
      key4: true,
    }
    const result = toLoggerMetadata(metadata)
    expect(result).toEqual({
      key1: error.toString(),
      key2: 'value2',
      key3: 123,
      key4: true,
    })
  })
})
