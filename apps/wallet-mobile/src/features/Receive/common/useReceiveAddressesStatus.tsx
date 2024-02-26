import * as React from 'react'

import {useSelectedWallet} from '../../../SelectedWallet'
import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'
import {AddressDerivation} from './useAddressDerivationManager'

type ReceiveAddressesStatus = {
  used: string[]
  unused: string[]
  next: string
}
export const useReceiveAddressesStatus = (addressDerivation: AddressDerivation): ReceiveAddressesStatus => {
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)

  return React.useMemo(() => {
    const next =
      (addressDerivation === 'single' ? receiveAddresses[0] : receiveAddresses[receiveAddresses.length - 1]) ?? ''
    const result: ReceiveAddressesStatus = {unused: [], used: [], next}
    return receiveAddresses.reduce((addresses, address) => {
      if (wallet.isUsedAddressIndex[address]) {
        addresses.used = [...addresses.used, address]
      } else {
        addresses.unused = [...addresses.unused, address]
      }
      return addresses
    }, result)
  }, [addressDerivation, receiveAddresses, wallet.isUsedAddressIndex])
}
