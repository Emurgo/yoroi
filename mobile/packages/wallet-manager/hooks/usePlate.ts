import {cardanoConfig} from '@yoroi/blockchains'
import {Wallet} from '@yoroi/types'

import {walletChecksum} from '@emurgo/cip4-js'
import {useSuspenseQuery} from '@tanstack/react-query'

import {deriveAddressFromXPub} from '@yoroi/cardano-wallet/account-manager/derive-address-from-xpub'

export const usePlate = ({
  chainId,
  publicKeyHex,
  implementation,
}: {
  chainId: number
  publicKeyHex: string
  implementation: Wallet.Implementation
}) => {
  const implementationConfig = cardanoConfig.implementations[implementation]
  const query = useSuspenseQuery({
    queryKey: ['usePlate', chainId, implementation, publicKeyHex],
    queryFn: async () => {
      const addresses = await deriveAddressFromXPub({
        accountPubKeyHex: publicKeyHex,
        chainId,
        count: 1,
        implementation,
        role: implementationConfig.derivations.base.roles.external,
      })
      const accountPlate = walletChecksum(publicKeyHex)
      return {
        addresses,
        accountPlate,
      }
    },
  })

  if (!query.data) throw new Error('invalid state')

  return query.data
}
