import {domainNormalizer} from './domainNormalizer'

describe('domainNormalizer', () => {
  it('normalizes the domain', () => {
    const policyId = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a'
    const domain = 'domain'
    const normalizedDomain = `$${domain}`

    const result = domainNormalizer(policyId, domain)

    expect(result).toBe(normalizedDomain)
  })

  it('doesnt normalize the domain: unknow policy id', () => {
    const policyId = 'fake-policy-id'
    const domain = 'domain'

    const result = domainNormalizer(policyId, domain)

    expect(result).toBe(domain)
  })
})
