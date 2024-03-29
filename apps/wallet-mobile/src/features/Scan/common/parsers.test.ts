import {Links} from '@yoroi/types'

import {codeContent} from './mocks'
import {parseScanAction} from './parsers'
import {ScanErrorUnknownContent} from './types'

describe('parseScanAction', () => {
  it('should correctly parse a non-link address', () => {
    const result = parseScanAction(codeContent.noLink.success.address)
    expect(result).toEqual({
      action: 'send-only-receiver',
      receiver: codeContent.noLink.success.address,
    })
  })

  it('should throw ScanErrorUnknownContent for invalid non-link content', () => {
    expect(() => parseScanAction(codeContent.noLink.error.invalid)).toThrow(ScanErrorUnknownContent)
  })

  it('should throw SchemeNotImplemented for links not supporte like bitcoin', () => {
    expect(() => parseScanAction(codeContent.links.error.schemeNotImplemented)).toThrow(
      Links.Errors.SchemeNotImplemented,
    )
  })

  it('should correctly parse a Cardano link for claim v1', () => {
    const result = parseScanAction(codeContent.links.success.cardanoCip99ClaimV1)
    expect(result).toEqual({
      action: 'claim',
      url: expect.any(String),
      code: expect.any(String),
      params: expect.any(Object),
    })
  })

  it('should correctly parse a Cardano link for legacy transfer', () => {
    const result = parseScanAction(codeContent.links.success.legacyCip13Transfer)
    expect(result).toEqual({
      action: 'send-single-pt',
      receiver: expect.any(String),
      params: expect.any(Object),
    })
  })
})
