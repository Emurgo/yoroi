import {cardanoConfig} from '@yoroi/blockchains'
import {
  CardanoMobile,
  createAddressGenerator,
  deriveAccountFromRootKey,
} from '@yoroi/cardano-wallet'
import {Wallet} from '@yoroi/types'

export type AddressData = {
  accountIndex: number
  accountPublicKey: string
  addresses: Array<{
    index: number
    address: string
    derivationPath: string
  }>
}

export async function deriveAddressesForAccounts({
  rootKeyHex,
  accountCount,
  addressesPerAccount,
  implementation,
  chainId,
}: {
  rootKeyHex: string
  accountCount: number
  addressesPerAccount: number
  implementation: Wallet.Implementation
  chainId: number
}): Promise<AddressData[]> {
  const config = cardanoConfig.implementations[implementation]
  const results: AddressData[] = []

  // Generate addresses for each account
  for (let accountIndex = 0; accountIndex < accountCount; accountIndex++) {
    // Derive account public key from root key
    const accountPubKeyHex = deriveAccountFromRootKey(
      rootKeyHex,
      accountIndex,
      implementation,
      CardanoMobile,
    )

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
