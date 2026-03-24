import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'

import {ESCROW_SCRIPT_HASH} from './constants'

/**
 * Derive the escrow address for a given eligible address.
 * The escrow address uses the escrow script hash as payment credential
 * and keeps the same staking credential from the eligible address.
 */
export async function deriveEscrowAddress(
  eligibleAddress: string,
  networkId: number,
): Promise<string> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const addr = csl.Address.fromBech32(eligibleAddress)
    const baseAddr = csl.BaseAddress.fromAddress(addr)

    const scriptCred = csl.Credential.fromScripthash(
      csl.ScriptHash.fromHex(ESCROW_SCRIPT_HASH),
    )

    if (baseAddr) {
      // Has staking credential - create BaseAddress
      const stakeCred = baseAddr.stakeCred()
      const escrowBase = csl.BaseAddress.new(networkId, scriptCred, stakeCred)
      return escrowBase.toAddress().toBech32(undefined)
    }

    // Enterprise address (no staking cred)
    const enterprise = csl.EnterpriseAddress.new(networkId, scriptCred)
    return enterprise.toAddress().toBech32(undefined)
  })
}
