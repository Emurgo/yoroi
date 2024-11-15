import {App, Portfolio, Swap} from '@yoroi/types'
import {Pools} from './types'

export const estimateCalculation = (
  pools: Pools,
  estimate: Swap.EstimateRequest,
  primaryTokenInfo: Portfolio.Token.Info,
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>,
  lpTokenHeld?: number,
): Swap.EstimateResponse => {
  const totalInSupply = pools.reduce(
    (total, pool) => total + pool.tokenInSupply,
    0,
  )
  const totalOutSupply = pools.reduce(
    (total, pool) => total + pool.tokenOutSupply,
    0,
  )

  const marketPrice = totalInSupply / totalOutSupply

  const availableSplits: Array<Swap.Split> = pools
    .map((pool) => {
      if (pool.tokenInSupply <= 0 || pool.tokenOutSupply <= 0) return null

      const amountIn =
        estimate.amountIn ??
        fromBaseUnits(
          getAmountIn({
            tokenInSupply: pool.tokenInSupply,
            tokenOutSupply: pool.tokenOutSupply,
            fee: pool.fee,
            amountOut: toBaseUnits(estimate.amountOut, pool.tokenOutDecimals),
            wantedPrice: estimate.wantedPrice,
          }),
          pool.tokenInDecimals,
        )

      const amountOut =
        estimate.amountOut ??
        fromBaseUnits(
          getAmountOut({
            tokenInSupply: pool.tokenInSupply,
            tokenOutSupply: pool.tokenOutSupply,
            fee: pool.fee,
            amountIn: toBaseUnits(estimate.amountIn, pool.tokenInDecimals),
            wantedPrice: estimate.wantedPrice,
          }),
          pool.tokenOutDecimals,
        )

      const amountOutWithSlippage = fromBaseUnits(
        withSlippage(
          toBaseUnits(amountOut, pool.tokenOutDecimals),
          estimate.wantedPrice === undefined ? estimate.slippage : 0,
        ),
        pool.tokenOutDecimals,
      )

      // No multiple splits supported yet, so if there's no supply for 1, discard pool
      if (amountOutWithSlippage > pool.tokenOutSupply) return null

      const initialPrice = pool.tokenInSupply / pool.tokenOutSupply

      const finalPrice =
        (pool.tokenInSupply + amountIn) / (pool.tokenOutSupply - amountOut)

      const priceImpact = 100 * ((finalPrice - initialPrice) / initialPrice)

      const priceDistortion = 100 * ((finalPrice - marketPrice) / marketPrice)

      const batcherFee = fromBaseUnits(
        pool.batcherFee,
        primaryTokenInfo.decimals,
      )

      const deposits = fromBaseUnits(pool.deposit, primaryTokenInfo.decimals)

      return {
        amountIn,
        batcherFee,
        deposits,
        dex: pool.provider,
        expectedOutput: amountOutWithSlippage,
        expectedOutputWithoutSlippage: amountOut,
        fee: deposits + batcherFee,
        finalPrice,
        initialPrice,
        poolFee: pool.fee,
        poolId: pool.poolId,
        priceDistortion,
        priceImpact,
      }
    })
    .filter((split) => split !== null)

  if (availableSplits.length === 0) throw new Error()

  const bestSplit = availableSplits
    .sort((a, b) => a.priceDistortion - b.priceDistortion)
    .reduce((best, split) => {
      if (estimate.amountOut === undefined) {
        return (best?.expectedOutput ?? 0) > split.expectedOutput ? best : split
      }
      return (best?.amountIn ?? Infinity) < split.amountIn ? best : split
    }, availableSplits[0]!)

  const netPrice =
    estimate.wantedPrice ??
    bestSplit.amountIn / bestSplit.expectedOutputWithoutSlippage

  const pool = pools.find(({poolId}) => bestSplit.poolId === poolId)
  const ptAmount = Math.max(
    (pool?.tokenInPtPrice ?? 0) * bestSplit.amountIn,
    (pool?.tokenOutPtPrice ?? 0) * bestSplit.expectedOutput,
  )

  // TODO check units
  const frontendFee = getFrontendFee({
    ptAmount,
    frontendFeeTiers,
    lpTokenHeld,
  })

  const aggregatorFee = 0

  return {
    splits: [bestSplit],
    batcherFee: bestSplit.batcherFee,
    deposits: bestSplit.deposits,
    aggregatorFee,
    frontendFee,
    netPrice,
    totalFee: bestSplit.fee + aggregatorFee + frontendFee,
    totalOutput: bestSplit.expectedOutput,
    totalOutputWithoutSlippage:
      estimate.amountIn === undefined
        ? bestSplit.expectedOutputWithoutSlippage
        : undefined,
    totalInput:
      estimate.amountIn === undefined ? bestSplit.amountIn : undefined,
  }
}

