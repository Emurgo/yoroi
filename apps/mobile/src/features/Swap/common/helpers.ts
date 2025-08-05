import {parseSafe} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {z} from 'zod'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK} from './constants'
import {SwapPriceImpactRisk} from './types'

// Temporary fix for missing normalisePtId - using identity function
const normalisePtId = (id: string) => id

type OrderTxMetadata = {
  sellTokenId: string
  buyTokenId: string
  sellQuantity: string
  buyQuantity: string
  provider: string
}

const OrderTxMetadataSchema = z.object({
  sellTokenId: z.string(),
  buyTokenId: z.string(),
  sellQuantity: z.string(),
  buyQuantity: z.string(),
  provider: z.string(),
})

const isOrderTxMetadata = (data: unknown): data is OrderTxMetadata => {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.sellTokenId === 'string' &&
    typeof obj.buyTokenId === 'string' &&
    typeof obj.sellQuantity === 'string' &&
    typeof obj.buyQuantity === 'string' &&
    typeof obj.provider === 'string'
  )
}

/**
 * Parses and validates a JSON metadata string, transforming it into a structure compliant with MappedRawOrder['metadata'].
 *
 * @param metadataJson - The JSON string representation of metadata.
 * @returns The parsed metadata object or null if parsing fails or validation fails.
 */
export const parseOrderTxMetadata = (
  metadataJson: string,
): OrderTxMetadata | null => {
  const parsedMetadata = parseSafe(metadataJson)
  if (!isOrderTxMetadata(parsedMetadata)) return null

  return {
    ...parsedMetadata,
    buyTokenId: normalisePtId(parsedMetadata.buyTokenId),
    sellTokenId: normalisePtId(parsedMetadata.sellTokenId),
  }
}

export const getPriceImpactRisk = (priceImpact: number) => {
  if (priceImpact < PRICE_IMPACT_MODERATE_RISK || isNaN(priceImpact))
    return 'none'
  if (priceImpact > PRICE_IMPACT_HIGH_RISK) return 'high'
  return 'moderate'
}

export const usePriceImpactRiskTheme = (risk: SwapPriceImpactRisk) => {
  const {palette: p} = useTheme()

  if (risk === 'high') {
    return {
      text: p.sys_magenta_500,
      background: p.sys_magenta_100,
    }
  }

  if (risk === 'moderate') {
    return {
      text: p.sys_orange_500,
      background: p.sys_orange_100,
    }
  }

  return {
    text: p.gray_max,
    background: p.gray_min,
  }
}
