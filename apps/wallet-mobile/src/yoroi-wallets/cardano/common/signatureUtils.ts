import {Bip32PublicKey, PrivateKey} from '@emurgo/cross-csl-core'
import blake2b from 'blake2b'

import {CardanoMobile} from '../../wallets'
import {Addressing, RemoteUnspentOutput} from '@emurgo/yoroi-lib'

export const signRawTransaction = async (cbor: string, pKeys: PrivateKey[]): Promise<Uint8Array> => {
  const fixedTx = await CardanoMobile.FixedTransaction.fromHex(cbor)
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

export const createSignedLedgerSwapCancellationTx = async (
  cbor: string,
  witnesses: Array<{path: number[]; witnessSignatureHex: string}>,
  purpose: number,
  publicKeyHex: string,
): Promise<Uint8Array> => {
  console.log('trying to get fixed tx')
  const fixedTx = await CardanoMobile.FixedTransaction.fromHex(cbor)
  if (!fixedTx) throw new Error('invalid tx hex')
  const rawBody = await fixedTx.rawBody()
  const txHash = await CardanoMobile.TransactionHash.fromBytes(blake2b(32).update(rawBody).digest('binary'))
  if (!txHash) throw new Error('invalid tx hex, could not generate tx hash')

  const witSet = await fixedTx.witnessSet()
  const vkeys = await CardanoMobile.Vkeywitnesses.new()

  const addressing = {
    path: [
      purpose,
      2147485463, // CARDANO
      2147483648,
    ],
    startLevel: 1,
  }

  const key = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
  const keyLevel = addressing.startLevel + addressing.path.length - 1

  for (let i = 0; i < witnesses.length; i++) {
    console.log('getting witness', witnesses[i].path)
    const addressKey = await derivePublicByAddressing(
      {startLevel: 1, path: witnesses[i].path},
      {
        level: keyLevel,
        key,
      },
    )
    const witness = await CardanoMobile.Vkeywitness.new(
      await CardanoMobile.Vkey.new(await addressKey.toRawKey()),
      await CardanoMobile.Ed25519Signature.fromBytes(Buffer.from(witnesses[i].witnessSignatureHex, 'hex')),
    )
    if (!witness) throw new Error('invalid tx hex, could not generate vkey witness')
    await vkeys.add(witness)
  }

  await witSet.setVkeys(vkeys)
  await fixedTx.setWitnessSet(await witSet.toBytes())

  return fixedTx.toBytes()
}

export const derivePublicByAddressing = async (
  addressing: Addressing,
  startingFrom: {
    key: Bip32PublicKey
    level: number
  },
) => {
  if (startingFrom.level + 1 < addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }

  let derivedKey = startingFrom.key

  for (let i = startingFrom.level - addressing.startLevel + 1; i < addressing.path.length; i++) {
    derivedKey = await derivedKey.derive(addressing.path[i])
  }

  return derivedKey
}
