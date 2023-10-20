import {createTypeGuardFromSchema, isString, parseSafe} from '@yoroi/common'
import {SwapState} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import {SwapApi} from '@yoroi/types/src/swap/api'
import config from 'react-native-config'
import {useMutation, UseMutationOptions} from 'react-query'
import {z} from 'zod'

import {useSelectedWallet} from '../../../SelectedWallet'
import {
  convertBech32ToHex,
  getMuesliSwapTransactionAndSigners,
} from '../../../yoroi-wallets/cardano/common/signatureUtils'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {generateCIP30UtxoCbor} from '../../../yoroi-wallets/cardano/utils'
import {YoroiEntry} from '../../../yoroi-wallets/types'
import {Quantities} from '../../../yoroi-wallets/utils'

export const createYoroiEntry = (
  createOrder: Swap.CreateOrderData,
  address: string,
  wallet: YoroiWallet,
): YoroiEntry => {
  const amountEntry = {}

  const sellTokenId = createOrder.amounts.sell.tokenId
  // TODO Frontend Fee is not added. Once will be defined needs to be added here
  if (sellTokenId === wallet.primaryTokenInfo.id) {
    amountEntry[sellTokenId] = Quantities.sum([
      createOrder.selectedPool.deposit.quantity,
      createOrder.selectedPool.batcherFee.quantity,
      createOrder.amounts.sell.quantity,
    ])
  } else {
    amountEntry[wallet.primaryTokenInfo.id] = Quantities.sum([
      createOrder.selectedPool.deposit.quantity,
      createOrder.selectedPool.batcherFee.quantity,
    ])
    amountEntry[sellTokenId] = createOrder.amounts.sell.quantity
  }

  return {
    address: address,
    amounts: amountEntry,
  }
}

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

export const getFrontendFeeEntry = (
  calculation: SwapState['orderData']['selectedPoolCalculation'],
): YoroiEntry | null => {
  if (!calculation) return null

  const {quantity, tokenId} = calculation.cost.frontendFeeInfo.fee
  const isFrontendFeeDefined = !Quantities.isZero(quantity)
  if (!isString(config['FINTECH_WALLET']) || !isFrontendFeeDefined) return null

  return {
    address: config['FINTECH_WALLET'],
    amounts: {[tokenId]: quantity},
  }
}
