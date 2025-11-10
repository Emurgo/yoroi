// Ledger signer utilities
// Functions for determining required signers for transactions
import {Ed25519KeyHash, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {Addressing, CardanoAddressedUtxo} from '../types'

type GetAllSignersOptions = {
  wasm: WasmModuleProxy
  body: {
    requiredSigners(): Promise<{
      len(): Promise<number>
      get(index: number): Promise<Ed25519KeyHash>
    } | null>
    inputs(): Promise<{
      len(): Promise<number>
      get(index: number): Promise<{
        transactionId(): Promise<{toHex(): Promise<string>}>
        index(): Promise<number>
      }>
    }>
    collateral(): Promise<{
      len(): Promise<number>
      get(index: number): Promise<{
        transactionId(): Promise<{toHex(): Promise<string>}>
        index(): Promise<number>
      }>
    } | null>
  }
  networkId: number
  stakeVKHash: Ed25519KeyHash
  stakingKeyPath?: number[]
  partial?: boolean
  utxos: Array<CardanoAddressedUtxo>
  getAddressAddressing: (address: string) => Addressing | null
}

/**
 * Get all required signers for a transaction
 * Returns addressing information for all inputs, collateral, and required signers
 */
export const getAllSigners = async ({
  wasm,
  body,
  networkId,
  stakeVKHash,
  stakingKeyPath,
  partial = true,
  utxos,
  getAddressAddressing,
}: GetAllSignersOptions): Promise<Addressing[]> => {
  const requiredSignersAddressing = await getRequiredSignersAddressing({
    wasm,
    body,
    networkId,
    stakeVKHash,
    getAddressAddressing,
    partial,
    stakingKeyPath,
  })
  const inputsAddressing = await getInputsAddressing(body, utxos, partial)
  const collateralAddressing = await getCollateralAddressing(
    body,
    utxos,
    partial,
  )
  return [
    ...requiredSignersAddressing,
    ...inputsAddressing,
    ...collateralAddressing,
  ]
}

const getInputsAddressing = async (
  body: GetAllSignersOptions['body'],
  utxos: Array<CardanoAddressedUtxo>,
  partial = true,
): Promise<Addressing[]> => {
  const inputs = await body.inputs()

  const inputUtxos: CardanoAddressedUtxo[] = []

  for (let i = 0; i < (await inputs.len()); i++) {
    const input = await inputs.get(i)
    const txId = await input.transactionId().then((t) => t.toHex())
    const txIndex = await input.index()
    const matchingUtxo = utxos.find(
      (utxo) => utxo.txHash === txId && utxo.txIndex === txIndex,
    )
    if (!matchingUtxo) {
      if (!partial)
        throw new Error(`Could not find input utxo: ${txId}:${txIndex}`)
      continue
    }
    inputUtxos.push(matchingUtxo)
  }

  return inputUtxos.map((u) => u.addressing)
}

const getCollateralAddressing = async (
  body: GetAllSignersOptions['body'],
  utxos: Array<CardanoAddressedUtxo>,
  partial = true,
): Promise<Addressing[]> => {
  const collateral = await body.collateral()

  if (!collateral) return []

  const collateralUtxos: CardanoAddressedUtxo[] = []

  for (let i = 0; i < (await collateral.len()); i++) {
    const input = await collateral.get(i)
    const txId = await input.transactionId().then((t) => t.toHex())
    const txIndex = await input.index()
    const matchingUtxo = utxos.find(
      (utxo) => utxo.txHash === txId && utxo.txIndex === txIndex,
    )
    if (!matchingUtxo) {
      if (!partial)
        throw new Error(`Could not find collateral utxo: ${txId}:${txIndex}`)
      continue
    }
    collateralUtxos.push(matchingUtxo)
  }

  return collateralUtxos.map((u) => u.addressing)
}

type GetRequiredSignersAddressing = {
  wasm: WasmModuleProxy
  body: GetAllSignersOptions['body']
  networkId: number
  stakeVKHash: Ed25519KeyHash
  getAddressAddressing: (address: string) => Addressing | null
  partial?: boolean
  stakingKeyPath?: number[]
}

const getRequiredSignersAddressing = async ({
  wasm,
  body,
  networkId,
  stakeVKHash,
  getAddressAddressing,
  partial = true,
  stakingKeyPath,
}: GetRequiredSignersAddressing): Promise<Addressing[]> => {
  const requiredSigners = await body.requiredSigners()
  if (!requiredSigners) return []

  const signersArray: Array<Ed25519KeyHash> = []
  for (let i = 0; i < (await requiredSigners.len()); i++) {
    const signer = await requiredSigners.get(i)
    signersArray.push(signer)
  }

  const addressingArray: Addressing[] = []

  for (const signer of signersArray) {
    if (stakingKeyPath) {
      addressingArray.push({
        path: stakingKeyPath,
        startLevel: 1,
      })
      continue
    }

    const paymentStakeCredential = await wasm.Credential.fromKeyhash(signer)
    const stakeCredential = await wasm.Credential.fromKeyhash(stakeVKHash)
    const baseAddress = await wasm.BaseAddress.new(
      networkId,
      paymentStakeCredential,
      stakeCredential,
    )
    const bech32Address = await baseAddress
      .toAddress()
      .then((a) => a.toBech32(undefined))
    const addressing = getAddressAddressing(bech32Address)
    if (!addressing) {
      if (!partial) {
        throw new Error(
          `Could not find addressing for required signer: ${await signer.toHex()}`,
        )
      }
      continue
    }
    addressingArray.push(addressing)
  }

  return addressingArray
}
