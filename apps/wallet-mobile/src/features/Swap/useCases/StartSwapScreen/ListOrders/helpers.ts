import {BalanceQuantity} from '@yoroi/types/src/balance/token'
import {Buffer} from 'buffer'

import {Quantities} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'

type Options = {
  bech32Address: string
  orderUtxo: string
  collateralUtxo: string
}

export const getCancellationOrderFee = async (wallet, cancelOrder, options: Options) => {
  const address = await CardanoMobile.Address.fromBech32(options.bech32Address)
  const bytes = await address.toBytes()
  const addressHex = new Buffer(bytes).toString('hex')
  const cbor = await cancelOrder({
    utxos: {collateral: options.collateralUtxo, order: options.orderUtxo},
    address: addressHex,
  })
  const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
  const feeNumber = await tx.body().then((b) => b.fee())
  return Quantities.denominated(
    (await feeNumber.toStr()) as BalanceQuantity,
    wallet.primaryToken.metadata.numberOfDecimals,
  )
}
