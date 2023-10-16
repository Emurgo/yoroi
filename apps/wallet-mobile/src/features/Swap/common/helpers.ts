import {Swap} from '@yoroi/types'
import {SwapApi} from '@yoroi/types/src/swap/api'
import {useMutation, UseMutationOptions} from 'react-query'

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
  // summing fees is missing the frontend fee
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

const VALID_PROVIDERS: Record<Swap.SupportedProvider, true> = {
  minswap: true,
  wingriders: true,
  sundaeswap: true,
  muesliswap: true,
  muesliswap_v2: true,
  vyfi: true,
}

interface ExpectedMetadata {
  sellTokenId: string
  buyTokenId: string
  sellQuantity: string
  buyQuantity: string
  provider: Swap.SupportedProvider
}

/**
 * Parses and validates a JSON metadata string, transforming it into a structure compliant with MappedRawOrder['metadata'].
 *
 * @param metadataJson - The JSON string representation of metadata.
 * @returns The parsed metadata object or null if parsing fails or validation fails.
 */
export const parseMetadata = (metadataJson: string): ExpectedMetadata | null => {
  try {
    const metadata = JSON.parse(metadataJson)

    if (
      !metadata ||
      typeof metadata !== 'object' ||
      typeof metadata.sellTokenId !== 'string' ||
      typeof metadata.buyTokenId !== 'string' ||
      typeof metadata.sellQuantity !== 'string' ||
      typeof metadata.buyQuantity !== 'string' ||
      (typeof metadata.provider === 'string' && metadata.provider in VALID_PROVIDERS)
    ) {
      console.error('Invalid metadata structure.')
      return null
    }

    return metadata as ExpectedMetadata
  } catch (error) {
    console.error('JSON parsing error:', error)
    return null
  }
}
