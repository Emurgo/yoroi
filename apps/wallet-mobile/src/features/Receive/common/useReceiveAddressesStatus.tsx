import {Wallet} from '@yoroi/types'

import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

type ReceiveAddressesStatus = {
  used: string[]
  unused: string[]
  next: string
  canIncrease: boolean
}
export const useReceiveAddressesStatus = (addressMode: Wallet.AddressMode): Readonly<ReceiveAddressesStatus> => {
  const {wallet} = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)

  const isSingle = addressMode === 'single'
  const singleAddress = receiveAddresses[0]

  const addressesStatus = receiveAddresses.reduce(
    (addresses, address) => {
      if (wallet.isUsedAddressIndex[address]) {
        addresses.used = [...addresses.used, address]
      } else {
        addresses.unused = [...addresses.unused, address]
      }
      return addresses
    },
    {used: [], unused: []} as Omit<ReceiveAddressesStatus, 'next' | 'canIncrease'>,
  )
  const info = wallet.receiveAddressInfo
  const limitUnused = addressesStatus.unused.slice(0, info.lastUsedIndexVisual + 1)
  const multipleAddress = addressesStatus.unused[0] ?? addressesStatus.used[0]
  const nextAddress = isSingle ? singleAddress : multipleAddress
  const result: ReceiveAddressesStatus = {
    used: addressesStatus.used,
    unused: limitUnused,
    next: nextAddress,
    canIncrease: info.canIncrease,
  } as const

  return result
}
