import {cardanoConfig} from '@yoroi/blockchains'
import {createAddressGenerator} from '@yoroi/cardano-wallet'
import {Wallet} from '@yoroi/types'

import type {AddressData} from './deriveAddresses'

/**
 * Derives addresses from stored account public keys
 * This works for hardware wallets and read-only wallets that have account public keys stored
 */
export async function deriveAddressesFromAccountPubKeys({
  accountPubKeys,
  addressesPerAccount,
  implementation,
  chainId,
}: {
  accountPubKeys: Array<{accountIndex: number; accountPubKeyHex: string}>
  addressesPerAccount: number
  implementation: Wallet.Implementation
  chainId: number
}): Promise<AddressData[]> {
  const config = cardanoConfig.implementations[implementation]
  const results: AddressData[] = []

  // Generate addresses for each account that has a stored public key
  for (const {accountIndex, accountPubKeyHex} of accountPubKeys) {
    // Create address generators for external chain (role 0)
    const externalAddressGenerator = createAddressGenerator(
      accountPubKeyHex,
      config.derivations.base.roles.external,
      implementation,
      chainId,
    )

    // Generate address indexes (0 to addressesPerAccount - 1)
    const addressIndexes = Array.from(
      {length: addressesPerAccount},
      (_, i) => i,
    )

    // Generate addresses
    const addresses = externalAddressGenerator.generate(addressIndexes)

    // Build derivation paths for each address
    const addressData = addresses.map((address, index) => {
      const derivationPath = `m/${config.derivations.base.visual.purpose}'/${config.derivations.base.visual.coinType}'/${accountIndex}'/${config.derivations.base.roles.external}/${index}`
      return {
        index,
        address: address as string,
        derivationPath,
      }
    })

    results.push({
      accountIndex,
      accountPublicKey: accountPubKeyHex,
      addresses: addressData,
    })
  }

  return results
}
