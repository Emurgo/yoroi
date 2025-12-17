// Ledger signer utilities
// Functions for determining required signers for transactions
import {CardanoMobileWrapped} from '@yoroi/common'
import {Address} from '@yoroi/types'

import {Ed25519KeyHash, WasmModuleProxy} from '@emurgo/cross-csl-core'

import {Addressing, CardanoAddressedUtxo} from '../types'

type GetAllSignersOptions = {
  body: {
    requiredSigners(): {
      len(): number
      get(index: number): Ed25519KeyHash
    } | null
    inputs(): {
      len(): number
      get(index: number): {
        transactionId(): {toHex(): string}
        index(): number
      }
    }
    collateral(): {
      len(): number
      get(index: number): {
        transactionId(): {toHex(): string}
        index(): number
      }
    } | null
  }
  networkId: number
  stakeVKHash: Ed25519KeyHash
  stakingKeyPath?: number[]
  partial?: boolean
  utxos: Array<CardanoAddressedUtxo>
  getAddressAddressing: (address: Address | string) => Addressing | null
}

/**
 * Get all required signers for a transaction
 * Returns addressing information for all inputs, collateral, and required signers
 */
export const getAllSigners = async ({
  body,
  networkId,
  stakeVKHash,
  stakingKeyPath,
  partial = true,
  utxos,
  getAddressAddressing,
}: GetAllSignersOptions): Promise<Addressing[]> => {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const requiredSignersAddressing = await getRequiredSignersAddressing({
      wasm: csl,
      body,
      networkId,
      stakeVKHash,
      getAddressAddressing,
      partial,
      stakingKeyPath,
    })
    const inputsAddressing = getInputsAddressing(body, utxos, partial)
    const collateralAddressing = getCollateralAddressing(body, utxos, partial)
    return [
      ...requiredSignersAddressing,
      ...inputsAddressing,
      ...collateralAddressing,
    ]
  })
}

const getInputsAddressing = (
  body: GetAllSignersOptions['body'],
  utxos: Array<CardanoAddressedUtxo>,
  partial = true,
): Addressing[] => {
  const inputs = body.inputs()

  const inputUtxos: CardanoAddressedUtxo[] = []

  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i)
    const txId = input.transactionId().toHex()
    const txIndex = input.index()
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

const getCollateralAddressing = (
  body: GetAllSignersOptions['body'],
  utxos: Array<CardanoAddressedUtxo>,
  partial = true,
): Addressing[] => {
  const collateral = body.collateral()

  if (!collateral) return []

  const collateralUtxos: CardanoAddressedUtxo[] = []

  for (let i = 0; i < collateral.len(); i++) {
    const input = collateral.get(i)
    const txId = input.transactionId().toHex()
    const txIndex = input.index()
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
  getAddressAddressing: (address: Address | string) => Addressing | null
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
  const requiredSigners = body.requiredSigners()
  const signersArray: Array<Ed25519KeyHash> = []

  // Add explicit required signers from transaction body
  if (requiredSigners) {
    for (let i = 0; i < requiredSigners.len(); i++) {
      const signer = requiredSigners.get(i)
      signersArray.push(signer)
    }
  }

  const addressingArray: Addressing[] = []

  for (const signer of signersArray) {
    // Check if this required signer matches the wallet's staking key hash
    const signerKeyHashHex = signer.toHex()
    const walletStakingKeyHashHex = stakeVKHash.toHex()
    const isStakingKeySigner = signerKeyHashHex === walletStakingKeyHashHex

    if (stakingKeyPath && isStakingKeySigner) {
      // Only add staking key signer if the required signer actually matches our staking key
      addressingArray.push({
        path: stakingKeyPath,
        startLevel: 1,
      })
      continue
    }

    // For payment key signers, construct the address and check if wallet controls it
    const paymentStakeCredential = wasm.Credential.fromKeyhash(signer)
    const stakeCredential = wasm.Credential.fromKeyhash(stakeVKHash)
    const baseAddress = wasm.BaseAddress.new(
      networkId,
      paymentStakeCredential,
      stakeCredential,
    )
    const bech32Address = baseAddress.toAddress().toBech32(undefined)
    const addressing = getAddressAddressing(bech32Address)

    // Only include if we can get addressing AND the address is actually controlled by the wallet
    if (!addressing) {
      if (!partial) {
        throw new Error(
          `Could not find addressing for required signer: ${signer.toHex()}`,
        )
      }
      // Skip if we don't control this address (partial mode)
      continue
    }

    addressingArray.push(addressing)
  }

  return addressingArray
}
