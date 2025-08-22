import {banxaApiConfig, banxaApiGetBaseUrl} from './api'

describe('getEncryptusBaseUrl', () => {
  it('should return the link - sandbox', async () => {
    const isProduction = false
    const partner = 'yoroi'
    const expectedUrl = `https://${partner}.${banxaApiConfig.sandbox.getBaseUrl}`

    const getBaseUrl = banxaApiGetBaseUrl({isProduction, partner})

    const result = await getBaseUrl()
    expect(result).toBe(expectedUrl)
  })

  it('should return the link - production', async () => {
    const isProduction = true
    const partner = 'yoroi'
    const expectedUrl = `https://${partner}.${banxaApiConfig.production.getBaseUrl}`

    const getBaseUrl = banxaApiGetBaseUrl({isProduction, partner})

    const result = await getBaseUrl()
    expect(result).toBe(expectedUrl)
  })
})
