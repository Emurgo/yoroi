import {Chain, Swap} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {
  fromSwapProtocol,
  ptIdDh,
  toSwapProtocol,
  transformersMaker,
} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'
import {Dex} from './types'

const address = 'addr1q9g8vz5'
const network = Chain.Network.Mainnet
const transformers = transformersMaker({
  primaryTokenInfo,
  address,
  network,
  isPrimaryToken,
})

describe('transformers', () => {
  describe('tokens', () => {
    test('should correctly transform the tokens response', () => {
      expect(transformers.tokens.response(api.responses.tokens)).toEqual(
        api.results.tokens,
      )
    })
  })

  test('should correctly transform the token id', () => {
    expect(transformers.tokens.fromId(ptIdDh)).toBe(primaryTokenInfo.id)
    expect(transformers.tokens.toId(primaryTokenInfo.id)).toBe('ADA')
  })
})
describe('toSwapProtocol', () => {
  it.each`
    dex                  | protocol
    ${Dex.Minswap_v1}    | ${Swap.Protocol.Minswap_v1}
    ${Dex.Minswap_v2}    | ${Swap.Protocol.Minswap_v2}
    ${Dex.Wingriders_v1} | ${Swap.Protocol.Wingriders_v1}
    ${Dex.Wingriders_v2} | ${Swap.Protocol.Wingriders_v2}
    ${Dex.Vyfi_v1}       | ${Swap.Protocol.Vyfi_v1}
    ${Dex.Sundaeswap_v1} | ${Swap.Protocol.Sundaeswap_v1}
    ${Dex.Sundaeswap_v3} | ${Swap.Protocol.Sundaeswap_v3}
    ${Dex.Splash_v1}     | ${Swap.Protocol.Splash_v1}
  `('should map $dex to $protocol', ({dex, protocol}) => {
    expect(toSwapProtocol(dex)).toBe(protocol)
  })
})

describe('fromSwapProtocol', () => {
  it.each`
    protocol                        | dex
    ${Swap.Protocol.Minswap_v1}     | ${Dex.Minswap_v1}
    ${Swap.Protocol.Minswap_v2}     | ${Dex.Minswap_v2}
    ${Swap.Protocol.Wingriders_v1}  | ${Dex.Wingriders_v1}
    ${Swap.Protocol.Wingriders_v2}  | ${Dex.Wingriders_v2}
    ${Swap.Protocol.Vyfi_v1}        | ${Dex.Vyfi_v1}
    ${Swap.Protocol.Sundaeswap_v1}  | ${Dex.Sundaeswap_v1}
    ${Swap.Protocol.Sundaeswap_v3}  | ${Dex.Sundaeswap_v3}
    ${Swap.Protocol.Splash_v1}      | ${Dex.Splash_v1}
    ${Swap.Protocol.Minswap_stable} | ${undefined}
    ${Swap.Protocol.Teddy_v1}       | ${undefined}
    ${Swap.Protocol.Muesliswap_v2}  | ${undefined}
    ${Swap.Protocol.Muesliswap_clp} | ${undefined}
    ${Swap.Protocol.Spectrum_v1}    | ${undefined}
  `('should map $protocol to $dex', ({protocol, dex}) => {
    expect(fromSwapProtocol(protocol)).toBe(dex)
  })

  describe('aggregatorProtocols', () => {
    it.each`
      dex
      ${Dex.Minswap_v1}
      ${Dex.Minswap_v2}
      ${Dex.Wingriders_v1}
      ${Dex.Wingriders_v2}
      ${Dex.Vyfi_v1}
      ${Dex.Sundaeswap_v1}
      ${Dex.Sundaeswap_v3}
      ${Dex.Splash_v1}
    `('should correctly transform aggregator protocols for $dex', ({dex}) => {
      const expectedProtocol = toSwapProtocol(dex)
      const result = transformers.aggregatorProtocols.response()
      expect(result).toContainEqual({
        aggregator: Swap.Aggregator.Dexhunter,
        protocol: expectedProtocol,
      })
    })
  })
})
