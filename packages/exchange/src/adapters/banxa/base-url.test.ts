import {
  banxaDomainProduction,
  banxaDomainSandbox,
} from '../../translators/banxa/domains'
import {generateBanxaBaseUrl} from './base-url'

describe('generateBanxaBaseUrl function', () => {
  it('should generate a production base URL for a given partner', () => {
    const isProduction = true
    const partner = 'example'
    const expectedBaseUrl = `https://example.${banxaDomainProduction}`
    const baseUrl = generateBanxaBaseUrl(isProduction, partner)

    expect(baseUrl).toBe(expectedBaseUrl)
  })

  it('should generate a sandbox base URL for a given partner', () => {
    const isProduction = false
    const partner = 'example'
    const expectedBaseUrl = `https://example.${banxaDomainSandbox}`
    const baseUrl = generateBanxaBaseUrl(isProduction, partner)

    expect(baseUrl).toBe(expectedBaseUrl)
  })

  it('should correctly handle partner names with special characters', () => {
    const isProduction = true
    const partner = 'example-partner'
    const expectedBaseUrl = `https://example-partner.${banxaDomainProduction}`
    const baseUrl = generateBanxaBaseUrl(isProduction, partner)

    expect(baseUrl).toBe(expectedBaseUrl)
  })

  it('should generate a URL with the correct domain when isProduction is undefined', () => {
    const isProduction = undefined
    const partner = 'example'
    const expectedBaseUrl = `https://example.${banxaDomainSandbox}`
    const baseUrl = generateBanxaBaseUrl(isProduction, partner)

    expect(baseUrl).toBe(expectedBaseUrl)
  })
})
