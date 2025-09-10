import {Swap} from '@yoroi/types'

import {getDexUrlByProtocol} from './getDexUrlByProtocol'

describe('getDexUrlByProtocol', () => {
  it('should return the correct URL for a known protocol', () => {
    const protocol = Swap.Protocol.Minswap_stable

    const result = getDexUrlByProtocol(protocol)

    expect(result).toBe('https://minswap.org')
  })

  it('should return the default URL for an unknown protocol', () => {
    const protocol = 'unknown_protocol' as Swap.Protocol
    const expectedUrl = 'https://yoroi-wallet.com'

    const result = getDexUrlByProtocol(protocol)

    expect(result).toBe(expectedUrl)
  })
})
