// Ledger Plutus transaction payload building
// Functions for building Ledger payloads for Plutus (smart contract) transactions

import {
  SignTransactionRequest,
  TransactionSigningMode,
  TxInput,
  TxRequiredSignerType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {Ed25519KeyHash, WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Addressing, AddressingAddress} from '../types'
import {assertTagsState, doAllSetsHaveTag, transformToLedgerOutputs} from './transform'

type CreateLedgerPlutusPayloadParams = {
  wasm: WasmModuleProxy
  cbor: string
  addresses: Array<AddressingAddress>
  networkId: number
  protocolMagic: number
  purpose: number
  getUtxoAddressing: (txId: string, index: number) => Addressing | null
  getAddressAddressing: (address: string) => Addressing | null
  stakeVKHash: Ed25519KeyHash
}

/**
 * Create Ledger payload for Plutus (smart contract) transactions
 * @deprecated This function is for Plutus transactions. For regular transactions, use buildLedgerPayload()
 */
export const createLedgerPlutusPayload = async (
  params: CreateLedgerPlutusPayloadParams,
): Promise<SignTransactionRequest> => {
  const {
    wasm,
    cbor,
    addresses,
    networkId,
    protocolMagic,
    getUtxoAddressing,
    getAddressAddressing,
    stakeVKHash,
  } = params
  const tx = await wasm.Transaction.fromHex(cbor)
  const body = await tx.body()

  await assertTagsState(wasm, cbor)

  const ttl = await body.ttl().then((n) => n?.toString())

  const fee = await body.fee().then((n) => n.toStr())

  const scriptDataHashHex = await body.scriptDataHash().then((h) => h?.toHex())
  const changeAddrs = addresses

  const getAddressingPath = (txId: string, index: number) => {
    return getUtxoAddressing(txId, index)?.path ?? null
  }

  const outputs = await transformToLedgerOutputs(wasm, {
    networkId,
    txOutputs: await body.outputs(),
    changeAddrs,
  })

  const originalRequiredSigners = await getRequiredSigners(body)

  const requiredSigners = await Promise.all(
    originalRequiredSigners.map(async (s) => {
      const paymentStakeCredential = await wasm.Credential.fromKeyhash(s)
      const stakeCredential = await wasm.Credential.fromKeyhash(stakeVKHash)
      const baseAddress = await wasm.BaseAddress.new(
        networkId,
        paymentStakeCredential,
        stakeCredential,
      )
      const addressing = getAddressAddressing(
        await baseAddress.toAddress().then((a) => a.toBech32(undefined)),
      )
      if (!addressing)
        throw new Error(
          `Could not find addressing for required signer: ${await s.toHex()}`,
        )
      const path = addressing.path
      return {type: TxRequiredSignerType.PATH as const, path}
    }),
  )

  return {
    signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
    tx: {
      fee,
      inputs: await body.inputs().then(async (inputs) => {
        const inputsArray: TxInput[] = []
        for (let i = 0; i < (await inputs.len()); i++) {
          const input = await inputs.get(i)
          const txId = await input.transactionId().then((t) => t.toHex())
          const txIndex = await input.index()
          const path = getAddressingPath(txId, txIndex)
          if (!path) {
            console.warn(
              'Could not find path for TX input: ' + txId + ':' + txIndex,
            )
          }
          inputsArray.push({txHashHex: txId, outputIndex: txIndex, path})
        }
        return inputsArray
      }),
      collateralInputs: await body.collateral().then(async (collateral) => {
        const collateralArray: TxInput[] = []
        if (!collateral) return collateralArray
        for (let i = 0; i < (await collateral.len()); i++) {
          const input = await collateral.get(i)
          const txId = await input.transactionId().then((t) => t.toHex())
          const txIndex = await input.index()
          collateralArray.push({
            txHashHex: txId,
            outputIndex: txIndex,
            path: getAddressingPath(txId, txIndex),
          })
        }
        return collateralArray
      }),
      ...(ttl ? {ttl} : {}),
      requiredSigners,
      outputs,
      network: {
        networkId,
        protocolMagic,
      },
      scriptDataHashHex,
    },
    additionalWitnessPaths: [],
    options: {
      tagCborSets: await doAllSetsHaveTag(wasm, cbor),
    },
  }
}

const getRequiredSigners = async (
  body: {
    requiredSigners(): Promise<{
      len(): Promise<number>
      get(index: number): Promise<Ed25519KeyHash>
    } | null>
  },
): Promise<Array<Ed25519KeyHash>> => {
  const signers = await body.requiredSigners()
  const signersArray: Array<Ed25519KeyHash> = []
  if (signers) {
    for (let i = 0; i < (await signers.len()); i++) {
      const signer = await signers.get(i)
      signersArray.push(signer)
    }
  }
  return signersArray
}

