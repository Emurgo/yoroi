import {useSelectedWallet} from '../../../SelectedWallet'
import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'

type Addresses = {
  used: string[]
  unused: string[]
}

export const useAddresses = (): Addresses => {
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)
  const isUsedAddressIndex = wallet.isUsedAddressIndex

  return receiveAddresses.reduce(
    (addresses, address) => {
      isUsedAddressIndex[address]
        ? (addresses.used = [...addresses.used, address])
        : (addresses.unused = [...addresses.unused, address])
      return addresses
    },
    {used: [], unused: []} as Addresses,
  )
}
