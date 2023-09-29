import {PrivateKey} from '@emurgo/cross-csl-core'
import blake2b from 'blake2b'

import {CardanoMobile} from '../../wallets'

export const signRawTransaction = async (txHex: string, pKeys: PrivateKey[]): Promise<Uint8Array> => {
  const fixedTx = await CardanoMobile.FixedTransaction.fromHex(txHex)
  if (!fixedTx) throw new Error('invalid tx hex')
  const rawBody = await fixedTx.rawBody()
  const txHash = await CardanoMobile.TransactionHash.fromBytes(blake2b(32).update(rawBody).digest('binary'))
  if (!txHash) throw new Error('invalid tx hex, could not generate tx hash')

  const witSet = await fixedTx.witnessSet()
  const vkeys = await CardanoMobile.Vkeywitnesses.new()

  for (let i = 0; i < pKeys.length; i++) {
    const vkeyWit = await CardanoMobile.makeVkeyWitness(txHash, pKeys[i])
    if (!vkeyWit) throw new Error('invalid tx hex, could not generate vkey witness')
    await vkeys.add(vkeyWit)
  }

  await witSet.setVkeys(vkeys)
  await fixedTx.setWitnessSet(await witSet.toBytes())

  return fixedTx.toBytes()
}
