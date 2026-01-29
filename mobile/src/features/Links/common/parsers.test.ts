import {Links} from '@yoroi/types'

import {codeContent} from '~/features/Scan/common/mocks'

import {parseCardanoLink} from './parsers'

describe('parseCardanoLink', () => {
  it('should correctly parse a non-link address', () => {
    const result = parseCardanoLink(codeContent.noLink.success.address)
    expect(result).toEqual({
      action: 'send-only-receiver',
      receiver: codeContent.noLink.success.address,
      network: 'preprod',
    })
  })

  it('should throw UnknownContent for invalid non-link content', () => {
    expect(() => parseCardanoLink(codeContent.noLink.error.invalid)).toThrow(
      Links.Errors.UnknownContent,
    )
  })

  it('should throw SchemeNotImplemented for links not supported like bitcoin', () => {
    expect(() =>
      parseCardanoLink(codeContent.links.error.schemeNotImplemented),
    ).toThrow(Links.Errors.SchemeNotImplemented)
  })

  it('should correctly parse a Cardano link for claim v1', () => {
    const result = parseCardanoLink(
      codeContent.links.success.cardanoCip99ClaimV1,
    )
    expect(result).toEqual({
      action: 'claim',
      url: expect.any(String),
      code: expect.any(String),
      params: expect.any(Object),
    })
  })

  it('should correctly parse a Cardano link for legacy transfer', () => {
    const result = parseCardanoLink(
      codeContent.links.success.legacyCip13Transfer,
    )
    expect(result).toEqual({
      action: 'send-single-pt',
      receiver: expect.any(String),
      network: 'preprod',
      params: expect.any(Object),
    })
  })

  it('should correctly parse modern pay format with decimal amount', () => {
    // Modern format: web+cardano://pay/v1?address=...&amount=30.000001
    const url =
      'web+cardano://pay/v1?address=addr_test1qrtckf85609ucg5sdq5kgdef94058cnmfrw3ukupnay4va555stym27wkwyqw3z6uwr57plm22pyse00u9atdyzecg8s27xq0m&amount=30.000001'
    const result = parseCardanoLink(url)
    expect(result).toEqual({
      action: 'pay-request',
      address: expect.any(String),
      network: 'preprod',
      amount: '30.000001',
      asset: undefined,
      memo: undefined,
    })
  })

  it('should correctly parse legacy format with decimal amount', () => {
    // Legacy format: web+cardano:addr...?amount=30.000001
    const url =
      'web+cardano:addr_test1qrtckf85609ucg5sdq5kgdef94058cnmfrw3ukupnay4va555stym27wkwyqw3z6uwr57plm22pyse00u9atdyzecg8s27xq0m?amount=30.000001'
    const result = parseCardanoLink(url)
    expect(result).toEqual({
      action: 'send-single-pt',
      receiver: expect.any(String),
      network: 'preprod',
      params: {
        amount: '30.000001',
        memo: undefined,
        message: undefined,
      },
    })
  })

  it('should detect mainnet network for mainnet addresses', () => {
    // Mainnet address starts with 'addr1' (not 'addr_test1')
    const url =
      'web+cardano://pay/v1?address=addr1qxvn5nehgdjadqpztxqckh4yz37h0vc7rnl57x9jfaraxxe627hhjyls27xwmke4e4ewn27rv3qcntakvp7wd53dqahqxuhfua&amount=10'
    const result = parseCardanoLink(url)
    expect(result).toEqual({
      action: 'pay-request',
      address: expect.any(String),
      network: 'mainnet',
      amount: '10',
      asset: undefined,
      memo: undefined,
    })
  })

  it('should correctly parse a Yoroi link', () => {
    const result = parseCardanoLink(
      codeContent.links.success.yoroiPaymentRequestWithLink,
    )
    expect(result).toEqual({
      action: 'launch-url',
      url: codeContent.links.success.yoroiPaymentRequestWithLink,
    })
  })

  // Note: The following tests verify error handling for malformed URLs.
  // The @yoroi/links library performs initial validation and may throw
  // RequiredParamsMissing or UnsupportedVersion before our parser code runs.
  // Our defensive validation provides an additional safety layer.

  it('should throw error for pay authority without address', () => {
    // The library throws RequiredParamsMissing when address param is missing
    const url = 'web+cardano://pay/v1?amount=10'
    expect(() => parseCardanoLink(url)).toThrow(
      Links.Errors.RequiredParamsMissing,
    )
  })

  it('should throw error for payment authority without address', () => {
    // The library throws UnsupportedVersion for invalid payment URL format
    const url = 'web+cardano://payment?amount=10'
    expect(() => parseCardanoLink(url)).toThrow()
  })

  it('should throw error for address authority without address', () => {
    // The library throws UnsupportedVersion for invalid address URL format
    const url = 'web+cardano://address'
    expect(() => parseCardanoLink(url)).toThrow()
  })
})
