// Ledger signing functions
// Functions for building signed transactions from Ledger signatures
import {
  SignTransactionResponse,
  SignedTransactionData,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {
  Bip32PublicKey,
  BootstrapWitness,
  PrivateKey,
  Vkeywitness,
} from '@emurgo/cross-csl-core'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {Addressing} from '../types'
import {hashTransaction} from '../utils/transactions'
import {verifyFromBip44Root} from './transform'

/**
 * Derive public key by addressing
 */
function derivePublicByAddressing(
  addressing: Addressing,
  startingFrom: {
    key: Bip32PublicKey
    level: number
  },
): Bip32PublicKey {
  if (startingFrom.level + 1 < addressing.startLevel) {
    throw new Error('derivePublicByAddressing: keyLevel < startLevel')
  }

  let derivedKey = startingFrom.key

  for (
    let i = startingFrom.level - addressing.startLevel + 1;
    i < addressing.path.length;
    i++
  ) {
    const pathIndex = addressing.path[i]
    if (pathIndex === undefined) {
      throw new Error('Invalid addressing path')
    }
    derivedKey = derivedKey.derive(pathIndex)
  }

  return derivedKey
}

/**
 * Build signed transaction from Ledger signature response
 */
export async function buildLedgerSignedTx(
  unsignedTx: {
    senderUtxos: Array<{
      receiver: string
      addressing: Addressing
    }>
    txBuilder: {
      build(): unknown
      setAuxiliaryData(data: unknown): void
    }
    auxiliaryData?: {
      hasValue(): boolean
    } | null
    catalystRegistrationData?: {
      votingPublicKeyHex: string
      stakingPublicKeyHex: string
      paymentAddress: string
      nonce: number
    }
  },
  signedLedgerTx: SignTransactionResponse,
  purpose: number,
  publicKeyHex: string,
  _useCIP36 = true, // TODO: Implement CIP36 support
  plutusData?: Array<{data?: string}>,
): Promise<{
  id: string
  encodedTx: Uint8Array
}> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const key = wasm.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
    const addressing: Addressing = {
      path: [
        purpose,
        2147485463, // CARDANO
        2147483648,
      ],
      startLevel: 1,
    }
    const isSameArray = (array1: Array<number>, array2: Array<number>) =>
      array1.length === array2.length &&
      array1.every((value, index) => value === array2[index])

    const findWitness = (path: Array<number>): string => {
      for (const witness of signedLedgerTx.witnesses) {
        if (isSameArray(witness.path, path)) {
          return witness.witnessSignatureHex
        }
      }

      throw new Error(
        `buildSignedTransaction no witness for ${JSON.stringify(path)}`,
      )
    }
    const keyLevel = addressing.startLevel + addressing.path.length - 1
    const witSet = wasm.TransactionWitnessSet.new()
    const bootstrapWitnesses: Array<BootstrapWitness> = []
    const vkeys: Array<Vkeywitness> = []
    const plutusDataWits = wasm.PlutusList.new()

    // Note: Ledger removes duplicate witnesses
    // but there may be a one-to-many relationship
    // ex: same witness is used in both a bootstrap witness and a vkey witness
    const seenVKeyWit = new Set<string>()
    const seenBootstrapWit = new Set<string>()
    for (const utxo of unsignedTx.senderUtxos) {
      verifyFromBip44Root(utxo.addressing)
      const witness = findWitness(utxo.addressing.path)
      const addressKey = derivePublicByAddressing(utxo.addressing, {
        level: keyLevel,
        key,
      })

      if (wasm.ByronAddress.isValid(utxo.receiver)) {
        const byronAddr = wasm.ByronAddress.fromBase58(utxo.receiver)
        const bootstrapWit = wasm.BootstrapWitness.new(
          csl.Vkey.new(addressKey.toRawKey()),
          csl.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
          addressKey.chaincode(),
          byronAddr.attributes(),
        )
        const asString = Buffer.from(bootstrapWit.toBytes()).toString('hex')

        if (seenBootstrapWit.has(asString)) {
          continue
        }

        seenBootstrapWit.add(asString)
        bootstrapWitnesses.push(bootstrapWit)
        continue
      }

      const vkeyWit = wasm.Vkeywitness.new(
        csl.Vkey.new(addressKey.toRawKey()),
        csl.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
      )
      const asString = Buffer.from(vkeyWit.toBytes()).toString('hex')

      if (seenVKeyWit.has(asString)) {
        continue
      }

      seenVKeyWit.add(asString)
      vkeys.push(vkeyWit)
    }

    // add any staking key needed
    for (const witness of signedLedgerTx.witnesses) {
      const addressing: Addressing = {
        path: witness.path,
        startLevel: 1,
      }
      verifyFromBip44Root(addressing)

      if (witness.path[3] === 2) {
        const stakingKey = derivePublicByAddressing(addressing, {
          level: keyLevel,
          key,
        })
        const vkeyWit = wasm.Vkeywitness.new(
          csl.Vkey.new(stakingKey.toRawKey()),
          csl.Ed25519Signature.fromBytes(
            Buffer.from(witness.witnessSignatureHex, 'hex'),
          ),
        )
        const asString = Buffer.from(vkeyWit.toBytes()).toString('hex')

        if (seenVKeyWit.has(asString)) {
          continue
        }

        seenVKeyWit.add(asString)
        vkeys.push(vkeyWit)
      }
    }

    if (bootstrapWitnesses.length > 0) {
      const bootstrapWitWasm = wasm.BootstrapWitnesses.new()

      for (const bootstrapWit of bootstrapWitnesses) {
        bootstrapWitWasm.add(bootstrapWit)
      }

      witSet.setBootstraps(bootstrapWitWasm)
    }

    if (vkeys.length > 0) {
      const vkeyWitWasm = wasm.Vkeywitnesses.new()

      for (const vkey of vkeys) {
        vkeyWitWasm.add(vkey)
      }

      witSet.setVkeys(vkeyWitWasm)
    }

    // TODO: Handle auxiliary data and catalyst registration
    // This will need to be implemented when we migrate those utilities
    // let auxData = unsignedTx.auxiliaryData
    // if (unsignedTx.catalystRegistrationData) {
    //   auxData = generateRegistrationMetadata(...)
    // }

    // if (auxData) {
    //   unsignedTx.txBuilder.setAuxiliaryData(auxData)
    // }

    if (plutusData) {
      for (const datum of plutusData) {
        if (datum.data) {
          const plutusDatum = wasm.PlutusData.fromHex(datum.data)
          plutusDataWits.add(plutusDatum)
        }
      }
    }

    if (plutusDataWits.len() > 0) witSet.setPlutusData(plutusDataWits)

    // TODO: handle script witnesses
    const txBody = unsignedTx.txBuilder.build()
    const signedTx = wasm.Transaction.new(
      txBody as any,
      witSet,
      undefined, // auxData - TODO: implement
    )
    const encodedTx = signedTx.toBytes()

    // Calculate transaction hash
    const txHash = await hashTransaction(wasm, encodedTx)
    const id = txHash.toHex()
    const ledgerTxHashHex = signedLedgerTx.txHashHex

    if (id !== ledgerTxHashHex) {
      throw new Error(
        `buildLedgerSignedTx: TxId mismatch. Ledger: ${ledgerTxHashHex} Reconstructed: ${id}`,
      )
    }

    return {
      id,
      encodedTx,
    }
  })
}

