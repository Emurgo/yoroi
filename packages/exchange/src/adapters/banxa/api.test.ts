import {banxaApiConfig, banxaApiGetBaseUrl} from './api'

describe('getEncryptusBaseUrl', () => {
  it('should return the link - sandbox', async () => {
    const isProduction = false
    const partner = 'yoroi'
    const expectedUrl = `https://${partner}.${banxaApiConfig.sandbox.baseUrl}`

    const getBaseUrl = banxaApiGetBaseUrl()

    const result = await getBaseUrl({isProduction, partner})
    expect(result).toBe(expectedUrl)
  })

  it('should return the link - production', async () => {
    const isProduction = true
    const partner = 'yoroi'
    const expectedUrl = `https://${partner}.${banxaApiConfig.production.baseUrl}`

    const getBaseUrl = banxaApiGetBaseUrl()

    const result = await getBaseUrl({isProduction, partner})
    expect(result).toBe(expectedUrl)
  })
})
