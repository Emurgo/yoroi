import {Chain, Swap} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {
  fromSwapProtocol,
  toSwapProtocol,
  transformersMaker,
} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'
import {Dex} from './types'

const address =
  'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl'
const addressHex = 'stake1u9qh50svpn80sk9ftv80l5m57840q3jecluvmjyvz5um46qaa79q4'
const network = Chain.Network.Mainnet
const stakingKey = 'stake1u8'
const transformers = transformersMaker({
  primaryTokenInfo,
  address,
  addressHex,
  network,
  stakingKey,
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

  describe('orders', () => {
    test('should correctly transform the orders response', () => {
      expect(transformers.ordersHistory.response(api.responses.orders)).toEqual(
        api.results.orders,
      )
    })
  })

  describe('cancel', () => {
    test('should correctly transform the cancel request', () => {
      expect(transformers.cancel.request(api.inputs.cancel)).toEqual(
        api.requests.cancel,
      )
    })
  })

  describe('protocols', () => {
    it.each`
      dex
      ${Dex.Minswap_v1}
      ${Dex.Minswap_v2}
      ${Dex.Minswap_stable}
      ${Dex.Wingriders_v1}
      ${Dex.Vyfi_v1}
      ${Dex.Sundaeswap_v1}
      ${Dex.Sundaeswap_v3}
      ${Dex.Muesliswap_v2}
      ${Dex.Muesliswap_clp}
      ${Dex.Spectrum_v1}
      ${Dex.Teddy_v1}
    `('should correctly transform aggregator protocols for $dex', ({dex}) => {
      const expectedProtocol = toSwapProtocol(dex)
      const result = transformers.protocols.response()
      expect(result).toContainEqual({
        aggregator: Swap.Aggregator.Muesliswap,
        protocol: expectedProtocol,
      })
    })
  })

  describe('toSwapProtocol', () => {
    it.each`
      dex                   | protocol
      ${Dex.Minswap_v1}     | ${Swap.Protocol.Minswap_v1}
      ${Dex.Minswap_v2}     | ${Swap.Protocol.Minswap_v2}
      ${Dex.Minswap_stable} | ${Swap.Protocol.Minswap_stable}
      ${Dex.Wingriders_v1}  | ${Swap.Protocol.Wingriders_v1}
      ${Dex.Vyfi_v1}        | ${Swap.Protocol.Vyfi_v1}
      ${Dex.Sundaeswap_v1}  | ${Swap.Protocol.Sundaeswap_v1}
      ${Dex.Sundaeswap_v3}  | ${Swap.Protocol.Sundaeswap_v3}
      ${Dex.Muesliswap_v2}  | ${Swap.Protocol.Muesliswap_v2}
      ${Dex.Muesliswap_clp} | ${Swap.Protocol.Muesliswap_clp}
      ${Dex.Spectrum_v1}    | ${Swap.Protocol.Spectrum_v1}
      ${Dex.Teddy_v1}       | ${Swap.Protocol.Teddy_v1}
    `('should map $dex to $protocol', ({dex, protocol}) => {
      expect(toSwapProtocol(dex)).toBe(protocol)
    })
  })

  describe('fromSwapProtocol', () => {
    it.each`
      protocol                        | dex
      ${Swap.Protocol.Minswap_v1}     | ${Dex.Minswap_v1}
      ${Swap.Protocol.Minswap_v2}     | ${Dex.Minswap_v2}
      ${Swap.Protocol.Minswap_stable} | ${Dex.Minswap_stable}
      ${Swap.Protocol.Wingriders_v1}  | ${Dex.Wingriders_v1}
      ${Swap.Protocol.Vyfi_v1}        | ${Dex.Vyfi_v1}
      ${Swap.Protocol.Sundaeswap_v1}  | ${Dex.Sundaeswap_v1}
      ${Swap.Protocol.Sundaeswap_v3}  | ${Dex.Sundaeswap_v3}
      ${Swap.Protocol.Muesliswap_v2}  | ${Dex.Muesliswap_v2}
      ${Swap.Protocol.Muesliswap_clp} | ${Dex.Muesliswap_clp}
      ${Swap.Protocol.Spectrum_v1}    | ${Dex.Spectrum_v1}
      ${Swap.Protocol.Teddy_v1}       | ${Dex.Teddy_v1}
      ${'whatever'}                   | ${Dex.Muesliswap_v2}
    `('should map $protocol to $dex', ({protocol, dex}) => {
      expect(fromSwapProtocol(protocol)).toBe(dex)
    })
  })
})
