import {useTransfer} from '@yoroi/transfer'

import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

import {AddressErrorInvalid, AddressErrorWrongNetwork} from './errors'

export const useSendAddress = () => {
  const {wallet} = useSelectedWallet()
  const {chainId} = wallet.networkManager

  const {targets, selectedTargetIndex} = useTransfer()
  const {address} = targets[selectedTargetIndex].entry

  const {addressValidated, addressError} = React.useMemo(() => {
    if (address.length === 0) {
      return {addressValidated: undefined, addressError: undefined}
    }

    try {
      validateAddress(address, chainId)
      return {addressValidated: true, addressError: undefined}
    } catch (error) {
      return {addressValidated: false, addressError: error as Error}
    }
  }, [address, chainId])

  return {
    addressValidated,
    addressError,
    isValidatingAddress: false,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = (address: string, chainId: number) => {
  try {
    const chainAddress = CardanoMobileWrapped.cslScope((csl) => {
      return normalizeToAddress(csl, address)
    })
    if (!chainAddress) throw new AddressErrorInvalid()

    const chainAddressChainId = chainAddress.networkId()
    if (chainAddressChainId !== chainId) throw new AddressErrorWrongNetwork()

    return true
  } catch (error) {
    // Ensure we throw a proper Error object for React Query
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Address validation failed')
  }
}
