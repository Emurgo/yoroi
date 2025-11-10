import {useTransfer} from '@yoroi/transfer'
import {normalizeToAddress} from '@yoroi/tx'

import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'

import {AddressErrorInvalid, AddressErrorWrongNetwork} from './errors'

export const useSendAddress = () => {
  const {wallet} = useSelectedWallet()
  const {chainId} = wallet.networkManager

  const {targets, selectedTargetIndex} = useTransfer()
  const target = targets[selectedTargetIndex]

  const [addressValidated, setAddressValidated] = React.useState<
    boolean | undefined
  >(undefined)
  const [addressError, setAddressError] = React.useState<Error | undefined>(
    undefined,
  )
  const [isValidatingAddress, setIsValidatingAddress] = React.useState(false)

  React.useEffect(() => {
    if (!target) {
      setAddressValidated(undefined)
      setAddressError(undefined)
      return
    }

    const {address} = target.entry
    if (address.length === 0) {
      setAddressValidated(undefined)
      setAddressError(undefined)
      return
    }

    setIsValidatingAddress(true)
    validateAddress(address, chainId)
      .then(() => {
        setAddressValidated(true)
        setAddressError(undefined)
      })
      .catch((error) => {
        setAddressValidated(false)
        setAddressError(error as Error)
      })
      .finally(() => {
        setIsValidatingAddress(false)
      })
  }, [target, chainId])

  return {
    addressValidated,
    addressError,
    isValidatingAddress,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = async (address: string, chainId: number) => {
  try {
    const chainAddress = await normalizeToAddress(address)
    if (!chainAddress) throw new AddressErrorInvalid()

    const chainAddressChainId = chainAddress.networkId()
    if (chainAddressChainId !== chainId) throw new AddressErrorWrongNetwork()

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Address validation failed')
  }
}
