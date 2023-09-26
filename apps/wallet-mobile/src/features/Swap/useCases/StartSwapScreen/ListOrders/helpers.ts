import {useSwap} from '@yoroi/swap'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'
import {Buffer} from 'buffer'
import {useCallback} from 'react'
import {useQuery} from 'react-query'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {HARD_DERIVATION_START} from '../../../../../yoroi-wallets/cardano/constants/common'

type Options = {
  bech32Address: string
  orderUtxo: string
  collateralUtxo: string
}

export const useCancellationOrderFee = (options: Options) => {
  const {order} = useSwap()
  const wallet = useSelectedWallet()

  const calculateFee = useCallback(
    async (options: Options) => {
      const address = await CardanoMobile.Address.fromBech32(options.bech32Address)
      const bytes = await address.toBytes()
      const addressHex = new Buffer(bytes).toString('hex')
      const cbor = await order.cancel({
        utxos: {collateral: options.collateralUtxo, order: options.orderUtxo},
        address: addressHex,
      })
      const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
      const feeNumber = await tx.body().then((b) => b.fee())
      return Quantities.denominated(
        (await feeNumber.toStr()) as BalanceQuantity,
        wallet.primaryToken.metadata.numberOfDecimals,
      )
    },
    [order, wallet],
  )

  const result = useQuery({
    queryKey: [wallet.id, 'cancellationOrderFee', options.orderUtxo],
    queryFn: () => calculateFee(options),
    suspense: true,
  })

  if (!result.data) throw new Error('invalid state')
  return result.data
}

export const convertBech32ToHex = async (bech32Address: string) => {
  const address = await CardanoMobile.Address.fromBech32(bech32Address)
  const bytes = await address.toBytes()
  return new Buffer(bytes).toString('hex')
}

export const harden = (num: number) => HARD_DERIVATION_START + num
