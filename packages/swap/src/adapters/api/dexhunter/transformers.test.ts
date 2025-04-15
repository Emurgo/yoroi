import {Chain, Swap} from '@yoroi/types'
import {isPrimaryToken} from '@yoroi/portfolio'

import {
  fromSwapProtocol,
  ptIdDh,
  reverse,
  toSwapProtocol,
  toSwapSplit,
  transformersMaker,
} from './transformers'
import {api, primaryTokenInfo} from './api.mocks'
import {Dex, Split} from './types'

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
      expect(
        transformers.tokens.response([
          ...api.responses.tokens,
          {
            token_id:
              '000000000000000000000000000000000000000000000000000000006c6f76656c616365',

            token_policy:
              '00000000000000000000000000000000000000000000000000000000',
            is_verified: true,
            supply: 45_000_000_000,
            creation_date: '0001-01-01T00:00:00Z',
            price: 0,
          },
        ]),
      ).toEqual([
        ...api.results.tokens,
        {
          application: 'coin',
          decimals: 6,
          description: '',
          fingerprint: '',
          id: '.',
          name: 'Cardano',
          nature: 'primary',
          originalImage: '',
          reference: '',
          status: 'valid',
          symbol: 'ADA',
          tag: '',
          ticker: 'ADA',
          type: 'ft',
          website: '',
        },
      ])
    })

    test('should correctly transform the token id', () => {
      expect(transformers.tokens.fromId(ptIdDh)).toBe(primaryTokenInfo.id)
      expect(transformers.tokens.toId(primaryTokenInfo.id)).toBe('ADA')
    })
  })

  describe('orders', () => {
    test('should correctly transform the orders response', () => {
      expect(
        transformers.orders.response([
          ...api.responses.orders,
          {
            _id: '66cf043794579f05fc204f72',
            dex: 'SUNDAESWAP',
            user_address:
              'addr1q9qhyvkm5fytm5ckgshny0zz08a3urhhh7ckdqxcm27av40eafn3v5lr2w2n2er9uj7c743mt42gpe8tgek6394z9t7qn4yjzl',
            user_stake:
              'stake1u8u75eck203489f4v3j7f0v02ca464yqun45vmdgj63z4lqm9pu9k',
            submission_time: undefined,
            last_update: undefined,
            output_index: 0,
            is_stop_loss: false,
            is_oor: false,
            batcher_fee: 2.5,
            deposit: 2,
            status: 'PENDING',
          },
        ]),
      ).toEqual([
        ...api.results.orders,
        {
          actualAmountOut: 0,
          aggregator: 'muesliswap',
          amountIn: 0,
          customId: '66cf043794579f05fc204f72',
          expectedAmountOut: 0,
          lastUpdate: undefined,
          placedAt: undefined,
          outputIndex: 0,
          protocol: 'sundaeswap-v1',
          status: 'open',
          tokenIn: '.',
          tokenOut: '.',
          txHash: '',
          updateTxHash: '',
        },
      ])
    })
  })

  describe('cancel', () => {
    test('should correctly transform the cancel request', () => {
      expect(transformers.cancel.request(api.inputs.cancel)).toEqual(
        api.requests.cancel(address),
      )
    })

    test('should correctly transform the cancel request to default', () => {
      expect(transformers.cancel.request(api.inputs.cancel)).toEqual(
        api.requests.cancel(address),
      )
    })

    test('should correctly transform the cancel response to default', () => {
      expect(
        transformers.cancel.response({
          additional_cancellation_fee: 2_000_000,
        }),
      ).toEqual({
        cbor: '',
        additionalCancellationFee: 2_000_000,
      })
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

    test('should correctly transform the estimate response 2', () => {
      expect(
        transformers.estimate.response(
          {
            splits: [
              {
                expected_output: 9223372036854.775,
                expected_output_without_slippage: 9223372036854.775,
                fee: 4,
                dex: 'VYFI',
                price_impact: 843546.4933049141,
                initial_price: 0.00011853462095991185,
                final_price: 1.0000131730805681,
                pool_id:
                  '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
                batcher_fee: 2,
                deposits: 2,
                price_distortion: 841015.5508249996,
                pool_fee: 0.003,
              },
            ],
            total_fee: 4,
            total_output: 0,
            deposits: 2,
            batcher_fee: 2,
            total_input: 1000000000000000,
            possible_routes: {},
            net_price: 0,
            net_price_reverse: 0,
            dexhunter_fee: 1,
            blacklisted_dexes: null,
            partner: '',
            partner_fee: 0,
          },
          true,
        ),
      ).toEqual({
        aggregatorFee: 1,
        batcherFee: 2,
        deposits: 2,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [
          {
            amountIn: 0,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 9223372036854.775,
            expectedOutputWithoutSlippage: 9223372036854.775,
            fee: 4,
            finalPrice: 1.0000131730805681,
            initialPrice: 0.00011853462095991185,
            poolFee: 0.003,
            poolId:
              '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
            priceDistortion: 841015.5508249996,
            priceImpact: 843546.4933049141,
            protocol: 'vyfi-v1',
          },
        ],
        totalFee: 3,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the estimate response to defaults', () => {
      expect(
        transformers.estimate.response({
          total_input: 1000000000000000,
          possible_routes: {},
          blacklisted_dexes: null,
          partner: '',
        }),
      ).toEqual({
        aggregatorFee: 0,
        batcherFee: 0,
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [],
        totalFee: 0,
        totalInput: undefined,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
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

    test('should correctly transform the reverse estimate response to default', () => {
      expect(
        transformers.reverseEstimate.response(
          {
            possible_routes: {},
            total_input_without_slippage: 0.0045599187141238265,
          },
          true,
        ),
      ).toEqual({
        aggregatorFee: 0,
        batcherFee: 0,
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [],
        totalFee: 0,
        totalInput: undefined,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the reverse estimate response to default with speacial splits', () => {
      expect(
        transformers.reverseEstimate.response({
          splits: [
            {
              expected_output: 35.288684,
              expected_output_without_slippage: 37.145984,
              fee: 4,
              dex: 'MINSWAP',
              price_impact: 0.0013874760358920197,
              initial_price: 0.00012238115855095046,
              final_price: 0.0001223828565601978,
              pool_id:
                '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950MINSWAPc1245066d133f864ff9220aabb1388bb801986e6da6754b8234ce8fc3c6029f6',
              batcher_fee: 2,
              deposits: 2,
              price_distortion: 0.30161668639221895,
              pool_fee: 0.003,
            },
          ],
          possible_routes: {},
          total_input_without_slippage: 0.0045599187141238265,
          net_price_reverse: 122.75670807707843,
        }),
      ).toEqual({
        aggregatorFee: 0,
        batcherFee: 0,
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [
          {
            amountIn: 0,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 35.288684,
            expectedOutputWithoutSlippage: 37.145984,
            fee: 4,
            finalPrice: 0.0001223828565601978,
            initialPrice: 0.00012238115855095046,
            poolFee: 0.003,
            poolId:
              '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950MINSWAPc1245066d133f864ff9220aabb1388bb801986e6da6754b8234ce8fc3c6029f6',
            priceDistortion: 0.30161668639221895,
            priceImpact: 0.0013874760358920197,
            protocol: 'minswap-v1',
          },
        ],
        totalInput: 0,
        totalFee: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })
  })

  describe('limitEstimate', () => {
    test('should correctly transform the limit estimate request', () => {
      expect(
        transformers.limitEstimate.request(api.inputs.limitEstimate),
      ).toEqual(api.requests.limitEstimate)
    })

    test('should correctly transform the limit estimate request to default', () => {
      expect(
        transformers.limitEstimate.request({
          tokenIn: '.',
          tokenOut:
            'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b.44524950',
          amountIn: 38,
          protocol: undefined,
          blockedProtocols: ['wingriders-v1'],
          amountOut: undefined,
          multiples: undefined,
          wantedPrice: 1,
          slippage: 0,
        }),
      ).toEqual({
        amount_in: 38,
        blacklisted_dexes: ['WINGRIDER'],
        dex: 'UNSUPPORTED',
        multiples: 1,
        token_in: 'ADA',
        token_out:
          'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950',
        wanted_price: 1,
      })
    })

    test('should correctly transform the limit estimate response to default', () => {
      expect(
        transformers.limitEstimate.response(
          {
            total_fee: undefined,
            total_output: undefined,
            deposits: undefined,
            batcher_fee: undefined,
            total_input: undefined,
            possible_routes: {},
            net_price: undefined,
            dexhunter_fee: undefined,
            blacklisted_dexes: null,
            partner: '',
            partner_fee: undefined,
          },
          false,
        ),
      ).toEqual({
        aggregatorFee: 0,
        batcherFee: 0,
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [],
        totalFee: 0,
        totalInput: undefined,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the limit estimate response to default with special split case', () => {
      expect(
        transformers.limitEstimate.response(
          {
            total_fee: undefined,
            total_output: undefined,
            deposits: undefined,
            batcher_fee: undefined,
            total_input: undefined,
            possible_routes: {},
            net_price: undefined,
            dexhunter_fee: undefined,
            blacklisted_dexes: null,
            partner: '',
            partner_fee: undefined,
            splits: [
              {
                expected_output: 9223372036854.775,
                expected_output_without_slippage: 9223372036854.775,
                fee: 4,
                dex: 'VYFI',
                price_impact: 874011.5392608035,
                initial_price: 0.00011440337320702896,
                final_price: 1.0000130865062424,
                pool_id:
                  '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
                batcher_fee: 2,
                deposits: 2,
                price_distortion: 871389.201643021,
                pool_fee: 0.003,
              },
            ],
          },
          false,
        ),
      ).toEqual({
        aggregatorFee: 0,
        batcherFee: 0,
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
        splits: [
          {
            amountIn: 0,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 9223372036854.775,
            expectedOutputWithoutSlippage: 9223372036854.775,
            fee: 4,
            finalPrice: 1.0000130865062424,
            initialPrice: 0.00011440337320702896,
            poolFee: 0.003,
            poolId:
              '000000000000000000000000000000000000000000000000000000006c6f76656c616365af2e27f580f7f08e93190a81f72462f153026d06450924726645891b44524950VYFIaddr1wx6vzxyapfw4f4ragkvqtk3y473wj4sul3fr98xhguvazlse88lan',
            priceDistortion: 871389.201643021,
            priceImpact: 874011.5392608035,
            protocol: 'vyfi-v1',
          },
        ],
      })
    })

    test('should correctly transform the limit estimate response', () => {
      expect(
        transformers.limitEstimate.response(api.responses.limitEstimate, false),
      ).toEqual(api.results.limitEstimate)
    })
  })

  describe('limitBuild', () => {
    test('should correctly transform the limit build request to default', () => {
      expect(transformers.limitBuild.request(api.inputs.create[0]!)).toEqual(
        api.requests.limitBuild,
      )
    })

    test('should correctly transform the limit build request', () => {
      expect(
        transformers.limitBuild.request({
          ...api.inputs.create[0],
          protocol: 'minswap-v1',
          amountIn: 1,
          tokenIn: '.',
          tokenOut: 'abc.cbr',
        }),
      ).toEqual({
        ...api.requests.limitBuild,
        dex: 'MINSWAP',
        token_out: 'abccbr',
      })
    })

    test('should correctly transform the limit build request alt', () => {
      expect(
        transformers.limitBuild.request({
          ...api.inputs.create[2],
          protocol: 'minswap-v1',
          amountIn: 1,
          tokenIn: '.',
          tokenOut: 'abc.cbr',
        }),
      ).toEqual({
        ...api.requests.limitBuild,
        dex: 'MINSWAP',
        token_out: 'abccbr',
        wanted_price: 1,
      })
    })

    test('should correctly transform the limit build response', () => {
      expect(
        transformers.limitBuild.response(api.responses.limitBuild, false),
      ).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0,
        batcherFee: 0,
        cbor: '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
        deposits: 2,
        frontendFee: 0,
        netPrice: 0.04252918925670425,
        splits: [
          {
            amountIn: 1,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 1130,
            expectedOutputWithoutSlippage: 1130,
            fee: 0.3,
            finalPrice: 0.041994,
            initialPrice: 0.04252918925670425,
            poolFee: 0.3,
            poolId:
              '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
            priceDistortion: 1.258404559451805,
            priceImpact: 1.258404559451805,
            protocol: 'minswap-v1',
          },
        ],
        priceImpact: 1.258404559451805,
        totalFee: 0,
        totalInput: 1,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the limit build response (speacial case)', () => {
      expect(
        transformers.limitBuild.response(
          {
            cbor: '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
            deposits: 2,
            splits: [
              {
                batcher_fee: 2,
                deposits: 2,
                expected_output: 1130,
                expected_output_without_slippage: 1130,
                fee: 0.3,
                final_price: 0.041994,
                initial_price: 0.04252918925670425,
                pool_fee: 0.3,
                pool_id:
                  '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
                price_distortion: 1.258404559451805,
                price_impact: 1.258404559451805,
                dex: 'MINSWAP',
              },
            ],
            totalFee: 4,
          },
          false,
        ),
      ).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0,
        batcherFee: 0,
        cbor: '84a500838258203976997901257e283cc9da856b9e50174c4eb9dfd8ce55b5be9fbe2f9289577500825820475ffb1f1820eee1790729d86ced473e9f7724ddcd7bf59b477e3293415f16bf03825820e22c3b1fd8e77643612bb2611e8fb74238ba540867dd9d4ecaec1590c613566400018283583911a65ca58a4e9c755fa830173d2a5caed458ac0c73f97db7faae2e7e3b52563c5410bff6a0d43ccebb7c37e1f69f5eb260552521adff33b9c21a004c4b40582079aaea3504c39973f6bd387a2250e3553220722f429ffddbf6dae7f3c7bfb61c825839014747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aecf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdc821a005a5946ac581c2441ab3351c3b80213a98f4e09ddcf7dabe4879c3c94cc4e7205cb63a144464952451909e3581c279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3fa144534e454b18cc581c4cb48d60d1f7823d1307c61b9ecf472ff78cf22d1ccc5786d59461f8a1474144414d4f4f4e1a004c3d2e581c8654e8b350e298c80d2451beb5ed80fc9eee9f38ce6b039fb8706bc3a1474c4f42535445521a0010f66f581ca0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235a145484f534b591a06e8f5c4581cafbe91c0b44b3040e360057bf8354ead8c49c4979ae6ab7c4fbdc9eba1464d494c4b76321a00424fe1581cb788fbee71a32d2efc5ee7d151f3917d99160f78fb1e41a1bbf80d8fa1494c454146544f4b454e1b0000000536f5613f581cc5609c4800c05e82c4219ccf14c7fdf5212e11f83dbbb57ac716e98ea145666c756666186f581cc898c986b97e7ac5b33e999bc11b054a9987f48ec4459f8c1ea0c32ba148435245414d5049451a06a21941581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48aa144434153541911bd581ce0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8da14d6a6176696275656e6f2e61646101581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa14d000de1406a6176696275656e6f01021a0003388d0758203ee91922e55ac83b91cdce3d7aa8fb01085e26622a6da92bad3908c29cbffca00b582067cbc9782dbb59e371f3dbc4eeba0b20cdeb91e1b7f53efaccd58f78975a50fba10481d8799fd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd8799fd8799f581c4747a9606da0c06ef08fddf31a89a604fc15584ac00ff1bf88dfc1aeffd8799fd8799fd8799f581ccf085cc39aa4ff52de1ea606ee581aac1dab8166d6830e7a9b6cecdcffffffffd87a80d8799fd8799f581ccdaaee586376139ee8c3cc4061623968810d177ca5c300afb890b48a4443415354ff19046aff1a001e84801a001e8480fff5a11902a2783b7b276d7367273a205b274d7565736c69537761702041676772656761746f7220506c61636520437573746f6d204c696d6974204f72646572275d7d',
        deposits: 2,
        frontendFee: 0,
        priceImpact: 0,
        netPrice: 0.04252918925670425,
        splits: [
          {
            amountIn: 0,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 1130,
            expectedOutputWithoutSlippage: 1130,
            fee: 0.3,
            finalPrice: 0.041994,
            initialPrice: 0.04252918925670425,
            poolFee: 0.3,
            poolId:
              '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
            priceDistortion: 1.258404559451805,
            priceImpact: 1.258404559451805,
            protocol: 'minswap-v1',
          },
        ],
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })
  })

  describe('build', () => {
    test('should correctly transform the build request', async () => {
      expect(transformers.build.request(api.inputs.create[1]!)).toEqual(
        api.requests.build,
      )
    })

    test('should correctly transform the build request to default', async () => {
      expect(transformers.build.request(api.inputs.create[0]!)).toEqual({
        ...api.requests.build,
        slippage: 0,
      })
    })

    test('should correctly transform the build response', async () => {
      expect(transformers.build.response(api.responses.build)).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0.002,
        batcherFee: 0.001,
        cbor: 'a1b2c3d4e5f6',
        deposits: 1000,
        frontendFee: 0.003,
        netPrice: 1.23,
        priceImpact: 1.258404559451805,
        splits: [
          {
            amountIn: 1,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 1130,
            expectedOutputWithoutSlippage: 1130,
            fee: 0.3,
            finalPrice: 0.041994,
            initialPrice: 0.04252918925670425,
            poolFee: 0.3,
            poolId:
              '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
            priceDistortion: 1.258404559451805,
            priceImpact: 1.258404559451805,
            protocol: 'minswap-v1',
          },
        ],
        totalFee: 0.006,
        totalInput: 500,
        totalOutput: 495,
        totalOutputWithoutSlippage: 500,
      })
    })

    test('should correctly transform the build response to defaults', async () => {
      expect(
        transformers.build.response({
          average_price: 1.234,
          communications: ['Success', 'Transaction confirmed'],
          net_price_reverse: 0.812,
          partner_code: 'PartnerX',
          possible_routes: {
            route1: 0.5,
            route2: 0.3,
            route3: 0.2,
          },
          splits: [
            {
              amount_in: 1,
              batcher_fee: 2,
              deposits: 2,
              expected_output: 1130,
              expected_output_without_slippage: 1130,
              fee: 0.3,
              final_price: 0.041994,
              initial_price: 0.04252918925670425,
              pool_fee: 0.3,
              pool_id:
                '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
              price_distortion: 1.258404559451805,
              price_impact: 1.258404559451805,
              dex: 'MINSWAP',
            },
          ],
          total_input_without_slippage: 505,
        }),
      ).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0,
        batcherFee: 0,
        cbor: '',
        deposits: 0,
        frontendFee: 0,
        netPrice: 0.04252918925670425,
        priceImpact: 1.258404559451805,
        splits: [
          {
            amountIn: 1,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 1130,
            expectedOutputWithoutSlippage: 1130,
            fee: 0.3,
            finalPrice: 0.041994,
            initialPrice: 0.04252918925670425,
            poolFee: 0.3,
            poolId:
              '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
            priceDistortion: 1.258404559451805,
            priceImpact: 1.258404559451805,
            protocol: 'minswap-v1',
          },
        ],
        totalFee: 0,
        totalInput: 1,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the build response to defaults (special case)', async () => {
      expect(
        transformers.build.response(
          {
            average_price: 1.234,
            communications: ['Success', 'Transaction confirmed'],
            net_price_reverse: 0,
            partner_code: 'PartnerX',
            possible_routes: {
              route1: 0.5,
              route2: 0.3,
              route3: 0.2,
            },
            splits: [
              {
                batcher_fee: 2,
                deposits: 2,
                expected_output: 1130,
                expected_output_without_slippage: 1130,
                fee: 0.3,
                final_price: 0.041994,
                initial_price: undefined,
                pool_fee: 0.3,
                pool_id:
                  '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
                price_distortion: 1.258404559451805,
                price_impact: 1.258404559451805,
                dex: 'MINSWAP',
              },
            ],
            total_input_without_slippage: 505,
          },
          true,
        ),
      ).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0,
        batcherFee: 0,
        cbor: '',
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [
          {
            amountIn: 0,
            batcherFee: 2,
            deposits: 2,
            expectedOutput: 1130,
            expectedOutputWithoutSlippage: 1130,
            fee: 0.3,
            finalPrice: 0.041994,
            initialPrice: 0,
            poolFee: 0.3,
            poolId:
              '0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.3513ef4f9724b1bdbedd1f606ed93368f0442b236f3ff201bb28532cdf2a53a9',
            priceDistortion: 1.258404559451805,
            priceImpact: 1.258404559451805,
            protocol: 'minswap-v1',
          },
        ],
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })

    test('should correctly transform the build response to defaults (special case 2)', async () => {
      expect(
        transformers.build.response({
          average_price: 1.234,
          communications: ['Success', 'Transaction confirmed'],
          net_price_reverse: 0.812,
          partner_code: 'PartnerX',
          possible_routes: {
            route1: 0.5,
            route2: 0.3,
            route3: 0.2,
          },

          total_input_without_slippage: 505,
        }),
      ).toEqual({
        aggregator: 'dexhunter',
        aggregatorFee: 0,
        batcherFee: 0,
        cbor: '',
        deposits: 0,
        frontendFee: 0,
        netPrice: 0,
        priceImpact: 0,
        splits: [],
        totalFee: 0,
        totalInput: 0,
        totalOutput: 0,
        totalOutputWithoutSlippage: 0,
      })
    })
  })
})

describe('toSwapSplit', () => {
  it('should convert input object to Swap.Split format with defaults', () => {
    const input = {} as Split
    const expectedOutput = {
      amountIn: 0,
      batcherFee: 0,
      deposits: 0,
      protocol: 'unsupported',
      expectedOutput: 0,
      expectedOutputWithoutSlippage: 0,
      fee: 0,
      finalPrice: 0,
      initialPrice: 0,
      poolFee: 0,
      poolId: '',
      priceDistortion: 0,
      priceImpact: 0,
    }

    expect(toSwapSplit(input)).toEqual(expectedOutput)
  })

  it('should correctly map input values to output structure', () => {
    const input: Split = {
      amount_in: 100,
      batcher_fee: 2,
      deposits: 50,
      dex: 'MINSWAP',
      expected_output: 95,
      expected_output_without_slippage: 98,
      fee: 1,
      final_price: 1.1,
      initial_price: 1.0,
      pool_fee: 0.3,
      pool_id: 'pool-123',
      price_distortion: 0.05,
      price_impact: 0.02,
    }

    const expectedOutput = {
      amountIn: 100,
      batcherFee: 2,
      deposits: 50,
      protocol: 'minswap-v1',
      expectedOutput: 95,
      expectedOutputWithoutSlippage: 98,
      fee: 1,
      finalPrice: 1.1,
      initialPrice: 1.0,
      poolFee: 0.3,
      poolId: 'pool-123',
      priceDistortion: 0.05,
      priceImpact: 0.02,
    }

    expect(toSwapSplit(input)).toEqual(expectedOutput)
  })
})

import {toPriceImpact} from './transformers'

describe('toPriceImpact', () => {
  it('should calculate the weighted average price impact correctly', () => {
    const splits = [
      {amount_in: 100, price_impact: 0.02},
      {amount_in: 200, price_impact: 0.03},
      {amount_in: 300, price_impact: 0.01},
    ]

    const result = toPriceImpact(splits)
    expect(result).toBeCloseTo(0.018333333, 5) // Weighted average is 0.02
  })

  it('should return 0 if total amount_in is 0', () => {
    const splits = [
      {amount_in: 0, price_impact: 0.02},
      {amount_in: 0, price_impact: 0.03},
    ]

    const result = toPriceImpact(splits)
    expect(result).toBe(0)
  })

  it('should handle missing price_impact or amount_in gracefully', () => {
    const splits = [
      {amount_in: 100, price_impact: undefined},
      {amount_in: undefined, price_impact: 0.03},
      {amount_in: 300, price_impact: 0.01},
    ]

    const result = toPriceImpact(splits)
    expect(result).toBeCloseTo(0.0075, 5) // Weighted average is (300 * 0.01) / 400
  })

  it('should return 0 for an empty array', () => {
    const splits: Array<{amount_in?: number; price_impact?: number}> = []

    const result = toPriceImpact(splits)
    expect(result).toBe(0)
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
})

describe('reverse', () => {
  it('should return the same price if reversed is false', () => {
    const result = reverse(false, 100)
    expect(result).toBe(100)
  })

  it('should return the same price if price is 0', () => {
    const result = reverse(true, 0)
    expect(result).toBe(0)
  })

  it('should return the same price if price is undefined', () => {
    const result = reverse(true, undefined as unknown as number)
    expect(result).toBe(undefined)
  })

  it('should return the reciprocal of the price if reversed is true and price is valid', () => {
    const result = reverse(true, 100)
    expect(result).toBe(1 / 100)
  })

  it('should handle edge cases for very small prices', () => {
    const result = reverse(true, 0.0001)
    expect(result).toBeCloseTo(10000, 5)
  })

  it('should handle edge cases for very large prices', () => {
    const result = reverse(true, 1000000)
    expect(result).toBeCloseTo(0.000001, 6)
  })
})
