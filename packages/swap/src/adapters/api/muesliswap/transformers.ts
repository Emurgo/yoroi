import {Portfolio, Swap} from '@yoroi/types'
import {
  CancelRequest,
  CancelResponse,
  ConstructSwapDatumRequest,
  ConstructSwapDatumResponse,
  LiquidityPoolRequest,
  LiquidityPoolResponse,
  OrdersAggregatorResponse,
  OrdersHistoryResponse,
  Pools,
  Provider,
  TokensResponse,
} from './types'
import {MuesliswapApiConfig} from './api-maker'
import {asTokenFingerprint, asTokenName} from '../../../helpers/transformers'

export const transformersMaker = ({
  primaryTokenInfo,
  address,
  addressHex,
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
    ordersAggregator: {
      response: (res: OrdersAggregatorResponse): Array<Swap.Order> =>
        res.map(
          ({
            provider,
            placedAt,
            finalizedAt,
            status,
            fromToken: {address: fromToken},
            toToken: {address: toToken},
            fromAmount,
            toAmount,
            txHash,
            outputIdx,
          }) => ({
            aggregator: Swap.Aggregator.Muesliswap,
            dex: provider,
            placedAt: placedAt ? placedAt * 1000 : undefined,
            lastUpdate: finalizedAt ? finalizedAt * 1000 : undefined,
            status,
            tokenIn: asYoroiTokenId(fromToken),
            tokenOut: asYoroiTokenId(toToken),
            amountIn: Number(fromAmount),
            actualAmountOut: 0,
            expectedAmountOut: Number(toAmount),
            txHash,
            updateTxHash: txHash,
            outputIndex: outputIdx ?? 0,
          }),
        ),
    },
    ordersHistory: {
      response: (res: OrdersHistoryResponse): Array<Swap.Order> =>
        res.map(
          ({
            fromToken: {address: fromToken},
            toToken: {address: toToken},
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
            tokenIn: asYoroiTokenId(fromToken),
            tokenOut: asYoroiTokenId(toToken),
            amountIn: Number(fromAmount),
            actualAmountOut: Number(receivedAmount),
            expectedAmountOut: Number(toAmount),
            txHash,
            updateTxHash: txHash,
            outputIndex: outputIdx ?? 0,
          }),
        ),
    },
    cancel: {
      request: ({order, collateral}: Swap.CancelRequest): CancelRequest => ({
        wallet: addressHex,
        utxo: `${order.txHash ?? ''}#${order.outputIndex}`,
        collateralUtxo: collateral ?? '',
      }),
      response: ({cbor = ''}: CancelResponse): Swap.CancelResponse => ({
        cbor,
      }),
    },
    liquidityPools: {
      request: ({
        dex,
        blacklistedDexes,
        tokenIn,
        tokenOut,
      }: Swap.EstimateRequest): LiquidityPoolRequest => ({
        'only-verified': 'y',
        'providers': dex
          ? dex
          : Object.values(Provider)
              .filter((provider) => !blacklistedDexes?.includes(provider))
              .join(),
        'token-a': tokenIn,
        'token-b': tokenOut,
      }),
      response: (
        pools: LiquidityPoolResponse,
        {tokenIn, tokenOut}: Swap.EstimateRequest,
      ): Pools =>
        pools
          .map(
            ({
              feeToken,
              batcherFee,
              poolFee,
              lvlDeposit,
              lpToken,
              tokenA,
              tokenB,
              provider,
              poolId,
            }) => {
              // Don't support pools with fees different than Ada yet
              if (primaryTokenInfo.id !== asYoroiTokenId(feeToken.address))
                return null

              const A = {
                price: tokenA.priceAda,
                id: asYoroiTokenId(tokenA.address),
                amount: Number(tokenA.amount),
                decimals: tokenA.decimalPlaces,
              }
              const B = {
                price: tokenB.priceAda,
                id: asYoroiTokenId(tokenB.address),
                amount: Number(tokenB.amount),
                decimals: tokenB.decimalPlaces,
              }
              const [input, output] = tokenIn === A.id ? [A, B] : [B, A]

              if (input.id !== tokenIn || input.id !== tokenOut) return null

              return {
                tokenIn: input.id,
                tokenOut: output.id,
                tokenInDecimals: input.decimals,
                tokenOutDecimals: output.decimals,
                tokenInSupply: Number(input.amount),
                tokenOutSupply: Number(output.amount),
                tokenInPtPrice: input.price,
                tokenOutPtPrice: output.price,
                deposit: Number(lvlDeposit),
                lpTokenId: lpToken.address
                  ? asYoroiTokenId(lpToken.address)
                  : undefined,
                batcherFee: Number(batcherFee),
                fee: Number(poolFee),
                poolId,
                provider,
              }
            },
          )
          .filter((pool) => pool !== null),
    },
    constructSwapDatum: {
      request: (
        {tokenIn, tokenOut}: Swap.CreateRequest,
        {dex, poolId, amountIn, expectedOutput}: Swap.Split,
      ): ConstructSwapDatumRequest => {
        const [sellTokenPolicyID, sellTokenNameHex] = tokenIn.split('.') as [
          string,
          string,
        ]
        const [buyTokenPolicyID, buyTokenNameHex] = tokenOut.split('.') as [
          string,
          string,
        ]

        return {
          walletAddr: address,
          protocol: dex as Provider,
          poolId,
          sellTokenPolicyID,
          sellTokenNameHex,
          sellAmount: amountIn.toString(),
          buyTokenPolicyID,
          buyTokenNameHex,
          buyAmount: expectedOutput.toString(),
        }
      },
      response: (
        res: ConstructSwapDatumResponse,
        estimate: Swap.EstimateResponse,
      ): Swap.CreateResponse => {
        const cbor: string = swapCreateCbor(res)

        return {
          cbor,
          ...estimate,
          totalInput: estimate.totalInput ?? estimate.splits[0]?.amountIn ?? 0,
        }
      },
    },
  } as const
}

// TODO: Transform contractAddress, datum, hash into cbor, code in StartSwapOrderScreen.tsx
const swapCreateCbor = ({
  address: contractAddress,
  datum,
  hash,
}: ConstructSwapDatumResponse) => `${contractAddress}${datum}${hash}`
