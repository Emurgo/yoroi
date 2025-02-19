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

const address =
  'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl'
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

    test('should correctly transform the token id', () => {
      expect(transformers.tokens.fromId(ptIdDh)).toBe(primaryTokenInfo.id)
      expect(transformers.tokens.toId(primaryTokenInfo.id)).toBe('ADA')
    })
  })

  describe('orders', () => {
    test('should correctly transform the orders response', () => {
      expect(transformers.orders.response(api.responses.orders)).toEqual(
        api.results.orders,
      )
    })
  })

  describe('cancel', () => {
    test('should correctly transform the cancel request', () => {
      expect(transformers.cancel.request(api.inputs.cancel)).toEqual(
        api.requests.cancel(address),
      )
    })

    test('should correctly transform the cancel response', () => {
      expect(transformers.cancel.response(api.responses.cancel)).toEqual(
        api.results.cancel,
      )
    })
  })

  describe('estimate', () => {
    test('should correctly transform the estimate request', () => {
      expect(transformers.estimate.request(api.inputs.estimate)).toEqual(
        api.requests.estimate,
      )
    })

    test('should correctly transform the estimate response', () => {
      expect(transformers.estimate.response(api.responses.estimate)).toEqual(
        api.results.estimate,
      )
    })
  })

  describe('reverseEstimate', () => {
    test('should correctly transform the reverse estimate request', () => {
      expect(
        transformers.reverseEstimate.request(api.inputs.reverseEstimate),
      ).toEqual(api.requests.reverseEstimate)
    })

    test('should correctly transform the reverse estimate response', () => {
      expect(
        transformers.reverseEstimate.response(api.responses.reverseEstimate),
      ).toEqual(api.results.reverseEstimate)
    })
  })

  describe('limitEstimate', () => {
    test('should correctly transform the limit estimate request', () => {
      expect(
        transformers.limitEstimate.request(api.inputs.limitEstimate),
      ).toEqual(api.requests.limitEstimate)
    })

    test('should correctly transform the limit estimate response', () => {
      expect(
        transformers.limitEstimate.response(api.responses.limitEstimate),
      ).toEqual(api.results.limitEstimate)
    })
  })
})

describe('toSwapProtocol', () => {
  it.each`
    dex                   | protocol
    ${Dex.Minswap_v1}     | ${Swap.Protocol.Minswap_v1}
    ${Dex.Minswap_v2}     | ${Swap.Protocol.Minswap_v2}
    ${Dex.Wingriders_v1}  | ${Swap.Protocol.Wingriders_v1}
    ${Dex.Wingriders_v2}  | ${Swap.Protocol.Wingriders_v2}
    ${Dex.Vyfi_v1}        | ${Swap.Protocol.Vyfi_v1}
    ${Dex.Sundaeswap_v1}  | ${Swap.Protocol.Sundaeswap_v1}
    ${Dex.Sundaeswap_v3}  | ${Swap.Protocol.Sundaeswap_v3}
    ${Dex.Splash_v1}      | ${Swap.Protocol.Splash_v1}
    ${Dex.Muesliswap_v2}  | ${Swap.Protocol.Muesliswap_v2}
    ${Dex.Muesliswap_clp} | ${Swap.Protocol.Muesliswap_clp}
    ${Dex.Unsupported}    | ${Swap.Protocol.Unsupported}
    ${'new-protocol'}     | ${Swap.Protocol.Unsupported}
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
    ${Swap.Protocol.Muesliswap_v2}  | ${Dex.Muesliswap_v2}
    ${Swap.Protocol.Muesliswap_clp} | ${Dex.Muesliswap_clp}
    ${Swap.Protocol.Teddy_v1}       | ${Dex.Unsupported}
    ${Swap.Protocol.Minswap_stable} | ${Dex.Unsupported}
    ${Swap.Protocol.Spectrum_v1}    | ${Dex.Unsupported}
    ${Swap.Protocol.Unsupported}    | ${Dex.Unsupported}
    ${'new-protocol'}               | ${Dex.Unsupported}
  `('should map $protocol to $dex', ({protocol, dex}) => {
    expect(fromSwapProtocol(protocol)).toBe(dex)
  })

  describe('protocols', () => {
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
      ${Dex.Muesliswap_v2}
      ${Dex.Muesliswap_clp}
      ${Dex.Unsupported}
    `('should correctly transform aggregator protocols for $dex', ({dex}) => {
      const expectedProtocol = toSwapProtocol(dex)
      const result = transformers.protocols.response()
      expect(result).toContainEqual({
        aggregator: Swap.Aggregator.Dexhunter,
        protocol: expectedProtocol,
      })
    })
  })
})
