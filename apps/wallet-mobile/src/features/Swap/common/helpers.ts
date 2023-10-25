import {createTypeGuardFromSchema, parseSafe} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {SwapApi} from '@yoroi/types/src/swap/api'
import {useMutation, UseMutationOptions} from 'react-query'
import {z} from 'zod'

import {useSelectedWallet} from '../../../SelectedWallet'
import {
  convertBech32ToHex,
  getMuesliSwapTransactionAndSigners,
} from '../../../yoroi-wallets/cardano/common/signatureUtils'
import {generateCIP30UtxoCbor} from '../../../yoroi-wallets/cardano/utils'

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
      const originalCbor = await cancelOrder({
        utxos: {collateral: collateralUtxoCBOR, order: utxo},
        address: addressHex,
      })
      const {cbor} = await getMuesliSwapTransactionAndSigners(originalCbor, wallet)
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
 * @returns The parsed metadata object or null if parsing fails or validation fails.
 */
export const parseOrderTxMetadata = (metadataJson: string): OrderTxMetadata | null => {
  const parsedMetadata = parseSafe(metadataJson)
  return isOrderTxMetadata(parsedMetadata) ? parsedMetadata : null
}

function containsOnlyValidChars(str?: string): boolean {
  const validCharsRegex = /^[a-zA-Z0]*$/
  return typeof str === 'string' && validCharsRegex.test(str)
}

export const sortTokensByName = (a: Balance.Token, b: Balance.Token) => {
  const isValidNameA = containsOnlyValidChars(a.info.name) && containsOnlyValidChars(a.info.ticker)
  const isValidNameB = containsOnlyValidChars(b.info.name) && containsOnlyValidChars(b.info.ticker)
  const nameA = isValidNameA ? a.info.name.toLowerCase() : (a.info.ticker ?? '').toLowerCase()
  const nameB = isValidNameB ? b.info.name.toLowerCase() : (b.info.ticker ?? '').toLowerCase()

  // Move invalid names to the end.
  if (!isValidNameA) {
    return 1
  }

  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}
