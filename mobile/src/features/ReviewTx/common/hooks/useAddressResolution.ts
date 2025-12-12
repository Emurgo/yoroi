import {Resolver} from '@yoroi/types'

import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import {logger} from '~/kernel/logger/logger'

/**
 * Hook to resolve address aliases (AdaHandle, CNS, DRep, etc.)
 */
export const useAddressResolution = (
  address: string | null,
  resolverApi?: Resolver.Api,
) => {
  return useQuery<Resolver.AddressesResponse | null>({
    queryKey: ['addressResolution', address],
    queryFn: async () => {
      if (!address || !resolverApi) return null

      // Try to resolve as AdaHandle, CNS, or other aliases
      // The resolver package handles multiple name servers
      try {
        const response = await resolverApi.getCardanoAddresses({
          resolve: address,
          strategy: 'first', // Get first successful resolution
        })
        return response
      } catch (error) {
        logger.error('Failed to resolve address', {error, address})
        return null
      }
    },
    enabled: !!address && !!resolverApi,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

/**
 * Hook to resolve multiple addresses at once
 */
export const useManyAddressResolution = (
  addresses: string[],
  resolverApi?: Resolver.Api,
) => {
  const uniqueAddresses = useMemo(
    () => Array.from(new Set(addresses)),
    [addresses],
  )

  return useQuery<Record<string, Resolver.AddressesResponse | null>>({
    queryKey: ['addressResolution', uniqueAddresses],
    queryFn: async () => {
      if (!resolverApi || uniqueAddresses.length === 0) return {}

      const results = await Promise.all(
        uniqueAddresses.map(async (address) => {
          try {
            const response = await resolverApi.getCardanoAddresses({
              resolve: address,
              strategy: 'first',
            })
            return {address, response}
          } catch (error) {
            logger.error(`Failed to resolve address ${address}`, {
              error,
              address,
            })
            return {address, response: null}
          }
        }),
      )

      return results.reduce(
        (acc, {address, response}) => {
          acc[address] = response
          return acc
        },
        {} as Record<string, Resolver.AddressesResponse | null>,
      )
    },
    enabled: uniqueAddresses.length > 0 && !!resolverApi,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

/**
 * Extract resolved name from address resolution response
 */
export const getResolvedName = (
  response: Resolver.AddressesResponse | null,
): string | null => {
  if (!response) return null

  // The response is an array of address responses
  // We can return the first resolved address as the "name"
  if (Array.isArray(response) && response.length > 0) {
    const firstResponse = response[0]
    if (firstResponse?.address) {
      // For now, return the resolved address as the name
      // This could be enhanced to extract a more user-friendly name
      return firstResponse.address
    }
  }

  return null
}
