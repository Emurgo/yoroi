import {normalizeToAddress} from '@emurgo/yoroi-lib/dist/internals/utils/addresses'
import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {useTransfer} from '@yoroi/transfer'
import * as React from 'react'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {CardanoMobile} from '~/wallets/wallets'
import {AddressErrorInvalid, AddressErrorWrongNetwork} from './errors'

export const useSendAddress = () => {
  const {wallet} = useSelectedWallet()
  const {chainId} = wallet.networkManager

  const {targets, selectedTargetIndex} = useTransfer()
  const {address} = targets[selectedTargetIndex].entry

  const {
    addressValidated,
    isLoading: isValidatingAddress,
    error: addressError,
    refetch,
  } = useValidateAddress({address, chainId})

  React.useEffect(() => {
    if (address.length === 0) return

    refetch()
  }, [address, refetch])

  return {
    addressValidated,
    addressError,
    isValidatingAddress,
  }
}

const useValidateAddress = (
  {address, chainId}: {address: string; chainId: number},
  options?: UseQueryOptions<
    boolean,
    Error,
    boolean,
    ['useValidateAddress', string, number]
  >,
) => {
  const query = useQuery({
    ...options,
    staleTime: 0,
    gcTime: 0,
    queryKey: ['useValidateAddress', address, chainId],
    queryFn: () => validateAddress(address, chainId),
    retry: false, // Don't retry validation failures
    // Prevent dehydration of validation queries to avoid hydration errors
    meta: {
      shouldDehydrate: false,
    },
  })

  return {
    ...query,
    addressValidated: query.data,
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
    // Ensure we throw a proper Error object for React Query
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Address validation failed')
  }
}
