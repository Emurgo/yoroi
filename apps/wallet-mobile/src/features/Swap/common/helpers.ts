import {createTypeGuardFromSchema, parseSafe} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import {SwapApi} from '@yoroi/types/src/swap/api'
import {useMutation, UseMutationOptions} from 'react-query'
import {z} from 'zod'

import {convertBech32ToHex} from '../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {generateCIP30UtxoCbor} from '../../../yoroi-wallets/cardano/utils'
import {useSelectedWallet} from '../../WalletManager/Context/SelectedWalletContext'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK} from './constants'
import {SwapPriceImpactRisk} from './types'
import {freeze} from 'immer'

export const useCancelOrderWithHw = (
  {cancelOrder}: {cancelOrder: SwapApi['cancelOrder']},
  options?: UseMutationOptions<void, Error, {utxo: string; bech32Address: string; useUSB: boolean}>,
) => {
  const wallet = useSelectedWallet()
  const mutation = useMutation({
    ...options,
    useErrorBoundary: true,
    mutationFn: async ({utxo, useUSB, bech32Address}) => {
      const collateralUtxo = wallet.getCollateralInfo()
      if (!collateralUtxo.utxo) throw new Error('Collateral not found')
      const collateralUtxoCBOR = await generateCIP30UtxoCbor(collateralUtxo.utxo)
      const addressHex = await convertBech32ToHex(bech32Address)
      const cbor = await cancelOrder({
        utxos: {collateral: collateralUtxoCBOR, order: utxo},
        address: addressHex,
      })
      await wallet.signSwapCancellationWithLedger(cbor, useUSB)
    },
  })
  return {
    ...mutation,
    cancelOrder: mutation.mutate,
  }
}

export type OrderTxMetadata = {
  sellTokenId: string
  buyTokenId: string
  sellQuantity: string
  buyQuantity: string
  provider: string
}

const OrderTxMetadataSchema: z.ZodSchema<OrderTxMetadata> = z.object({
  sellTokenId: z.string(),
  buyTokenId: z.string(),
  sellQuantity: z.string(),
  buyQuantity: z.string(),
  provider: z.string(),
})

const isOrderTxMetadata = createTypeGuardFromSchema(OrderTxMetadataSchema)

/**
 * Parses and validates a JSON metadata string, transforming it into a structure compliant with MappedRawOrder['metadata'].
 *
 * @param metadataJson - The JSON string representation of metadata.
 * @param primaryTokenId - The primary token ID to use when the metadata specifies a '.' or empty string.
 * @returns The parsed metadata object or null if parsing fails or validation fails.
 */
export const parseOrderTxMetadata = (metadataJson: string, primaryTokenId: string): OrderTxMetadata | null => {
  const parsedMetadata = parseSafe(metadataJson)
  if (!isOrderTxMetadata(parsedMetadata)) return null

  return {
    ...parsedMetadata,
    buyTokenId: normalisePrimaryTokenId(parsedMetadata.buyTokenId, primaryTokenId),
    sellTokenId: normalisePrimaryTokenId(parsedMetadata.sellTokenId, primaryTokenId),
  }
}

const swapPtTokenIds = freeze(['', '.'])
const normalisePrimaryTokenId = (tokenId: string, primaryTokenId: string) => {
  return swapPtTokenIds.includes(tokenId) ? primaryTokenId : tokenId
}

function containsOnlyValidChars(str?: string): boolean {
  const validCharsRegex = /^[a-zA-Z0 ]*$/
  return typeof str === 'string' && validCharsRegex.test(str)
}

export const sortTokensByName = (a: Balance.TokenInfo, b: Balance.TokenInfo, wallet: YoroiWallet) => {
  const isValidNameA = containsOnlyValidChars(a.name)
  const isValidNameB = containsOnlyValidChars(b.name)
  const isValidTickerA = containsOnlyValidChars(a.ticker)
  const isValidTickerB = containsOnlyValidChars(b.ticker)

  const nameA =
    a.ticker?.toLocaleLowerCase() && isValidTickerA ? a.ticker?.toLocaleLowerCase() : a.name.toLocaleLowerCase()

  const nameB =
    b.ticker?.toLocaleLowerCase() && isValidTickerB ? b.ticker?.toLocaleLowerCase() : b.name.toLocaleLowerCase()

  const isBPrimary = b.ticker === wallet.primaryTokenInfo.ticker
  if (isBPrimary) return 1

  const isAPrimary = a.ticker === wallet.primaryTokenInfo.ticker
  if (isAPrimary) return -1

  if (!isValidNameA && isValidNameB) {
    return 1
  } else if (isValidNameA && !isValidNameB) {
    return -1
  }

  return nameA.localeCompare(nameB, undefined, {sensitivity: 'base'})
}

export const getPriceImpactRisk = (priceImpact: number) => {
  if (priceImpact < PRICE_IMPACT_MODERATE_RISK || isNaN(priceImpact)) return 'none'
  if (priceImpact > PRICE_IMPACT_HIGH_RISK) return 'high'
  return 'moderate'
}

export const usePriceImpactRiskTheme = (risk: SwapPriceImpactRisk) => {
  const {theme} = useTheme()

  if (risk === 'high') {
    return {
      text: theme.color.magenta[500],
      background: theme.color.magenta[100],
    }
  } else if (risk === 'moderate') {
    return {
      text: theme.color.yellow[500],
      background: theme.color.yellow[100],
    }
  }

  return {
    text: theme.color.gray.max,
    background: theme.color.gray.min,
  }
}
