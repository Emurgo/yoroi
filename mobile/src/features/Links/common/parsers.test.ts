import {Links} from '@yoroi/types'

import {codeContent} from '~/features/Scan/common/mocks'

import {parseCardanoLink} from './parsers'

describe('parseCardanoLink', () => {
  it('should correctly parse a non-link address', () => {
    const result = parseCardanoLink(codeContent.noLink.success.address)
    expect(result).toEqual({
      action: 'send-only-receiver',
      receiver: codeContent.noLink.success.address,
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
      params: expect.any(Object),
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
})
