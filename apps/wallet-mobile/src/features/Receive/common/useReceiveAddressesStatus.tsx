import * as React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet'
import {AddressMode} from '../../../wallet-manager/types'
import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'

type ReceiveAddressesStatus = {
  used: string[]
  unused: string[]
  next: string
}
export const useReceiveAddressesStatus = (addressMode: AddressMode): Readonly<ReceiveAddressesStatus> => {
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)

  const isSingle = addressMode === 'single'
  const singleAddress = receiveAddresses[0]

  return React.useMemo(() => {
    const addressesStatus = receiveAddresses.reduce(
      (addresses, address) => {
        if (wallet.isUsedAddressIndex[address]) {
          addresses.used = [...addresses.used, address]
        } else {
          addresses.unused = [...addresses.unused, address]
        }
        return addresses
      },
      {used: [], unused: []} as Omit<ReceiveAddressesStatus, 'next'>,
    )
    const multipleAddress = addressesStatus.unused[0] ?? addressesStatus.used[0]
    const nextAddress = isSingle ? singleAddress : multipleAddress
    const result: ReceiveAddressesStatus = {
      used: addressesStatus.used,
      unused: addressesStatus.unused,
      next: nextAddress,
    } as const
    return result
  }, [isSingle, receiveAddresses, singleAddress, wallet.isUsedAddressIndex])
}
