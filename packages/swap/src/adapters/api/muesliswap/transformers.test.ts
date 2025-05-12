import {Chain, Swap} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {
  fromSwapProtocol,
  toSwapProtocol,
  transformersMaker,
} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'
import {CreateOrderRequest, Dex} from './types'

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
  partner: 'somePartnerId',
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
    it.each(api.inputs.cancel)(
      'should correctly transform cancel request',
      (input) => {
        expect(transformers.cancel.request(input)).toEqual(api.requests.cancel)
      },
    )

    test('should correctly transform the cancel response', () => {
      expect(transformers.cancel.response(api.responses.cancel)).toEqual(
        api.results.cancel,
      )
    })
  })

  describe('quote', () => {
    test('should correctly transform the quote request', () => {
      expect(transformers.quote.request(api.inputs.quote)).toEqual(
        api.requests.quote,
      )

      expect(
        transformers.quote.request({
          slippage: 0.01,
          tokenIn: '.',
          tokenOut:
            'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
          amountOut: 10,
          protocol: 'minswap-v1',
          blockedProtocols: ['wingriders-v1'],
        }),
      ).toEqual({
        buy_amount: '10',
        buy_token:
          'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
        dex: ['minswap-v1'],
        numbers_have_decimals: true,
        partner: 'somePartnerId',
        sell_token: '.',
        slippage: 0.0001,
      })

      const input = {...api.inputs.quote, protocol: undefined}
      const request = {
        ...api.requests.quote,
        dex: [
          'muesliswap-v2',
          'muesliswap-clp',
          'minswap-v1',
          'minswap-v2',
          'minswap-stable',
          'spectrum-v1',
          'teddy-v1',
          'wingriders-v2',
          'vyfi-v1',
          'sundaeswap-v1',
          'sundaeswap-v3',
        ],
      }
      expect(transformers.quote.request(input)).toEqual(request)
    })

    test('should correctly transform the quote response', () => {
      expect(transformers.quote.response(api.responses.quote)).toEqual(
        api.results.quote,
      )
    })

    test('should correctly transform the quote response with missing output', () => {
      expect(transformers.quote.response(api.responses.quoteNoOut)).toEqual(
        api.results.quoteNoOut,
      )
    })
  })

  describe('quoteLimit', () => {
    test('should correctly transform the quote request', () => {
      expect(transformers.limitQuote.request(api.inputs.quoteLimit)).toEqual(
        api.requests.quoteLimit,
      )

      const input = {...api.inputs.quoteLimit, protocol: undefined}
      const request = {...api.requests.quoteLimit, dex: undefined}
      expect(transformers.limitQuote.request(input)).toEqual(request)
    })
  })

  describe('create', () => {
    test('should correctly transform the create request', () => {
      expect(transformers.create.request(api.inputs.create[0]!)).toEqual(
        api.requests.create(address)[0],
      )
      expect(transformers.create.request(api.inputs.create[1]!)).toEqual(
        api.requests.create(address)[1],
      )
    })

    test('should correctly transform the create response', () => {
      expect(transformers.create.response(api.responses.create)).toEqual(
        api.results.create,
      )
    })
  })

  describe('createLimit', () => {
    test('should correctly transform the createLimit request', () => {
      expect(
        transformers.createLimit.request(api.inputs.createLimit[0]!),
      ).toEqual(api.requests.createLimit(address))
      expect(
        transformers.createLimit.request(api.inputs.createLimit[1]!),
      ).toEqual<CreateOrderRequest>({
        ...api.requests.createLimit(address),
        buy_amount: '0',
        dex: Dex.Unsupported,
      })
    })

    test('should correctly transform the createLimit response', () => {
      expect(
        transformers.createLimit.response(api.responses.createLimit),
      ).toEqual(api.results.createLimit)
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
      ${Swap.Protocol.Minswap_stable} | ${Dex.Minswap_stable}
      ${Swap.Protocol.Wingriders_v1}  | ${Dex.Wingriders_v1}
      ${Swap.Protocol.Vyfi_v1}        | ${Dex.Vyfi_v1}
      ${Swap.Protocol.Sundaeswap_v1}  | ${Dex.Sundaeswap_v1}
      ${Swap.Protocol.Sundaeswap_v3}  | ${Dex.Sundaeswap_v3}
      ${Swap.Protocol.Muesliswap_v2}  | ${Dex.Muesliswap_v2}
      ${Swap.Protocol.Muesliswap_clp} | ${Dex.Muesliswap_clp}
      ${Swap.Protocol.Spectrum_v1}    | ${Dex.Spectrum_v1}
      ${Swap.Protocol.Teddy_v1}       | ${Dex.Teddy_v1}
      ${Swap.Protocol.Unsupported}    | ${Dex.Unsupported}
      ${'new-protocol'}               | ${Dex.Unsupported}
    `('should map $protocol to $dex', ({protocol, dex}) => {
      expect(fromSwapProtocol(protocol)).toBe(dex)
    })
  })
})
