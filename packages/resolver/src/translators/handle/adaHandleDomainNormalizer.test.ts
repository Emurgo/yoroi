import {handleApiConfig} from '../../adapters/handle/api'
import {adaHandleDomainNormalizer} from './adaHandleDomainNormalizer'

describe('adaHandleDomainNormalizer', () => {
  it('normalizes the domain', () => {
    const policyId = handleApiConfig.mainnet.policyId
    const domain = 'domain'
    const normalizedDomain = '$domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(normalizedDomain)
  })

  it('doesnt normalizes the domain: domain normalized already', () => {
    const policyId = handleApiConfig.mainnet.policyId
    const domain = '$domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(domain)
  })

  it('returns undefined: unknown policy id', () => {
    const policyId = 'fake-policy-id'
    const domain = 'domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(undefined)
  })
})
