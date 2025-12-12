// Ledger Plutus transaction payload building
// Functions for building Ledger payloads for Plutus (smart contract) transactions
import {CardanoMobileWrapped} from '@yoroi/common'
import {getLogger} from '@yoroi/logger'

import {
  SignTransactionRequest,
  TransactionSigningMode,
  TxInput,
  TxRequiredSignerType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {Ed25519KeyHash, TransactionBody} from '@emurgo/cross-csl-core'

import {Addressing, AddressingAddress} from '../types'
import {
  assertTagsState,
  doAllSetsHaveTag,
  transformToLedgerOutputs,
} from './transform'

type CreateLedgerPlutusPayloadParams = {
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
    cbor,
    addresses,
    networkId,
    protocolMagic,
    getUtxoAddressing,
    getAddressAddressing,
    stakeVKHash,
  } = params

  return CardanoMobileWrapped.cslScope(async (csl) => {
    const tx = csl.Transaction.fromHex(cbor)
    const body = tx.body()

    assertTagsState(csl, cbor)

    const ttl = body.ttl()?.toString()

    const fee = body.fee().toStr()

    const scriptDataHashHex = body.scriptDataHash()?.toHex()
    const changeAddrs = addresses

    const getAddressingPath = (txId: string, index: number) => {
      return getUtxoAddressing(txId, index)?.path ?? null
    }

    const outputs = await transformToLedgerOutputs(csl, {
      networkId,
      txOutputs: body.outputs(),
      changeAddrs,
    })

    const originalRequiredSigners = getRequiredSigners(body)

    const requiredSigners = originalRequiredSigners.map((s) => {
      const paymentStakeCredential = csl.Credential.fromKeyhash(s)
      const stakeCredential = csl.Credential.fromKeyhash(stakeVKHash)
      const baseAddress = csl.BaseAddress.new(
        networkId,
        paymentStakeCredential,
        stakeCredential,
      )
      const addressing = getAddressAddressing(
        baseAddress.toAddress().toBech32(undefined),
      )
      if (!addressing)
        throw new Error(
          `Could not find addressing for required signer: ${s.toHex()}`,
        )
      const path = addressing.path
      return {type: TxRequiredSignerType.PATH as const, path}
    })

    const inputs = body.inputs()
    const inputsArray: TxInput[] = []
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i)
      const txId = input.transactionId().toHex()
      const txIndex = input.index()
      const path = getAddressingPath(txId, txIndex)
      if (!path) {
        getLogger().warn(
          'createLedgerPlutusPayload: Could not find addressing path for transaction input',
          {
            txId,
            txIndex,
            inputIndex: i,
            function: 'createLedgerPlutusPayload',
          },
        )
      }
      inputsArray.push({txHashHex: txId, outputIndex: txIndex, path})
    }

    const collateral = body.collateral()
    const collateralArray: TxInput[] = []
    if (collateral) {
      for (let i = 0; i < collateral.len(); i++) {
        const input = collateral.get(i)
        const txId = input.transactionId().toHex()
        const txIndex = input.index()
        collateralArray.push({
          txHashHex: txId,
          outputIndex: txIndex,
          path: getAddressingPath(txId, txIndex),
        })
      }
    }

    return {
      signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
      tx: {
        fee,
        inputs: inputsArray,
        collateralInputs: collateralArray,
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
        tagCborSets: await doAllSetsHaveTag(csl, cbor),
      },
    }
  })
}

const getRequiredSigners = (body: TransactionBody): Array<Ed25519KeyHash> => {
  const signers = body.requiredSigners()
  const signersArray: Array<Ed25519KeyHash> = []
  if (signers) {
    for (let i = 0; i < signers.len(); i++) {
      const signer = signers.get(i)
      signersArray.push(signer)
    }
  }
  return signersArray
}
