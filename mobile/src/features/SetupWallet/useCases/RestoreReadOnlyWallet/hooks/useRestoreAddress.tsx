import {validateAndExtractAddressInfo} from '@yoroi/tx'

import * as React from 'react'

import {
  AddressErrorInvalid,
  AddressErrorWrongNetwork,
} from '~/features/Send/common/errors'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'

export const useRestoreAddress = (address: string) => {
  const {selected} = useWalletManager()
  const {chainId} = selected.networkManager

  const [addressValidated, setAddressValidated] = React.useState<
    boolean | undefined
  >(undefined)
  const [addressError, setAddressError] = React.useState<Error | undefined>(
    undefined,
  )
  const [isValidatingAddress, setIsValidatingAddress] = React.useState(false)

  React.useEffect(() => {
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
  }, [address, chainId])

  return {
    addressValidated,
    addressError,
    isValidatingAddress,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = async (address: string, chainId: number) => {
  try {
    const addressInfo = await validateAndExtractAddressInfo(address)

    if (!addressInfo) {
      throw new AddressErrorInvalid()
    }

    if (addressInfo.networkId !== chainId) {
      throw new AddressErrorWrongNetwork()
    }

    return true
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Address validation failed')
  }
}
