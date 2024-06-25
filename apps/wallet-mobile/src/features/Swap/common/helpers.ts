import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {createTypeGuardFromSchema, parseSafe} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Balance, HW} from '@yoroi/types'
import {SwapApi} from '@yoroi/types/src/swap/api'
import {z} from 'zod'

import {convertBech32ToHex} from '../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {generateCIP30UtxoCbor} from '../../../yoroi-wallets/cardano/utils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK} from './constants'
import {SwapPriceImpactRisk} from './types'

export const useCancelOrderWithHw = (
  {cancelOrder}: {cancelOrder: SwapApi['cancelOrder']},
  options?: UseMutationOptions<
    void,
    Error,
    {utxo: string; bech32Address: string; useUSB: boolean; hwDeviceInfo: HW.DeviceInfo}
  >,
) => {
  const {wallet, meta} = useSelectedWallet()
  const mutation = useMutation({
    ...options,
    useErrorBoundary: true,
    mutationFn: async ({utxo, useUSB, bech32Address, hwDeviceInfo}) => {
      const collateralUtxo = wallet.getCollateralInfo()
      if (!collateralUtxo.utxo) throw new Error('Collateral not found')
      if (!meta.hwDeviceInfo) throw new Error('HW device not found')
      const collateralUtxoCBOR = await generateCIP30UtxoCbor(collateralUtxo.utxo)
      const addressHex = await convertBech32ToHex(bech32Address)
      const cbor = await cancelOrder({
        utxos: {collateral: collateralUtxoCBOR, order: utxo},
        address: addressHex,
      })
      await wallet.signSwapCancellationWithLedger(cbor, useUSB, hwDeviceInfo)
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
 * @returns The parsed metadata object or null if parsing fails or validation fails.
 */
export const parseOrderTxMetadata = (metadataJson: string): OrderTxMetadata | null => {
  const parsedMetadata = parseSafe(metadataJson)
  return isOrderTxMetadata(parsedMetadata) ? parsedMetadata : null
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
  const {color} = useTheme()

  if (risk === 'high') {
    return {
      text: color.sys_magenta_c500,
      background: color.sys_magenta_c100,
    }
  } else if (risk === 'moderate') {
    return {
      text: color.sys_orange_c500,
      background: color.sys_orange_c100,
    }
  }

  return {
    text: color.gray_cmax,
    background: color.gray_cmin,
  }
}
