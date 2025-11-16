import {
  isDomain,
  isResolvableDomain,
  useResolverCryptoAddresses,
} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'

import {useQueryClient} from '@tanstack/react-query'
import * as React from 'react'

export const useRestoreReceiver = (value: string) => {
  const queryClient = useQueryClient()

  const isUnsupportedDomain = !isResolvableDomain(value) && isDomain(value)

  const isDomainInput = isResolvableDomain(value)

  const {
    error: receiverError,
    cryptoAddresses,
    refetch,
    isLoading: isResolvingAddressess,
  } = useResolverCryptoAddresses({resolve: value})

  const isNotResolvedDomain = React.useMemo(
    () =>
      !isUnsupportedDomain &&
      !isResolvingAddressess &&
      cryptoAddresses.length > 0 &&
      cryptoAddresses.every(({error}) => error !== null),
    [cryptoAddresses, isResolvingAddressess, isUnsupportedDomain],
  )

  const isWrongBlockchainError = React.useMemo(
    () =>
      isNotResolvedDomain &&
      cryptoAddresses.some(
        ({error}) => error instanceof Resolver.Errors.WrongBlockchain,
      ),
    [cryptoAddresses, isNotResolvedDomain],
  )

  const debouncedRefetch = React.useMemo(
    () => debounceMaker(refetch, 300),
    [refetch],
  )

  const cancelPendingRequests = React.useCallback(
    () => queryClient.cancelQueries({queryKey: ['useResolverCryptoAddresses']}),
    [queryClient],
  )

  React.useEffect(() => {
    if (isDomainInput && value.trim().length > 0) {
      cancelPendingRequests().then(() => debouncedRefetch.call())
    } else {
      cancelPendingRequests()
    }
    return () => debouncedRefetch.clear()
  }, [isDomainInput, value, debouncedRefetch, cancelPendingRequests])

  // Get resolved address from cryptoAddresses
  const resolvedAddress = React.useMemo(() => {
    if (cryptoAddresses.length === 0) return null
    const successful = cryptoAddresses.find(
      ({address, error}) => address !== null && error === null,
    )
    return successful?.address ?? null
  }, [cryptoAddresses])

  const selectedNameServer = React.useMemo(() => {
    if (cryptoAddresses.length === 0) return null
    const successful = cryptoAddresses.find(
      ({address, error}) => address !== null && error === null,
    )
    return successful?.nameServer ?? null
  }, [cryptoAddresses])

  return {
    isWrongBlockchainError,
    isNotResolvedDomain,
    isResolvingAddressess,
    isUnsupportedDomain,
    receiverError,
    resolvedAddress,
    selectedNameServer,
    isDomainInput,
  }
}
const debounceMaker = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {
    clear,
    call,
  } as const
}
