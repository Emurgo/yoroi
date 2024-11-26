import {Portfolio, Swap} from '@yoroi/types'
import {
  CancelRequest,
  CancelResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  HistoryOrdersResponse,
  OpenOrdersResponse,
  Provider,
  QuoteRequest,
  QuoteResponse,
  Split,
  TokensResponse,
} from './types'
import {MuesliswapApiConfig} from './api-maker'
import {asTokenFingerprint, asTokenName} from '../../../helpers/transformers'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
}: MuesliswapApiConfig) => {
  const asYoroiTokenId = ({
    policyId,
    name,
  }: {
    policyId: string
    name: string
  }): Portfolio.Token.Id => {
    const possibleTokenId = `${policyId}.${name}`
    // openswap is inconsistent about ADA
    // sometimes is '.', '' or 'lovelace'

    if (
      policyId === '' ||
      possibleTokenId === '.' ||
      possibleTokenId === 'lovelace.'
    )
      return primaryTokenInfo.id
    return `${policyId}.${name}`
  }

  return {
    tokens: {
      response: (res: TokensResponse): Array<Portfolio.Token.Info> =>
        res.map(({info}) => {
          const id = asYoroiTokenId(info.address)

          const isPrimary = id === primaryTokenInfo.id
          if (isPrimary) return primaryTokenInfo
          return {
            id,
            fingerprint: asTokenFingerprint({
              policyId: info.address.policyId,
              assetNameHex: info.address.name,
            }),
            name: asTokenName(info.address.name),
            decimals: info.decimalPlaces,
            description: info.description,
            originalImage: info.image ?? '',
            type: Portfolio.Token.Type.FT,
            nature: Portfolio.Token.Nature.Secondary,
            ticker: info.symbol,
            symbol: info.sign ?? '',
            status: Portfolio.Token.Status.Valid,
            application: Portfolio.Token.Application.General,
            reference: '',
            tag: '',
            website: info.website,
          }
        }),
    },
    openOrders: {
      response: (res: OpenOrdersResponse): Array<Swap.Order> =>
        res.map(
          ({dex, from_amount, from_token, to_amount, to_token, utxo}) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            dex,
            status: 'open',
            tokenIn: from_token,
            tokenOut: to_token,
            amountIn: from_amount,
            actualAmountOut: 0,
            expectedAmountOut: to_amount,
            txHash: utxo.split('#')[0],
            updateTxHash: utxo.split('#')[0],
            outputIndex: Number(utxo.split('#')[1] ?? 0),
          }),
        ),
    },
    orderHistory: {
      response: (res: HistoryOrdersResponse): Array<Swap.Order> =>
        res.map(
          ({
            fromToken,
            toToken,
            placedAt,
            finalizedAt,
            receivedAmount,
            toAmount,
            fromAmount,
            txHash,
            status,
            dex = 'muesliswap',
            outputIdx,
          }) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            dex,
            placedAt: placedAt ? placedAt * 1000 : undefined,
            lastUpdate: finalizedAt ? finalizedAt * 1000 : undefined,
            status,
            tokenIn: fromToken,
            tokenOut: toToken,
            amountIn: fromAmount,
            actualAmountOut: receivedAmount,
            expectedAmountOut: toAmount,
            txHash,
            updateTxHash: txHash,
            outputIndex: outputIdx ?? 0,
          }),
        ),
    },
    cancel: {
      request: ({order}: Swap.CancelRequest): CancelRequest => ({
        tx_hash: order.txHash ?? '',
        ouput_idx: order.outputIndex ?? 0,
      }),
      response: ({tx_cbor = ''}: CancelResponse): Swap.CancelResponse => ({
        cbor: tx_cbor,
      }),
    },
    quote: {
      request: ({
        dex,
        blacklistedDexes,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        slippage,
      }: Swap.EstimateRequest): QuoteRequest => ({
        dex: dex
          ? [dex as Provider]
          : Object.values(Provider).filter(
              (provider) => !blacklistedDexes?.includes(provider),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        buy_amount: amountOut,
        sell_amount: amountIn,
        slippage,
      }),
      response: ({
        // buy_token_decimals,
        // sell_token_decimals,
        net_price,
        splits,
        total_batcher_fee,
        total_deposit,
        total_input,
        total_lvl_attached,
        total_output,
        total_output_without_slippage,
      }: QuoteResponse): Swap.EstimateResponse => ({
        aggregatorFee: 0,
        frontendFee: 0,
        batcherFee: total_batcher_fee,
        deposits: total_deposit,
        totalFee: total_lvl_attached,
        totalInput: total_input,
        totalOutput: total_output,
        netPrice: net_price,
        totalOutputWithoutSlippage: total_output_without_slippage,
        splits: splits.map(transformSplit),
      }),
    },
    create: {
      request: ({
        dex,
        blacklistedDexes,
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
      }: Swap.CreateRequest): CreateOrderRequest => ({
        dex: dex
          ? [dex as Provider]
          : Object.values(Provider).filter(
              (provider) => !blacklistedDexes?.includes(provider),
            ),
        sell_token: tokenIn,
        buy_token: tokenOut,
        sell_amount: amountIn,
        slippage,
        user_address: address,
      }),
      response: ({
        quote: {
          // buy_token_decimals,
          // sell_token_decimals,
          net_price,
          splits,
          total_batcher_fee,
          total_deposit,
          total_input,
          total_lvl_attached,
          total_output,
          total_output_without_slippage,
        },
        tx_cbor,
      }: CreateOrderResponse): Swap.CreateResponse => ({
        cbor: tx_cbor,
        aggregator: Swap.Aggregator.Muesliswap,
        aggregatorFee: 0,
        frontendFee: 0,
        batcherFee: total_batcher_fee,
        deposits: total_deposit,
        totalFee: total_lvl_attached,
        totalInput: total_input,
        totalOutput: total_output,
        netPrice: net_price,
        totalOutputWithoutSlippage: total_output_without_slippage,
        splits: splits.map(transformSplit),
      }),
    },
  } as const
}

const transformSplit = ({
  amount_in,
  batcher_fee,
  deposit,
  dex,
  expected_output,
  expected_output_without_slippage,
  final_price,
  initial_price,
  pool_fee,
  price_impact,
  source_id,
}: Split): Swap.Split => ({
  amountIn: amount_in,
  batcherFee: batcher_fee,
  deposits: deposit,
  dex,
  expectedOutput: expected_output,
  expectedOutputWithoutSlippage: expected_output_without_slippage,
  fee: pool_fee,
  finalPrice: final_price,
  initialPrice: initial_price,
  poolFee: pool_fee,
  poolId: source_id,
  priceDistortion: price_impact,
  priceImpact: price_impact,
})
