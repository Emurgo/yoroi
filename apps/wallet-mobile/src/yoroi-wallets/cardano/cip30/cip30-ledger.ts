import {Bip32PublicKey, BootstrapWitness, Transaction, Vkeywitness, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {has_transaction_set_tag, TransactionSetsState} from '@emurgo/csl-mobile-bridge'
import {Addressing, Bip44DerivationLevels, hashTransaction} from '@emurgo/yoroi-lib'
import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {HW, Wallet} from '@yoroi/types'

import {toLedgerSignRequest} from '../../../features/Discover/common/ledger'
import {cardanoConfig} from '../../../features/WalletManager/common/adapters/cardano/cardano-config'
import type {RawUtxo} from '../../types/other'
import {assertHasAllSigners} from '../common/signatureUtils'
import {signTxWithLedger} from '../hw/hw'
import {CardanoTypes, YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'
import {SignedTransactionData} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {YoroiUnsignedTx} from '../../types/yoroi'

export const cip30LedgerExtensionMaker = (wallet: YoroiWallet, meta: Wallet.Meta) => {
  return new CIP30LedgerExtension(wallet, meta)
}

class CIP30LedgerExtension {
  constructor(private wallet: YoroiWallet, private meta: Wallet.Meta) {}

  async signTx(cbor: string, partial: boolean, hwDeviceInfo: HW.DeviceInfo, useUSB: boolean): Promise<Transaction> {
    const {csl, release} = wrappedCsl()
    try {
      const tx = await csl.Transaction.fromHex(cbor)
      if (!partial) await assertHasAllSigners(cbor, this.wallet, this.meta)
      const txBody = await tx.body()

      const transactionSetTag = await has_transaction_set_tag(await tx.toBytes())

      if (transactionSetTag === TransactionSetsState.MixedSets) {
        throw new Error('CIP30LedgerExtension.signTx: Mixed transaction sets are not supported when using a HW wallet')
      }

      const payload = await toLedgerSignRequest(
        csl,
        txBody,
        this.wallet.networkManager.chainId,
        this.wallet.networkManager.protocolMagic,
        await getHexAddressingMap(csl, this.wallet),
        await getHexAddressingMap(csl, this.wallet),
        getAddressedUtxos(this.wallet),
        await txBody.toBytes(),
        [],
      )

      const signedLedgerTx = await signTxWithLedger(payload, hwDeviceInfo, useUSB)
      const implementationConfig = cardanoConfig.implementations[this.meta.implementation]
      const bytes = await createSignedLedgerTxFromCbor(
        csl,
        cbor,
        signedLedgerTx,
        implementationConfig.derivations.base.harden.purpose,
        this.wallet.publicKeyHex,
        getAddressedUtxos(this.wallet),
      )
      return csl.Transaction.fromBytes(bytes)
    } finally {
      release()
    }
  }
}

const createSignedLedgerTxFromCbor = async (
  wasm: WasmModuleProxy,
  cbor: string,
  signedData: SignedTransactionData,
  purpose: number,
  publicKeyHex: string,
  senderUtxos: YoroiUnsignedTx['unsignedTx']['senderUtxos'],
): Promise<Uint8Array> => {
  const key = await wasm.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
  const fixedTx = await wasm.FixedTransaction.fromHex(cbor)
  if (!fixedTx) throw new Error('invalid tx hex')

  const addressing = {
    path: [
      purpose,
      2147485463, // CARDANO
      2147483648,
    ],
    startLevel: 1,
  }

  const isSameArray = (array1: Array<number>, array2: Array<number>) =>
    array1.length === array2.length && array1.every((value, index) => value === array2[index])

  const findWitness = (path: Array<number>) => {
    for (const witness of signedData.witnesses) {
      if (isSameArray(witness.path, path)) {
        return witness.witnessSignatureHex
      }
    }

    throw new Error(`buildSignedTransaction no witness for ${JSON.stringify(path)}`)
  }
  const keyLevel = addressing.startLevel + addressing.path.length - 1
  const witSet = await fixedTx.witnessSet()
  const bootstrapWitnesses: Array<BootstrapWitness> = []
  const vkeys: Array<Vkeywitness> = []

  const seenVKeyWit = new Set<string>()
  const seenBootstrapWit = new Set<string>()

  for (const utxo of senderUtxos) {
    verifyFromBip44Root(utxo.addressing)
    const witness = findWitness(utxo.addressing.path)
    const addressKey = await derivePublicByAddressing(utxo.addressing, {
      level: keyLevel,
      key,
    })

    if (await wasm.ByronAddress.isValid(utxo.receiver)) {
      const byronAddr = await wasm.ByronAddress.fromBase58(utxo.receiver)
      const bootstrapWit = await wasm.BootstrapWitness.new(
        await wasm.Vkey.new(await addressKey.toRawKey()),
        await wasm.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
        await addressKey.chaincode(),
        await byronAddr.attributes(),
      )
      const asString = Buffer.from(await bootstrapWit.toBytes()).toString('hex')

      if (seenBootstrapWit.has(asString)) {
        continue
      }

      seenBootstrapWit.add(asString)
      bootstrapWitnesses.push(bootstrapWit)
      continue
    }

    const vkeyWit = await wasm.Vkeywitness.new(
      await wasm.Vkey.new(await addressKey.toRawKey()),
      await wasm.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
    )
    const asString = Buffer.from(await vkeyWit.toBytes()).toString('hex')

    if (seenVKeyWit.has(asString)) {
      continue
    }

    seenVKeyWit.add(asString)
    vkeys.push(vkeyWit)
  }

  // add any staking key needed
  for (const witness of signedData.witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    }

    if (witness.path[3] === 2) {
      const stakingKey = await derivePublicByAddressing(addressing, {
        level: keyLevel,
        key,
      })
      const vkeyWit = await wasm.Vkeywitness.new(
        await wasm.Vkey.new(await stakingKey.toRawKey()),
        await wasm.Ed25519Signature.fromBytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
      )
      const asString = Buffer.from(await vkeyWit.toBytes()).toString('hex')

      if (seenVKeyWit.has(asString)) {
        continue
      }

      seenVKeyWit.add(asString)
      vkeys.push(vkeyWit)
    }
  }

  if (bootstrapWitnesses.length > 0) {
    const bootstrapWitWasm = await wasm.BootstrapWitnesses.new()

    for (const bootstrapWit of bootstrapWitnesses) {
      await bootstrapWitWasm.add(bootstrapWit)
    }

    await witSet.setBootstraps(bootstrapWitWasm)
  }

  const originalWitSet = await fixedTx.witnessSet()
  const originalVkeys = await originalWitSet.vkeys()
  const vkeyWitWasm = originalVkeys || (await wasm.Vkeywitnesses.new())

  for (const vkey of vkeys) {
    await vkeyWitWasm.add(vkey)
  }

  await witSet.setVkeys(vkeyWitWasm)

  const signedTx = await wasm.Transaction.new(await fixedTx.body(), witSet, await fixedTx.auxiliaryData())

  const id = await (await hashTransaction(wasm, await signedTx.toBytes())).toHex()
  const ledgerTxHashHex = signedData.txHashHex

  if (id !== ledgerTxHashHex) {
    throw new Error(`buildLedgerSignedTx: TxId mismatch. Ledger: ${ledgerTxHashHex} Reconstructed: ${id}`)
  }

  return signedTx.toBytes()
}

export const verifyFromBip44Root = (addressing: Addressing): void => {
  const accountPosition = addressing.startLevel
  if (accountPosition !== Bip44DerivationLevels.PURPOSE.level) {
    throw new Error(`verifyFromBip44Root addressing does not start from root`)
  }
  const lastLevelSpecified = addressing.startLevel + addressing.path.length - 1
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`verifyFromBip44Root incorrect addressing size`)
  }
}

const derivePublicByAddressing = async (
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

const getHexAddressingMap = async (csl: WasmModuleProxy, wallet: YoroiWallet) => {
  const addressedUtxos = wallet.utxos.map(async (utxo: RawUtxo) => {
    const addressing = wallet.getAddressing(utxo.receiver)
    const hexAddress = await normalizeToAddress(csl, utxo.receiver).then((a) => a?.toHex())

    return {addressing, hexAddress}
  })

  const addressing = await Promise.all(addressedUtxos)
  return addressing.reduce<{[addressHex: string]: Array<number>}>((acc, curr) => {
    if (!curr.hexAddress) return acc
    acc[curr.hexAddress] = curr.addressing.path
    return acc
  }, {})
}

const getAddressedUtxos = (wallet: YoroiWallet) => {
  return wallet.allUtxos.map((utxo: RawUtxo): CardanoTypes.CardanoAddressedUtxo => {
    const addressing = wallet.getAddressing(utxo.receiver)

    return {
      addressing,
      txIndex: utxo.tx_index,
      txHash: utxo.tx_hash,
      amount: utxo.amount,
      receiver: utxo.receiver,
      utxoId: utxo.utxo_id,
      assets: utxo.assets,
    }
  })
}
