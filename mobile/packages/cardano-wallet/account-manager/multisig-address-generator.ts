/**
 * Address generator for multisig (script) wallets
 * Derives addresses from native script hashes instead of public keys
 */
import {Address, ScriptCbor} from '@yoroi/types'

import type {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoMobileWrapped} from '../wrappedCsl'

/**
 * Parameters for creating a multisig address generator
 */
type MultisigAddressGeneratorParams = {
  paymentScriptCbor: ScriptCbor
  stakingScriptCbor: ScriptCbor
  chainId: number
}

/**
 * Address generator for multisig wallets
 */
export type MultisigAddressGenerator = {
  readonly paymentScriptCbor: ScriptCbor
  readonly stakingScriptCbor: ScriptCbor
  readonly chainId: number
  generateBaseAddress(): Address
  generateRewardAddress(): string
}

/**
 * Create a multisig address generator
 * Generates addresses from native script hashes
 */
export const createMultisigAddressGenerator = ({
  paymentScriptCbor,
  stakingScriptCbor,
  chainId,
}: MultisigAddressGeneratorParams): MultisigAddressGenerator => {
  return {
    paymentScriptCbor,
    stakingScriptCbor,
    chainId,

    generateBaseAddress(): Address {
      return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
        // Parse payment script
        const paymentScript = csl.NativeScript.fromHex(paymentScriptCbor)
        if (!paymentScript) {
          throw new Error('Invalid payment script CBOR')
        }

        // Get script hash for payment credential
        const paymentScriptHash = paymentScript.hash()
        const paymentCredential =
          csl.Credential.fromScriptHash(paymentScriptHash)

        if (!paymentCredential) {
          throw new Error(
            'Failed to create payment credential from script hash',
          )
        }

        // Parse staking script
        const stakingScript = csl.NativeScript.fromHex(stakingScriptCbor)
        if (!stakingScript) {
          throw new Error('Invalid staking script CBOR')
        }

        // Get script hash for staking credential
        const stakingScriptHash = stakingScript.hash()
        const stakingCredential =
          csl.Credential.fromScriptHash(stakingScriptHash)

        if (!stakingCredential) {
          throw new Error(
            'Failed to create staking credential from script hash',
          )
        }

        // Create base address with script credentials
        const baseAddress = csl.BaseAddress.new(
          chainId,
          paymentCredential,
          stakingCredential,
        )

        if (!baseAddress) {
          throw new Error(
            'Failed to create base address from script credentials',
          )
        }

        const address = baseAddress.toAddress()
        const bech32Address = address.toBech32()

        return bech32Address as Address
      })
    },

    generateRewardAddress(): string {
      return CardanoMobileWrapped.cslScope((csl: WasmModuleProxy) => {
        // Parse staking script
        const stakingScript = csl.NativeScript.fromHex(stakingScriptCbor)
        if (!stakingScript) {
          throw new Error('Invalid staking script CBOR')
        }

        // Get script hash for staking credential
        const stakingScriptHash = stakingScript.hash()
        const stakingCredential =
          csl.Credential.fromScriptHash(stakingScriptHash)

        if (!stakingCredential) {
          throw new Error(
            'Failed to create staking credential from script hash',
          )
        }

        // Create reward address with script credential
        const rewardAddress = csl.RewardAddress.new(chainId, stakingCredential)

        if (!rewardAddress) {
          throw new Error(
            'Failed to create reward address from script credential',
          )
        }

        const address = rewardAddress.toAddress()
        const rewardAddressBytes = address.toBytes()
        const rewardAddressHex = Buffer.from(rewardAddressBytes).toString('hex')

        return rewardAddressHex
      })
    },
  }
}
