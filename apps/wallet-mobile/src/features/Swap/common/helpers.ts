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

  const tokenId = createOrder.amounts.sell.tokenId
  if (tokenId != null && createOrder.amounts.sell.quantity !== undefined) {
    if (tokenId === wallet.primaryTokenInfo.id) {
      amountEntry[tokenId] = Quantities.sum([
        createOrder.selectedPool.deposit.quantity,
        createOrder.selectedPool.batcherFee.quantity,
        createOrder.amounts.sell.quantity,
      ])
    } else {
      amountEntry[''] = createOrder.selectedPool.deposit.quantity
      amountEntry[tokenId] = createOrder.amounts.sell.quantity
    }
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