/**
 * Create signed transaction from CBOR and Ledger signature data
 */
export async function createSignedLedgerTxFromCbor(
  cbor: string,
  signedData: SignedTransactionData,
  purpose: number,
  publicKeyHex: string,
): Promise<Uint8Array> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const fixedTx = wasm.FixedTransaction.fromHex(cbor)
    if (!fixedTx) throw new Error('invalid tx hex')

    const addressing: Addressing = {
      path: [
        purpose,
        2147485463, // CARDANO
        2147483648,
      ],
      startLevel: 1,
    }

    const key = wasm.Bip32PublicKey.fromBytes(Buffer.from(publicKeyHex, 'hex'))
    const keyLevel = addressing.startLevel + addressing.path.length - 1

    for (let i = 0; i < signedData.witnesses.length; i++) {
      const witnessData = signedData.witnesses[i]
      if (!witnessData) continue

      const addressKey = derivePublicByAddressing(
        {startLevel: 1, path: witnessData.path},
        {level: keyLevel, key},
      )
      const witness = wasm.Vkeywitness.new(
        csl.Vkey.new(addressKey.toRawKey()),
        csl.Ed25519Signature.fromBytes(
          Buffer.from(witnessData.witnessSignatureHex, 'hex'),
        ),
      )
      if (!witness)
        throw new Error('invalid tx hex, could not generate vkey witness')
      fixedTx.addVkeyWitness(witness)
    }

    const txHashHex = fixedTx.transactionHash().toHex()

    if (txHashHex !== signedData.txHashHex) {
      throw new Error(
        `createSignedLedgerTxFromCbor: TxId mismatch. Ledger: ${signedData.txHashHex} Reconstructed: ${txHashHex}`,
      )
    }

    return fixedTx.toBytes()
  })
}

/**
 * Sign raw transaction with private keys
 */
export async function signRawTransaction(
  cbor: string,
  pKeys: PrivateKey[],
): Promise<Uint8Array> {
  return CardanoMobileWrapped.cslScope((wasm) => {
    const fixedTx = wasm.FixedTransaction.fromHex(cbor)
    if (!fixedTx) throw new Error('invalid tx hex')

    for (let i = 0; i < pKeys.length; i++) {
      const pKey = pKeys[i]
      if (!pKey) continue
      fixedTx.signAndAddVkeySignature(pKey)
    }

    return fixedTx.toBytes()
  })
}
