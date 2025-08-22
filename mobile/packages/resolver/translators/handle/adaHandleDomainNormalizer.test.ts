import {handleApiConfig} from '../../adapters/handle/api'
import {adaHandleDomainNormalizer} from './adaHandleDomainNormalizer'

describe('adaHandleDomainNormalizer', () => {
  it('normalizes the domain in mainnet', () => {
    const policyId = handleApiConfig.mainnet.policyId
    const domain = 'domain'
    const normalizedDomain = '$domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(normalizedDomain)
  })

  it('normalizes the domain in preprod', () => {
    const policyId = handleApiConfig.preprod.policyId
    const domain = 'domain'
    const normalizedDomain = '$domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(normalizedDomain)
  })

  it('doesnt normalizes the domain: domain normalized already in mainnet', () => {
    const policyId = handleApiConfig.mainnet.policyId
    const domain = '$domain'

    const result = adaHandleDomainNormalizer[policyId]?.(domain)

    expect(result).toBe(domain)
  })

  it('doesnt normalizes the domain: domain normalized already in preprod', () => {
    const policyId = handleApiConfig.preprod.policyId
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
