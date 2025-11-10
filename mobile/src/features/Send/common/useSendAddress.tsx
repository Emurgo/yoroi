import {useTransfer} from '@yoroi/transfer'
import {normalizeToAddress} from '@yoroi/tx'

import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {CardanoMobile} from '~/wallets/wallets'

import {AddressErrorInvalid, AddressErrorWrongNetwork} from './errors'

export const useSendAddress = () => {
  const {wallet} = useSelectedWallet()
  const {chainId} = wallet.networkManager

  const {targets, selectedTargetIndex} = useTransfer()
  const target = targets[selectedTargetIndex]

  const {addressValidated, addressError} = React.useMemo(() => {
    if (!target) return {addressValidated: undefined, addressError: undefined}

    const {address} = target.entry
    if (address.length === 0) {
      return {addressValidated: undefined, addressError: undefined}
    }

    try {
      validateAddress(address, chainId)
      return {addressValidated: true, addressError: undefined}
    } catch (error) {
      return {addressValidated: false, addressError: error as Error}
    }
  }, [target, chainId])

  return {
    addressValidated,
    addressError,
    isValidatingAddress: false,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = (address: string, chainId: number) => {
  try {
    const chainAddress = normalizeToAddress(CardanoMobile, address)
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
