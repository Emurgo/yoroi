import * as React from 'react'
import {useQuery, UseQueryOptions} from 'react-query'

import {useSelectedWallet} from '../../../SelectedWallet'
import {normalizeToAddress, toCardanoNetworkId} from '../../../yoroi-wallets/cardano/utils'
import {useSend} from './SendContext'

export const useSendAddress = () => {
  const wallet = useSelectedWallet()
  const chainId = toCardanoNetworkId(wallet.networkId)

  const {targets, selectedTargetIndex} = useSend()
  const {address} = targets[selectedTargetIndex].entry

  const {
    addressValidated,
    isLoading: isValidatingAddress,
    error: addressError,
    refetch,
  } = useValidateAddress(
    {address, chainId},
    {
      enabled: false,
    },
  )

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
  options?: UseQueryOptions<boolean, Error, boolean, ['useValidateAddress', string, number]>,
) => {
  const query = useQuery({
    ...options,
    staleTime: 0,
    cacheTime: 0,
    queryKey: ['useValidateAddress', address, chainId],
    queryFn: () => validateAddress(address, chainId),
  })

  return {
    ...query,
    addressValidated: query.data,
  }
}

// NOTE: should be a wallet function from address manager
const validateAddress = async (address: string, chainId: number) => {
  const chainAddress = await normalizeToAddress(address)
  if (!chainAddress) throw new Error('Invalid address')

  const chainAddressChainId = await chainAddress.networkId()
  if (chainAddressChainId !== chainId) throw new Error('Wrong network')

  return true
}