const getAmountIn = ({
  tokenInSupply,
  tokenOutSupply,
  fee,
  amountOut,
  wantedPrice,
}: {
  tokenInSupply: number
  tokenOutSupply: number
  fee: number
  amountOut: number
  wantedPrice?: number
}): number => {
  if (amountOut <= 0) return 0

  if (wantedPrice !== undefined) return Math.ceil(amountOut * wantedPrice)

  const feeFactor = BigInt(100 * 1000) - BigInt(fee * 1000)

  const inSupply = BigInt(tokenInSupply)

  const outSupply = BigInt(tokenOutSupply)

  const finalOutSupply =
    outSupply -
    (outSupply > amountOut ? BigInt(amountOut) : outSupply - BigInt(1))

  return Number(
    ceilDivision(
      (ceilDivision(outSupply * inSupply + finalOutSupply, finalOutSupply) -
        inSupply) *
        BigInt(100 * 1000),
      feeFactor,
    ),
  )
}

const getAmountOut = ({
  tokenInSupply,
  tokenOutSupply,
  fee,
  amountIn,
  wantedPrice,
}: {
  tokenInSupply: number
  tokenOutSupply: number
  fee: number
  amountIn: number
  wantedPrice?: number
}): number => {
  if (amountIn <= 0) return 0

  if (wantedPrice !== undefined) return Math.floor(amountIn / wantedPrice)

  const bigAmountIn = BigInt(amountIn)

  const feeFactor = ceilDivision(
    BigInt(fee * 1000) * bigAmountIn,
    BigInt(100 * 1000),
  )

  const inSupply = BigInt(tokenInSupply)

  const outSupply = BigInt(tokenOutSupply)

  return Number(
    outSupply -
      ceilDivision(outSupply * inSupply, outSupply + bigAmountIn - feeFactor),
  )
}

export const withSlippage = (amount: number, slippage: number) => {
  const initialAmount = BigInt(amount)

  const slippageAmount = ceilDivision(
    BigInt(Math.floor(10_000 * slippage)) * initialAmount,
    BigInt(100 * 10_000),
  )

  return Number(initialAmount - slippageAmount)
}

export const getFrontendFee = ({
  lpTokenHeld,
  ptAmount,
  frontendFeeTiers,
}: {
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  lpTokenHeld?: number
  ptAmount: number
}): number => {
  // identify the discount
  const discountTier = frontendFeeTiers.find(
    (tier) =>
      (lpTokenHeld ?? 0) >= Number(tier.secondaryTokenBalanceThreshold) &&
      ptAmount >= Number(tier.primaryTokenValueThreshold),
  )

  return (
    ptAmount * (discountTier?.variableFeeMultiplier ?? 0) +
    (Number(discountTier?.fixedFee) ?? 0)
  )
}

const ceilDivision = (dividend: bigint, divisor: bigint): bigint => {
  if (dividend <= 0n || divisor <= 0n) return 0n
  const adjustedDivisor = divisor - 1n

  return (dividend + adjustedDivisor) / divisor
}

const toBaseUnits = (amount: number, decimals: number) =>
  Number((amount * Math.pow(10, decimals)).toFixed(0))

const fromBaseUnits = (amount: number, decimals: number) =>
  Number((amount * Math.pow(10, -1 * decimals)).toFixed(decimals))
