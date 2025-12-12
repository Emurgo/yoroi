import {Wallet} from '@yoroi/types'

import {createAddressGenerator} from './account-manager'

export const deriveAddressFromXPub = async ({
  count,
  chainId,
  role,
  implementation,
  accountPubKeyHex,
}: {
  count: number
  chainId: number
  role: number
  implementation: Wallet.Implementation
  accountPubKeyHex: string
}) => {
  const addrGenerator = createAddressGenerator(
    accountPubKeyHex,
    role,
    implementation,
    chainId,
  )
  const addresses = await addrGenerator.generate([...Array(count).keys()])

  return addresses
}
