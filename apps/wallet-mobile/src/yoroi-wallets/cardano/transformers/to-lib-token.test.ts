import {tokenInfoMocks} from '@yoroi/portfolio'

import {toLibToken} from './to-lib-token'

describe('toLibToken', () => {
  it('should convert secondary token info to lib token', () => {
    const tokenInfo = tokenInfoMocks.ftNoTicker
    const libToken = toLibToken(tokenInfo)
    expect(libToken).toEqual({
      identifier: tokenInfo.id,
      isDefault: false,
    })
  })
  it('should convert primary token info to lib token', () => {
    const tokenInfo = tokenInfoMocks.primaryETH
    const libToken = toLibToken(tokenInfo)
    expect(libToken).toEqual({
      identifier: tokenInfo.id,
      isDefault: true,
    })
  })
})
