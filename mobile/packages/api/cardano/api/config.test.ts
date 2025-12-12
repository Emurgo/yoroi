import {Chain} from '@yoroi/types'

import {API_ENDPOINTS} from './config'

describe('API_ENDPOINTS', () => {
  it('should have endpoints for all supported networks', () => {
    expect(API_ENDPOINTS[Chain.Network.Mainnet]).toBeDefined()
    expect(API_ENDPOINTS[Chain.Network.Preprod]).toBeDefined()
  })

  it('should have root and legacy endpoints for Mainnet', () => {
    const mainnet = API_ENDPOINTS[Chain.Network.Mainnet]
    expect(mainnet.root).toBe('https://zero.yoroiwallet.com')
    expect(mainnet.legacy).toBe('https://api.yoroiwallet.com')
  })

  it('should have root and legacy endpoints for Preprod', () => {
    const preprod = API_ENDPOINTS[Chain.Network.Preprod]
    expect(preprod.root).toBe(
      'https://yoroi-backend-zero-preprod.emurgornd.com',
    )
    expect(preprod.legacy).toBe('https://preprod-backend.yoroiwallet.com')
  })

  it('should be frozen (immutable)', () => {
    expect(Object.isFrozen(API_ENDPOINTS)).toBe(true)
  })
})
