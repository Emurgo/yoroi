import {baseUrlAdapter} from './base-url-adapter'

describe('baseUrlAdapter', () => {
  const baseUrl = 'http://example.com'

  it('should append a slash to the baseUrl when providerId is "encryptus"', () => {
    const providerId = 'encryptus'
    const result = baseUrlAdapter(baseUrl, providerId)
    expect(result).toBe('http://example.com/')
  })

  it('should return the original baseUrl when providerId is not "encryptus"', () => {
    const providerId = 'otherProvider'
    const result = baseUrlAdapter(baseUrl, providerId)
    expect(result).toBe(baseUrl)
  })
})
