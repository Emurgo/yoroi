import {SwapApi} from '@yoroi/types/lib/swap/api'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'
import {Buffer} from 'buffer'

import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'

type Options = {
  bech32Address: string
  orderUtxo: string
  collateralUtxo: string
}

export const getCancellationOrderFee = async (
  wallet: YoroiWallet,
  cancelOrder: SwapApi['cancelOrder'],
  options: Options,
) => {
  const address = await CardanoMobile.Address.fromBech32(options.bech32Address)
  const bytes = await address.toBytes()
  const addressHex = Buffer.from(bytes).toString('hex')
  const cbor = await cancelOrder({
    utxos: {collateral: options.collateralUtxo, order: options.orderUtxo},
    address: addressHex,
  })
  if (!cbor) throw new Error(`Failed to get CBOR from REST API for address ${options.bech32Address}`)
  const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
  const feeNumber = await tx.body().then((b) => b.fee())
  return Quantities.denominated(
    (await feeNumber.toStr()) as BalanceQuantity,
    wallet.primaryToken.metadata.numberOfDecimals,
  )
}
